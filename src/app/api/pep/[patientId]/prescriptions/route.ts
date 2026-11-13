import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { prescriptionCreateSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "PRESCRICAO");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    const body = await req.json();
    const parsed = prescriptionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados de prescrição inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    // Verificação estrita de permissões profissionais no backend
    if (d.type === "MEDICA" && !user.capabilities.canPrescribeMedications) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId,
        action: "ACCESS_DENIED",
        module: "PRESCRICAO",
        details: `Bloqueio RBAC: Perfil ${user.role} tentou criar Prescrição Médica privativa de Médico.`,
      });
      return NextResponse.json(
        { error: "Apenas profissionais com perfil Médico podem registrar Prescrições Médicas." },
        { status: 403 }
      );
    }

    if (d.type === "ENFERMAGEM" && !user.capabilities.canPrescribeNursingCare) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId,
        action: "ACCESS_DENIED",
        module: "PRESCRICAO",
        details: `Bloqueio RBAC: Perfil ${user.role} tentou registrar Prescrição de Enfermagem privativa do Enfermeiro.`,
      });
      return NextResponse.json(
        {
          error:
            "Acesso negado: Técnicos de Enfermagem não podem elaborar prescrições de enfermagem (privativo do Enfermeiro).",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + d.validUntilHours * 60 * 60 * 1000);
    const prescriptionNumber = `PRESC-2026-${Math.floor(10000 + Math.random() * 89999)}`;

    const created = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId,
        encounterId: d.encounterId,
        prescriberId: user.id,
        type: d.type,
        status: "VIGENTE",
        validFrom: now,
        validUntil,
        generalNotes: d.generalNotes || null,
        items: {
          create: d.items.map((item, idx) => ({
            itemOrder: idx + 1,
            category: item.category,
            description: item.description.toUpperCase(),
            observation: item.observation || null,
            dose: item.dose,
            route: item.route,
            infusionRate: item.infusionRate || null,
            frequency: item.frequency,
            condition: item.condition,
            scheduledHours: JSON.stringify(item.scheduledHours),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: d.encounterId,
      action: "CREATE_PRESCRIPTION",
      module: "PRESCRICAO",
      entityType: "Prescription",
      entityId: created.id,
      details: `Registrou Prescrição ${created.type} (${created.prescriptionNumber}) com ${created.items.length} item(ns).`,
    });

    return NextResponse.json({
      success: true,
      prescription: created,
      message: `Prescrição ${created.prescriptionNumber} registrada com sucesso.`,
    });
  } catch (error) {
    console.error("[PRESCRIPTION_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao registrar prescrição." },
      { status: 500 }
    );
  }
}

