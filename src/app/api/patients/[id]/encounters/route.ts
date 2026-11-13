import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id: patientId } = await context.params;
    const body = await req.json();
    const {
      action = "CREATE_ENCOUNTER",
      unitId,
      bedId,
      mainDiagnosis,
      mainIcd10,
      reasonForAdmission,
      isolationPrecaution = "Padrão",
      encounterId,
      dischargeSummary,
    } = body;

    if (action === "DISCHARGE" && encounterId) {
      const enc = await prisma.encounter.findUnique({
        where: { id: encounterId },
        include: { admission: true, patient: true },
      });
      if (!enc) {
        return NextResponse.json({ error: "Atendimento não localizado." }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.encounter.update({
          where: { id: encounterId },
          data: {
            status: "ALTA_HOSPITALAR",
            closedAt: new Date(),
            dischargeSummary: dischargeSummary || "Alta hospitalar melhorada com orientações.",
          },
        }),
        ...(enc.admission
          ? [
              prisma.admission.update({
                where: { id: enc.admission.id },
                data: { status: "ENCERRADA", dischargedAt: new Date() },
              }),
              prisma.bed.update({
                where: { id: enc.admission.bedId },
                data: { status: "LIVRE" },
              }),
            ]
          : []),
      ]);

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId,
        action: "DISCHARGE_ENCOUNTER",
        module: "PACIENTES",
        entityType: "Encounter",
        entityId: encounterId,
        details: `Encerrou atendimento ${enc.encounterNumber} por alta hospitalar e liberou leito.`,
      });

      return NextResponse.json({ success: true });
    }

    // Criar novo atendimento / internação para o paciente
    if (!unitId || !bedId || !mainDiagnosis || !reasonForAdmission) {
      return NextResponse.json(
        { error: "Unidade, leito, diagnóstico principal e motivo da internação são obrigatórios." },
        { status: 400 }
      );
    }

    const encounterNumber = `ATD-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    const newEncounter = await prisma.encounter.create({
      data: {
        encounterNumber,
        patientId,
        unitId,
        type: "INTERNACAO",
        status: "EM_ANDAMENTO",
        mainDiagnosis,
        mainIcd10: mainIcd10 || "R69",
        reasonForAdmission,
        riskConditions: JSON.stringify(["QUEDA"]),
        admission: {
          create: {
            patientId,
            unitId,
            bedId,
            isolationPrecaution,
            status: "ATIVA",
          },
        },
      },
    });

    await prisma.bed.update({
      where: { id: bedId },
      data: { status: "OCUPADO" },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: newEncounter.id,
      action: "CREATE_ENCOUNTER",
      module: "PACIENTES",
      entityType: "Encounter",
      entityId: newEncounter.id,
      details: `Abriu novo atendimento/internação ${newEncounter.encounterNumber} para o paciente.`,
    });

    return NextResponse.json({ success: true, encounter: newEncounter });
  } catch (error) {
    console.error("[ENCOUNTER_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao processar movimentação/internação." },
      { status: 500 }
    );
  }
}

