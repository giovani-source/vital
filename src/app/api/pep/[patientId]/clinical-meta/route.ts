import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { allergyCreateSchema, diagnosisCreateSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "PEP");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    const body = await req.json();
    const { metaType } = body; // "ALLERGY" ou "DIAGNOSIS"

    if (metaType === "ALLERGY") {
      if (!user.capabilities.canRecordAllergies) {
        return NextResponse.json(
          { error: "Seu perfil não possui permissão para registrar alergias." },
          { status: 403 }
        );
      }

      const parsed = allergyCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Dados de alergia inválidos." },
          { status: 400 }
        );
      }

      const d = parsed.data;
      const allergy = await prisma.allergy.create({
        data: {
          patientId,
          recordedById: user.id,
          category: d.category,
          substance: d.substance.trim(),
          reaction: d.reaction.trim(),
          severity: d.severity,
          reportedBy: d.reportedBy,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        action: "CREATE_ALLERGY",
        module: "PEP",
        entityType: "Allergy",
        entityId: allergy.id,
        details: `Registrou alergia (${d.category}): ${d.substance} — Reação: ${d.reaction} (${d.severity}).`,
      });

      return NextResponse.json({
        success: true,
        allergy,
        message: "Alergia registrada e adicionada ao cabeçalho de alertas do paciente.",
      });
    }

    if (metaType === "DIAGNOSIS") {
      if (!user.capabilities.canRecordMedicalDiagnosis) {
        await recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          patientId,
          action: "ACCESS_DENIED",
          module: "PEP",
          details: `Bloqueio RBAC: Perfil ${user.role} tentou cadastrar Diagnóstico Médico CID-10.`,
        });
        return NextResponse.json(
          {
            error:
              "Apenas o perfil Médico pode cadastrar diagnósticos nosológicos CID-10 (Enfermeiros registram Diagnósticos de Enfermagem na aba Processo de Enfermagem).",
          },
          { status: 403 }
        );
      }

      const parsed = diagnosisCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Dados de diagnóstico inválidos." },
          { status: 400 }
        );
      }

      const d = parsed.data;
      const diagnosis = await prisma.diagnosis.create({
        data: {
          patientId,
          encounterId: d.encounterId || null,
          authorId: user.id,
          icd10Code: d.icd10Code.toUpperCase().trim(),
          description: d.description.trim(),
          type: d.type,
          status: d.status,
          notes: d.notes || null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId || null,
        action: "CREATE_DIAGNOSIS",
        module: "PEP",
        entityType: "Diagnosis",
        entityId: diagnosis.id,
        details: `Cadastrou diagnóstico CID-10 ${diagnosis.icd10Code} — ${diagnosis.description}.`,
      });

      return NextResponse.json({
        success: true,
        diagnosis,
        message: "Diagnóstico clínico registrado com sucesso.",
      });
    }

    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  } catch (error) {
    console.error("[CLINICAL_META_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao salvar registro clínico." },
      { status: 500 }
    );
  }
}

