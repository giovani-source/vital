import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { medicationCheckSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "CHECAGEM");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    if (!user.capabilities.canCheckMedicationsAndCare) {
      return NextResponse.json(
        { error: "Seu perfil não possui permissão para realizar checagem beira-leito." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = medicationCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados de checagem inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    // Justificativa obrigatória quando não realizado, recusado ou adiado
    if (
      d.status !== "REALIZADO" &&
      (!d.justification || d.justification.trim().length < 4)
    ) {
      return NextResponse.json(
        {
          error:
            "Para registrar um item como NÃO REALIZADO, RECUSADO ou ADIADO, é obrigatório informar a justificativa clínica.",
        },
        { status: 400 }
      );
    }

    const item = await prisma.prescriptionItem.findUnique({
      where: { id: d.prescriptionItemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item prescrito não localizado." },
        { status: 404 }
      );
    }

    const checkRecord = await prisma.medicationAdministration.create({
      data: {
        prescriptionItemId: d.prescriptionItemId,
        encounterId: d.encounterId,
        checkedById: user.id,
        scheduledTime: d.scheduledTime,
        effectiveTime: new Date(),
        status: d.status,
        justification: d.justification?.trim() || null,
        batchNumber: d.batchNumber?.trim() || null,
        notes: d.notes?.trim() || null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: d.encounterId,
      action: "CHECK_MEDICATION",
      module: "CHECAGEM",
      entityType: "MedicationAdministration",
      entityId: checkRecord.id,
      details: `Checagem beira-leito: ${item.description} (${item.dose}) das ${d.scheduledTime} -> ${d.status}${d.justification ? ` (Justificativa: ${d.justification})` : ""}.`,
    });

    return NextResponse.json({
      success: true,
      administration: checkRecord,
      message:
        d.status === "REALIZADO"
          ? `Checagem realizada registrada para ${item.description} (${d.scheduledTime}).`
          : `Não realização justificada registrada no histórico de checagem.`,
    });
  } catch (error) {
    console.error("[CHECK_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao registrar checagem de medicamento/cuidado." },
      { status: 500 }
    );
  }
}

