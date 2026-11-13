import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import {
  nursingAssessmentSchema,
  nursingProcessPlanSchema,
} from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "ENFERMAGEM");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    const body = await req.json();
    const { recordType } = body; // "ASSESSMENT" (Etapa 1) ou "PROCESS_PLAN" (Etapas 2 a 5)

    // Verificação obrigatória no backend: Diagnóstico, Planejamento e Prescrição de Enfermagem são privativos do Enfermeiro (Lei 7.498/86 e COFEN 736/2024)
    if (!user.capabilities.canPrescribeNursingDiagnosisAndPlan) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        action: "ACCESS_DENIED",
        module: "ENFERMAGEM",
        details: `Bloqueio COFEN 736/2024: Perfil ${user.role} tentou registrar Avaliação/Diagnóstico/Prescrição privativos do Enfermeiro.`,
      });
      return NextResponse.json(
        {
          error:
            "Acesso negado (COFEN nº 736/2024): A Avaliação inicial, o Diagnóstico de Enfermagem e o Planejamento/Prescrição de Enfermagem são atividades privativas do Enfermeiro. Técnicos de Enfermagem realizam anotações e checagens autorizadas.",
        },
        { status: 403 }
      );
    }

    if (recordType === "ASSESSMENT") {
      const parsed = nursingAssessmentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Dados de Avaliação de Enfermagem inválidos." },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const now = new Date();

      const record = await prisma.nursingAssessment.create({
        data: {
          patientId,
          encounterId: d.encounterId,
          authorId: user.id,
          status: d.status,
          admissionReason: d.admissionReason,
          hospitalizedLast6m: d.hospitalizedLast6m,
          medicationsInUse: d.medicationsInUse || null,
          transfusionReaction: d.transfusionReaction,
          knowsHealthCondition: d.knowsHealthCondition,
          currentHistory: d.currentHistory || null,
          pastHistory: d.pastHistory || null,
          familyHistory: d.familyHistory || null,
          neuroRegulation: d.neuroRegulation,
          camScore: d.camScore,
          painPresent: d.painPresent,
          painDetails: d.painDetails || null,
          respiratoryExam: d.respiratoryExam,
          vitalSignsNotes: d.vitalSignsNotes || null,
          extremitiesPerfusion: d.extremitiesPerfusion,
          bmiNutrition: d.bmiNutrition || null,
          oralCavity: d.oralCavity,
          skinIntegrity: d.skinIntegrity,
          pressureInjury: d.pressureInjury,
          physicalMobility: d.physicalMobility,
          fallRiskSak: d.fallRiskSak,
          eliminations: d.eliminations,
          sleepAndRest: d.sleepAndRest,
          familyRelationship: d.familyRelationship,
          vulnerabilitySituations: d.vulnerabilitySituations,
          emotionalState: d.emotionalState,
          lifestyleAndWork: d.lifestyleAndWork || null,
          beliefsAndValues: d.beliefsAndValues,
          selfCareCapacity: d.selfCareCapacity,
          educationLimitations: d.educationLimitations,
          smokingStatus: d.smokingStatus,
          otherDrugsStatus: d.otherDrugsStatus,
          conductSummary: d.conductSummary,
          careLineHCPA: d.careLineHCPA,
          educationActions: JSON.stringify(d.educationActions),
          freeTextSummary: d.freeTextSummary || null,
          finalizedAt: d.status === "FINALIZADO" ? now : null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId,
        action: d.status === "FINALIZADO" ? "FINALIZE_RECORD" : "CREATE_DRAFT",
        module: "ENFERMAGEM",
        entityType: "NursingAssessment",
        entityId: record.id,
        details: `Registrou Etapa 1 — Avaliação de Enfermagem (${d.status}) por Necessidades Humanas Básicas.`,
      });

      return NextResponse.json({
        success: true,
        assessment: record,
        message: "Avaliação de Enfermagem (Etapa 1) salva com sucesso.",
      });
    }

    // Etapas 2 a 5 do Processo de Enfermagem
    const parsed = nursingProcessPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados do Processo de Enfermagem inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const now = new Date();

    const plan = await prisma.nursingProcessPlan.create({
      data: {
        patientId,
        encounterId: d.encounterId,
        authorId: user.id,
        assessmentSummary: d.assessmentSummary,
        nursingDiagnosisCode: d.nursingDiagnosisCode,
        nursingDiagnosisTitle: d.nursingDiagnosisTitle,
        domainClass: d.domainClass,
        relatedFactors: d.relatedFactors,
        definingCharacteristics: d.definingCharacteristics || null,
        expectedOutcomes: d.expectedOutcomes,
        targetDeadline: d.targetDeadline,
        priority: d.priority,
        interventions: d.interventions,
        scheduleFrequency: d.scheduleFrequency,
        evaluationEvolution: d.evaluationEvolution || null,
        outcomeStatus: d.outcomeStatus,
        status: d.status,
        finalizedAt: d.status !== "RASCUNHO" ? now : null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: d.encounterId,
      action: "FINALIZE_RECORD",
      module: "ENFERMAGEM",
      entityType: "NursingProcessPlan",
      entityId: plan.id,
      details: `Registrou Processo de Enfermagem COFEN 736/2024: DE [${d.nursingDiagnosisCode}] ${d.nursingDiagnosisTitle}.`,
    });

    return NextResponse.json({
      success: true,
      plan,
      message: "Diagnóstico, Planejamento, Implementação e Evolução de Enfermagem registrados com sucesso.",
    });
  } catch (error) {
    console.error("[NURSING_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao salvar registro do Processo de Enfermagem." },
      { status: 500 }
    );
  }
}

