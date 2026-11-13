import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "PEP");
    if ("errorResponse" in authResult) {
      return authResult.errorResponse;
    }
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const skipAudit = searchParams.get("silent") === "1";

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { chartNumber: patientId }],
      },
      include: {
        institution: true,
        allergies: {
          where: { active: true },
          include: {
            recordedBy: {
              include: { professional: true },
            },
          },
          orderBy: { recordedAt: "desc" },
        },
        diagnoses: {
          include: {
            author: { include: { professional: true } },
          },
          orderBy: { diagnosedAt: "desc" },
        },
        encounters: {
          include: {
            unit: true,
            admission: {
              include: { bed: true },
            },
          },
          orderBy: { openedAt: "desc" },
        },
        evolutions: {
          include: {
            author: {
              include: { professional: true },
            },
            parentRecord: {
              select: { id: true, title: true, finalizedAt: true },
            },
            addenda: {
              include: {
                author: { include: { professional: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        nursingAssessments: {
          include: {
            author: { include: { professional: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        nursingPlans: {
          include: {
            author: { include: { professional: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        vitalSigns: {
          include: {
            recordedBy: { include: { professional: true } },
          },
          orderBy: { recordedAt: "desc" },
        },
        prescriptions: {
          include: {
            prescriber: { include: { professional: true } },
            items: {
              orderBy: { itemOrder: "asc" },
              include: {
                administrations: {
                  include: {
                    checkedBy: { include: { professional: true } },
                  },
                  orderBy: { effectiveTime: "desc" },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        exams: {
          include: {
            requestedBy: { include: { professional: true } },
          },
          orderBy: { requestedAt: "desc" },
        },
        documents: {
          include: {
            uploadedBy: { include: { professional: true } },
          },
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Prontuário do paciente não localizado." },
        { status: 404 }
      );
    }

    const activeEncounter =
      patient.encounters.find((e) => e.status === "EM_ANDAMENTO") ||
      patient.encounters[0] ||
      null;

    if (!skipAudit) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId: patient.id,
        encounterId: activeEncounter?.id ?? null,
        action: "VIEW_PATIENT_PEP",
        module: "PEP",
        entityType: "Patient",
        entityId: patient.id,
        details: `Acessou prontuário eletrônico de ${patient.name} (Prontuário ${patient.chartNumber}).`,
      });
    }

    // Construir Linha do Tempo unificada e ordenada cronologicamente (Aba 10)
    const timelineEvents: Array<{
      id: string;
      type: string;
      badge: string;
      timestamp: Date;
      title: string;
      summary: string;
      authorName: string;
      authorCouncil: string;
      status: string;
    }> = [];

    for (const enc of patient.encounters) {
      timelineEvents.push({
        id: `enc-${enc.id}`,
        type: "ADMISSAO",
        badge: "Admissão / Atendimento",
        timestamp: enc.openedAt,
        title: `${enc.encounterNumber} — ${enc.unit.name}`,
        summary: `Diagnóstico principal: ${enc.mainIcd10} - ${enc.mainDiagnosis}. Motivo: ${enc.reasonForAdmission}`,
        authorName: "Admissão Hospitalar",
        authorCouncil: enc.admission?.bed ? `Leito ${enc.admission.bed.code}` : enc.type,
        status: enc.status,
      });
    }

    for (const evo of patient.evolutions) {
      if (evo.status === "RASCUNHO" && evo.authorId !== user.id) continue;
      const council = evo.author.professional
        ? `${evo.author.professional.councilType}-${evo.author.professional.councilState} ${evo.author.professional.councilNumber}`
        : evo.author.role;
      timelineEvents.push({
        id: `evo-${evo.id}`,
        type: evo.isAddendum ? "ADENDO" : "EVOLUCAO",
        badge: evo.isAddendum ? "Retificação / Adendo" : evo.category.replace(/_/g, " "),
        timestamp: evo.finalizedAt || evo.lastSavedAt,
        title: evo.title,
        summary:
          evo.freeText ||
          [
            evo.subjective ? `S: ${evo.subjective}` : "",
            evo.objective ? `O: ${evo.objective}` : "",
            evo.impression ? `I: ${evo.impression}` : "",
            evo.conduct ? `C: ${evo.conduct}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        authorName: evo.author.name,
        authorCouncil: council,
        status: evo.status,
      });
    }

    for (const na of patient.nursingAssessments) {
      const council = na.author.professional
        ? `${na.author.professional.councilType}-${na.author.professional.councilState} ${na.author.professional.councilNumber}`
        : na.author.role;
      timelineEvents.push({
        id: `na-${na.id}`,
        type: "AVALIACAO_ENF",
        badge: "Anamnese / Avaliação Enf.",
        timestamp: na.finalizedAt || na.createdAt,
        title: "Avaliação de Enfermagem (Necessidades Humanas Básicas)",
        summary: `Motivo: ${na.admissionReason} | Neuro: ${na.neuroRegulation} | Conduta: ${na.conductSummary}`,
        authorName: na.author.name,
        authorCouncil: council,
        status: na.status,
      });
    }

    for (const np of patient.nursingPlans) {
      const council = np.author.professional
        ? `${np.author.professional.councilType}-${np.author.professional.councilState} ${np.author.professional.councilNumber}`
        : np.author.role;
      timelineEvents.push({
        id: `np-${np.id}`,
        type: "PROCESSO_ENF",
        badge: "Processo de Enfermagem (COFEN 736/2024)",
        timestamp: np.finalizedAt || np.createdAt,
        title: `DE [${np.nursingDiagnosisCode}] ${np.nursingDiagnosisTitle}`,
        summary: `Meta: ${np.expectedOutcomes} | Intervenções: ${np.interventions} | Evolução: ${np.evaluationEvolution || np.outcomeStatus}`,
        authorName: np.author.name,
        authorCouncil: council,
        status: np.status,
      });
    }

    for (const vs of patient.vitalSigns) {
      const council = vs.recordedBy.professional
        ? `${vs.recordedBy.professional.councilType}-${vs.recordedBy.professional.councilState} ${vs.recordedBy.professional.councilNumber}`
        : vs.recordedBy.role;
      timelineEvents.push({
        id: `vs-${vs.id}`,
        type: "SINAIS_VITAIS",
        badge: "Controles e Balanço Hídrico",
        timestamp: vs.recordedAt,
        title: `PA ${vs.systolicBP ?? "-"}/${vs.diastolicBP ?? "-"} mmHg | FC ${vs.heartRate ?? "-"} bpm | Tax ${vs.temperature ?? "-"}°C | SpO2 ${vs.spo2 ?? "-"}%`,
        summary: `${vs.fluidDescription ? `${vs.fluidDescription} | ` : ""}${vs.notes || "Controle de rotina registrado."}`,
        authorName: vs.recordedBy.name,
        authorCouncil: council,
        status: "REGISTRADO",
      });
    }

    for (const presc of patient.prescriptions) {
      const council = presc.prescriber.professional
        ? `${presc.prescriber.professional.councilType}-${presc.prescriber.professional.councilState} ${presc.prescriber.professional.councilNumber}`
        : presc.prescriber.role;
      timelineEvents.push({
        id: `presc-${presc.id}`,
        type: "PRESCRICAO",
        badge: `Prescrição ${presc.type}`,
        timestamp: presc.createdAt,
        title: `${presc.prescriptionNumber} (${presc.items.length} itens prescritos)`,
        summary: presc.generalNotes || "Prescrição vigente registrada no atendimento.",
        authorName: presc.prescriber.name,
        authorCouncil: council,
        status: presc.status,
      });

      for (const item of presc.items) {
        for (const adm of item.administrations) {
          const admCouncil = adm.checkedBy.professional
            ? `${adm.checkedBy.professional.councilType}-${adm.checkedBy.professional.councilState} ${adm.checkedBy.professional.councilNumber}`
            : adm.checkedBy.role;
          timelineEvents.push({
            id: `adm-${adm.id}`,
            type: "CHECAGEM",
            badge: "Checagem Beira-Leito",
            timestamp: adm.effectiveTime,
            title: `${item.description} (${item.dose} - ${item.route}) — Horário Previsto: ${adm.scheduledTime}`,
            summary:
              adm.status === "REALIZADO"
                ? `Realizado. ${adm.notes || ""}`
                : `NÃO REALIZADO (${adm.status}) — Justificativa: ${adm.justification || "Informada"}`,
            authorName: adm.checkedBy.name,
            authorCouncil: admCouncil,
            status: adm.status,
          });
        }
      }
    }

    for (const ex of patient.exams) {
      const council = ex.requestedBy.professional
        ? `${ex.requestedBy.professional.councilType}-${ex.requestedBy.professional.councilState} ${ex.requestedBy.professional.councilNumber}`
        : ex.requestedBy.role;
      timelineEvents.push({
        id: `ex-${ex.id}`,
        type: "EXAME",
        badge: `Exame ${ex.category}`,
        timestamp: ex.resultAt || ex.requestedAt,
        title: `${ex.code} — ${ex.name}`,
        summary: ex.resultSummary || `Indicação: ${ex.clinicalIndication}`,
        authorName: ex.requestedBy.name,
        authorCouncil: council,
        status: ex.status,
      });
    }

    for (const doc of patient.documents) {
      const council = doc.uploadedBy.professional
        ? `${doc.uploadedBy.professional.councilType}-${doc.uploadedBy.professional.councilState} ${doc.uploadedBy.professional.councilNumber}`
        : doc.uploadedBy.role;
      timelineEvents.push({
        id: `doc-${doc.id}`,
        type: "DOCUMENTO",
        badge: "Anexo / Documento",
        timestamp: doc.uploadedAt,
        title: doc.title,
        summary: `Arquivo: ${doc.fileName} (${Math.round(doc.fileSizeBytes / 1024)} KB) — SHA-256: ${doc.sha256Hash.slice(0, 16)}...`,
        authorName: doc.uploadedBy.name,
        authorCouncil: council,
        status: "ANEXADO",
      });
    }

    timelineEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      patient,
      activeEncounter,
      timeline: timelineEvents,
      currentUser: user,
    });
  } catch (error) {
    console.error("[PEP_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao carregar prontuário eletrônico." },
      { status: 500 }
    );
  }
}

