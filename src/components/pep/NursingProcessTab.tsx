"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  Check,
  Plus,
} from "lucide-react";

export interface NursingAssessmentItem {
  id: string;
  status: string;
  admissionReason: string;
  hospitalizedLast6m: boolean;
  medicationsInUse: string | null;
  transfusionReaction: string;
  knowsHealthCondition: boolean;
  currentHistory: string | null;
  pastHistory: string | null;
  familyHistory: string | null;
  neuroRegulation: string;
  camScore: string;
  painPresent: boolean;
  painDetails: string | null;
  respiratoryExam: string;
  vitalSignsNotes: string | null;
  extremitiesPerfusion: string;
  bmiNutrition: string | null;
  oralCavity: string;
  skinIntegrity: string;
  pressureInjury: string;
  physicalMobility: string;
  fallRiskSak: string;
  eliminations: string;
  sleepAndRest: string;
  familyRelationship: string;
  vulnerabilitySituations: string;
  emotionalState: string;
  lifestyleAndWork: string | null;
  beliefsAndValues: string;
  selfCareCapacity: string;
  educationLimitations: string;
  smokingStatus: string;
  otherDrugsStatus: string;
  conductSummary: string;
  careLineHCPA: string;
  educationActions: string;
  freeTextSummary: string | null;
  finalizedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    professional?: {
      councilType: string;
      councilNumber: string;
      councilState: string;
    } | null;
  };
}

export interface NursingPlanItem {
  id: string;
  assessmentSummary: string;
  nursingDiagnosisCode: string;
  nursingDiagnosisTitle: string;
  domainClass: string;
  relatedFactors: string;
  definingCharacteristics: string | null;
  expectedOutcomes: string;
  targetDeadline: string;
  priority: string;
  interventions: string;
  scheduleFrequency: string;
  evaluationEvolution: string | null;
  outcomeStatus: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
    professional?: {
      councilType: string;
      councilNumber: string;
      councilState: string;
    } | null;
  };
}

interface NursingProcessTabProps {
  patientId: string;
  encounterId: string;
  patientInfo: {
    name: string;
    birthDate: string;
    sex: string;
    skinColor: string;
    maritalStatus: string;
    occupation: string;
    educationLevel: string;
    birthPlace: string;
    city: string;
    religion: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyRelationship: string | null;
    bedCode: string;
  };
  assessments: NursingAssessmentItem[];
  plans: NursingPlanItem[];
  canPrescribeNursing: boolean;
  userRole: string;
  onSaved: () => void;
}

const HORTA_SECTIONS = [
  { code: "*ID", label: "Identificação do Paciente" },
  { code: "*HD", label: "História e Motivo da Internação" },
  { code: "*NPB", label: "Necessidades Psicobiológicas" },
  { code: "*NPS", label: "Necessidades Psicossociais" },
  { code: "*NPE", label: "Necessidades Psicoespirituais" },
  { code: "*EPS", label: "Educação para a Saúde" },
  { code: "*CON", label: "Conduta e Linhas de Cuidado" },
] as const;

export default function NursingProcessTab({
  patientId,
  encounterId,
  patientInfo,
  assessments,
  plans,
  canPrescribeNursing,
  userRole,
  onSaved,
}: NursingProcessTabProps) {
  const [stageView, setStageView] = useState<"ETAPA_1_ANAMNESE" | "ETAPAS_2_A_5_SAE">(
    "ETAPA_1_ANAMNESE"
  );
  const [activeHortaTab, setActiveHortaTab] = useState<string>("*ID");
  const [subMode, setSubMode] = useState<"ROTEIRO" | "LIVRE">("ROTEIRO");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);

  const latestAssessment = assessments[0] || null;

  const [assessmentForm, setAssessmentForm] = useState({
    admissionReason:
      latestAssessment?.admissionReason ||
      "Internação clínica para tratamento especializado e monitorização de enfermagem",
    hospitalizedLast6m: latestAssessment?.hospitalizedLast6m ?? true,
    medicationsInUse:
      latestAssessment?.medicationsInUse || "Alopurinol 300mg, Aciclovir 400mg 12/12h",
    transfusionReaction:
      latestAssessment?.transfusionReaction || "Transfundiu - sem reação",
    knowsHealthCondition: latestAssessment?.knowsHealthCondition ?? true,
    currentHistory:
      latestAssessment?.currentHistory ||
      "Paciente admitido na unidade para continuidade terapêutica.",
    pastHistory: latestAssessment?.pastHistory || "HAS controlada.",
    familyHistory: latestAssessment?.familyHistory || "Sem particularidades adicionais.",
    neuroRegulation:
      latestAssessment?.neuroRegulation ||
      "Lúcido, orientado no tempo e espaço, Glasgow 15",
    camScore: latestAssessment?.camScore || "Negativo para Delirium",
    painPresent: latestAssessment?.painPresent ?? false,
    painDetails: latestAssessment?.painDetails || "Nega dor no momento (EVA 0)",
    respiratoryExam:
      latestAssessment?.respiratoryExam ||
      "Eupneico em ar ambiente, MV+ bilateral sem ruídos adventícios",
    vitalSignsNotes:
      latestAssessment?.vitalSignsNotes || "Normotenso, normocárdico, afebril",
    extremitiesPerfusion:
      latestAssessment?.extremitiesPerfusion ||
      "Extremidades aquecidas, TEC < 3s, sem edemas",
    bmiNutrition:
      latestAssessment?.bmiNutrition || "IMC dentro da faixa de eutrofia; boa aceitação oral",
    oralCavity:
      latestAssessment?.oralCavity ||
      "Mucosas coradas e hidratadas, higiene oral preservada",
    skinIntegrity:
      latestAssessment?.skinIntegrity || "Pele íntegra, turgor preservado",
    pressureInjury:
      latestAssessment?.pressureInjury ||
      "Sem lesão por pressão (Escala de Braden monitorada)",
    physicalMobility:
      latestAssessment?.physicalMobility || "Deambula com auxílio no quarto",
    fallRiskSak:
      latestAssessment?.fallRiskSak || "Risco Moderado (Escala SAK monitorada)",
    eliminations:
      latestAssessment?.eliminations ||
      "Diurese espontânea clara; evacuação fisiológica presente",
    sleepAndRest: latestAssessment?.sleepAndRest || "Sono reparador preservado",
    familyRelationship:
      latestAssessment?.familyRelationship ||
      "Rede de apoio familiar presente e participativa",
    vulnerabilitySituations:
      latestAssessment?.vulnerabilitySituations ||
      "Sem vulnerabilidade identificada no momento",
    emotionalState: latestAssessment?.emotionalState || "Tranquilo",
    lifestyleAndWork: latestAssessment?.lifestyleAndWork || "Rotina adaptada ao tratamento",
    beliefsAndValues:
      latestAssessment?.beliefsAndValues ||
      "Crenças religiosas respeitadas; encontra conforto no apoio familiar",
    selfCareCapacity:
      latestAssessment?.selfCareCapacity ||
      "Paciente com capacidade para o autocuidado",
    educationLimitations:
      latestAssessment?.educationLimitations ||
      "Paciente sem limitações para a educação",
    smokingStatus: latestAssessment?.smokingStatus || "Nega tabagismo",
    otherDrugsStatus: latestAssessment?.otherDrugsStatus || "Nega outras drogas",
    conductSummary:
      latestAssessment?.conductSummary ||
      "Manter vigilância de sinais vitais 6/6h, protocolo de prevenção de quedas e cuidados com acesso venoso.",
    careLineHCPA:
      latestAssessment?.careLineHCPA ||
      "Medicamentos especiais e Segurança do Paciente",
    educationActions: [
      "Prevenção de quedas",
      "Identificação do paciente",
      "Direitos do paciente",
      "Lesão por pressão",
    ],
    freeTextSummary: latestAssessment?.freeTextSummary || "",
  });

  // Estado para Etapas 2 a 5 (Diagnóstico, Planejamento, Implementação e Evolução de Enfermagem)
  const [planForm, setPlanForm] = useState({
    assessmentSummary: "",
    nursingDiagnosisCode: "",
    nursingDiagnosisTitle: "",
    domainClass: "Domínio 11: Segurança/Proteção",
    relatedFactors: "",
    definingCharacteristics: "",
    expectedOutcomes: "",
    targetDeadline: "24 a 48 horas",
    priority: "ALTA" as "ALTA" | "MEDIA" | "BAIXA",
    interventions: "",
    scheduleFrequency: "6/6 horas",
    evaluationEvolution: "",
    outcomeStatus: "EM_ACOMPANHAMENTO" as
      | "MANTIDO"
      | "MELHORADO"
      | "RESOLVIDO"
      | "PIORADO"
      | "EM_ACOMPANHAMENTO",
  });

  async function handleSaveAssessment(status: "RASCUNHO" | "FINALIZADO") {
    setFeedback(null);
    const res = await fetch(`/api/pep/${patientId}/nursing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordType: "ASSESSMENT",
        encounterId,
        status,
        ...assessmentForm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao salvar Avaliação de Enfermagem." });
      return;
    }
    setFeedback({ type: "success", text: data.message });
    onSaved();
  }

  async function handleSaveNursingPlan(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch(`/api/pep/${patientId}/nursing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordType: "PROCESS_PLAN",
        encounterId,
        status: "ATIVO",
        ...planForm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({
        type: "error",
        text: data.error || "Erro ao registrar Processo de Enfermagem.",
      });
      return;
    }
    setFeedback({ type: "success", text: data.message });
    setShowNewPlanForm(false);
    setPlanForm({
      assessmentSummary: "",
      nursingDiagnosisCode: "",
      nursingDiagnosisTitle: "",
      domainClass: "Domínio 11: Segurança/Proteção",
      relatedFactors: "",
      definingCharacteristics: "",
      expectedOutcomes: "",
      targetDeadline: "24 a 48 horas",
      priority: "ALTA",
      interventions: "",
      scheduleFrequency: "6/6 horas",
      evaluationEvolution: "",
      outcomeStatus: "EM_ACOMPANHAMENTO",
    });
    onSaved();
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Cabeçalho das 5 Etapas do Processo de Enfermagem (Resolução COFEN nº 736/2024) */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700">
              Resolução COFEN nº 736/2024 e nº 754/2024
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Processo de Enfermagem — 5 Etapas Estruturadas (Sem Decisão Clínica Automática)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStageView("ETAPA_1_ANAMNESE")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                stageView === "ETAPA_1_ANAMNESE"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Etapa 1: Avaliação / Anamnese (*ID a *CON)
            </button>
            <button
              type="button"
              onClick={() => setStageView("ETAPAS_2_A_5_SAE")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                stageView === "ETAPAS_2_A_5_SAE"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Etapas 2 a 5: Diagnóstico, Planejamento, Implementação e Evolução ({plans.length})
            </button>
          </div>
        </div>

        {!canPrescribeNursing && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Controle de Permissão Profissional ({userRole}):</strong> A elaboração de Diagnósticos de Enfermagem, Planejamento e Prescrição de Enfermagem é privativa do Enfermeiro (Lei 7.498/86 e COFEN 736/2024). Seu perfil possui acesso de leitura a esta aba e pode realizar Anotações e Checagens nas abas correspondentes.
            </span>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* VISÃO 1: ANAMNESE / AVALIAÇÃO DE ENFERMAGEM ESTILO VÍDEO DO AGHUSE (*ID, *HD, *NPB, *NPS, *NPE, *EPS, *CON) */}
      {stageView === "ETAPA_1_ANAMNESE" && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Anamnese / Avaliação de Enfermagem — Teoria das Necessidades Humanas Básicas (Horta)
            </span>
            <span className="text-[11px] font-mono text-slate-600">
              Ir Para:{" "}
              <select
                value={activeHortaTab}
                onChange={(e) => setActiveHortaTab(e.target.value)}
                className="ml-1 px-2 py-0.5 rounded border border-slate-300 bg-white font-sans"
              >
                {HORTA_SECTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.label}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Abas Verticais à Esquerda (*ID, *HD, *NPB, *NPS, *NPE, *EPS, *CON) */}
            <div className="md:col-span-2 bg-slate-50 border-r border-slate-300 p-2 flex md:flex-col gap-1 overflow-x-auto">
              {HORTA_SECTIONS.map((sec) => (
                <button
                  key={sec.code}
                  type="button"
                  onClick={() => setActiveHortaTab(sec.code)}
                  className={`px-3 py-2.5 rounded text-left font-bold transition-colors cursor-pointer ${
                    activeHortaTab === sec.code
                      ? "bg-emerald-700 text-white shadow-2xs"
                      : "bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200"
                  }`}
                >
                  <span className="font-mono block text-xs">{sec.code}</span>
                  <span className="text-[10px] font-normal opacity-90 line-clamp-1">
                    {sec.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Área Central do Roteiro Geral / Livre */}
            <div className="md:col-span-10 p-4 space-y-4">
              {/* Faixa Verde Roteiro Geral | Livre (Idêntica ao Vídeo AGHUse) */}
              <div className="bg-emerald-600 px-3 pt-2 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSubMode("ROTEIRO")}
                    className={`px-4 py-1.5 rounded-t font-bold cursor-pointer ${
                      subMode === "ROTEIRO"
                        ? "bg-white text-slate-900"
                        : "bg-emerald-700 text-emerald-100"
                    }`}
                  >
                    Roteiro Geral
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubMode("LIVRE")}
                    className={`px-4 py-1.5 rounded-t font-bold cursor-pointer ${
                      subMode === "LIVRE"
                        ? "bg-white text-slate-900"
                        : "bg-emerald-700 text-emerald-100"
                    }`}
                  >
                    Livre
                  </button>
                </div>
                <span className="text-white font-bold text-xs pb-1">
                  {HORTA_SECTIONS.find((s) => s.code === activeHortaTab)?.label}
                </span>
              </div>

              {subMode === "LIVRE" ? (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Anotações Livres da Avaliação de Enfermagem
                  </label>
                  <textarea
                    rows={8}
                    value={assessmentForm.freeTextSummary}
                    onChange={(e) =>
                      setAssessmentForm({
                        ...assessmentForm,
                        freeTextSummary: e.target.value,
                      })
                    }
                    placeholder="Descreva observações complementares da avaliação clínica de enfermagem..."
                    className="w-full p-3 rounded border border-slate-300"
                  />
                </div>
              ) : (
                <>
                  {/* *ID - Identificação (Conforme 00:01 do Vídeo) */}
                  {activeHortaTab === "*ID" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Nome</label>
                        <input
                          type="text"
                          disabled
                          value={patientInfo.name}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="text"
                          disabled
                          value={new Date(patientInfo.birthDate).toLocaleDateString("pt-BR")}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Sexo / Cor</label>
                        <input
                          type="text"
                          disabled
                          value={`${patientInfo.sex} — ${patientInfo.skinColor}`}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Estado Civil / Profissão
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`${patientInfo.maritalStatus} / ${patientInfo.occupation}`}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Escolaridade / Naturalidade
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`${patientInfo.educationLevel} / ${patientInfo.birthPlace}`}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Leito / Acompanhante
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`Leito ${patientInfo.bedCode} • ${
                            patientInfo.emergencyContactName || "Sem acompanhante"
                          }`}
                          className="w-full px-2.5 py-1.5 rounded border bg-slate-100"
                        />
                      </div>
                    </div>
                  )}

                  {/* *HD - História (Conforme 00:05 do Vídeo) */}
                  {activeHortaTab === "*HD" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Motivo da Internação (Se cirurgia incluir local e/ou lateralidade) *
                        </label>
                        <textarea
                          rows={2}
                          value={assessmentForm.admissionReason}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              admissionReason: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded border border-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Medicação em uso — dose e frequência *
                          </label>
                          <textarea
                            rows={2}
                            value={assessmentForm.medicationsInUse}
                            onChange={(e) =>
                              setAssessmentForm({
                                ...assessmentForm,
                                medicationsInUse: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Reações Transfusionais
                          </label>
                          <select
                            value={assessmentForm.transfusionReaction}
                            onChange={(e) =>
                              setAssessmentForm({
                                ...assessmentForm,
                                transfusionReaction: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded border border-slate-300"
                          >
                            <option value="Transfundiu - sem reação">
                              Transfundiu - sem reação
                            </option>
                            <option value="Nunca transfundiu">Nunca transfundiu</option>
                            <option value="Transfundiu - com reação">
                              Transfundiu - com reação prévia
                            </option>
                          </select>
                          <label className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={assessmentForm.hospitalizedLast6m}
                              onChange={(e) =>
                                setAssessmentForm({
                                  ...assessmentForm,
                                  hospitalizedLast6m: e.target.checked,
                                })
                              }
                            />
                            <span>
                              Apresentou internação por pelo menos 48h nos últimos 6 meses
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            História Passada
                          </label>
                          <textarea
                            rows={2}
                            value={assessmentForm.pastHistory}
                            onChange={(e) =>
                              setAssessmentForm({
                                ...assessmentForm,
                                pastHistory: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            História Familiar
                          </label>
                          <textarea
                            rows={2}
                            value={assessmentForm.familyHistory}
                            onChange={(e) =>
                              setAssessmentForm({
                                ...assessmentForm,
                                familyHistory: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded border border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* *NPB - Necessidades Psicobiológicas (Conforme 00:13 a 00:24 do Vídeo) */}
                  {activeHortaTab === "*NPB" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Regulação Neurológica *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.neuroRegulation}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              neuroRegulation: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          CAM (Confusion Assessment Method)
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.camScore}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              camScore: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Dor no momento (Característica, Localização, Intensidade) *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.painDetails}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              painDetails: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Exame Físico — Condição Respiratória e SpO2 *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.respiratoryExam}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              respiratoryExam: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Extremidades e Perfusão *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.extremitiesPerfusion}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              extremitiesPerfusion: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          IMC e Nutrição / Hidratação
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.bmiNutrition}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              bmiNutrition: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Cavidade Oral *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.oralCavity}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              oralCavity: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Integridade Cutânea e Mucosa / Lesão por Pressão *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.skinIntegrity}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              skinIntegrity: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Avaliação Funcional — Mobilidade Física e Escala SAK (Quedas) *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.fallRiskSak}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              fallRiskSak: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Eliminações e Sono/Repouso *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.eliminations}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              eliminations: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* *NPS - Necessidades Psicossociais (Conforme 00:26 do Vídeo) */}
                  {activeHortaTab === "*NPS" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Relacionamento Familiar *
                        </label>
                        <textarea
                          rows={2}
                          value={assessmentForm.familyRelationship}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              familyRelationship: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Situação de Vulnerabilidade *
                        </label>
                        <select
                          value={assessmentForm.vulnerabilitySituations}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              vulnerabilitySituations: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        >
                          <option value="Sem vulnerabilidade identificada no momento">
                            Sem vulnerabilidade identificada no momento
                          </option>
                          <option value="Idoso morando sozinho">Idoso morando sozinho</option>
                          <option value="Situação de rua / Moradia sem saneamento básico">
                            Situação de rua / Moradia sem saneamento básico
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Estado Emocional *
                        </label>
                        <select
                          value={assessmentForm.emotionalState}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              emotionalState: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        >
                          <option value="Tranquilo">Tranquilo</option>
                          <option value="Ansioso">Ansioso</option>
                          <option value="Temeroso">Temeroso</option>
                          <option value="Deprimido">Deprimido</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Estilo de Vida e Trabalho
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.lifestyleAndWork}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              lifestyleAndWork: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* *NPE - Necessidades Psicoespirituais (Conforme 00:32 do Vídeo) */}
                  {activeHortaTab === "*NPE" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Crenças, Valores e O que pode lhe ajudar atualmente *
                        </label>
                        <textarea
                          rows={3}
                          value={assessmentForm.beliefsAndValues}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              beliefsAndValues: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* *EPS - Educação para Saúde (Conforme 00:35 do Vídeo) */}
                  {activeHortaTab === "*EPS" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Capacidade para o Autocuidado *
                        </label>
                        <select
                          value={assessmentForm.selfCareCapacity}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              selfCareCapacity: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        >
                          <option value="Paciente com capacidade para o autocuidado">
                            Paciente com capacidade para o autocuidado
                          </option>
                          <option value="Paciente com limitações parciais para o autocuidado">
                            Paciente com limitações parciais para o autocuidado
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Limitações para a Educação *
                        </label>
                        <select
                          value={assessmentForm.educationLimitations}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              educationLimitations: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        >
                          <option value="Paciente sem limitações para a educação">
                            Paciente sem limitações para a educação
                          </option>
                          <option value="Paciente com limitações para educação">
                            Paciente com limitações para educação
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Tabagismo</label>
                        <input
                          type="text"
                          value={assessmentForm.smokingStatus}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              smokingStatus: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Outras Drogas
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.otherDrugsStatus}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              otherDrugsStatus: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* *CON - Conduta e Linhas de Cuidado (Conforme 00:41 do Vídeo) */}
                  {activeHortaTab === "*CON" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Conduta de Enfermagem *
                        </label>
                        <textarea
                          rows={2}
                          value={assessmentForm.conductSummary}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              conductSummary: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Pertence a uma Linha de Cuidado Assistencial *
                        </label>
                        <input
                          type="text"
                          value={assessmentForm.careLineHCPA}
                          onChange={(e) =>
                            setAssessmentForm({
                              ...assessmentForm,
                              careLineHCPA: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Conduta de Educação Orientada (Prevenção de Quedas, Identificação do Paciente, Direitos, Lesão por Pressão)
                        </label>
                        <div className="flex flex-wrap gap-3 p-2.5 rounded bg-slate-50 border border-slate-200">
                          {[
                            "Prevenção de quedas",
                            "Identificação do paciente",
                            "Direitos do paciente",
                            "Lesão por pressão",
                          ].map((act) => (
                            <label key={act} className="flex items-center gap-1.5 font-medium">
                              <input
                                type="checkbox"
                                checked={assessmentForm.educationActions.includes(act)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...assessmentForm.educationActions, act]
                                    : assessmentForm.educationActions.filter((x) => x !== act);
                                  setAssessmentForm({
                                    ...assessmentForm,
                                    educationActions: next,
                                  });
                                }}
                              />
                              <span>{act}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Barra Inferior de Ações da Anamnese (Gravar / Pendente-Rascunho / Finalizar) */}
              {canPrescribeNursing && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSaveAssessment("RASCUNHO")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Deixar Pendente (Salvar Rascunho)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAssessment("FINALIZADO")}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Finalizar Avaliação de Enfermagem</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISÃO 2: ETAPAS 2, 3, 4 E 5 DO PROCESSO DE ENFERMAGEM (COFEN 736/2024) */}
      {stageView === "ETAPAS_2_A_5_SAE" && (
        <div className="space-y-4">
          {canPrescribeNursing && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowNewPlanForm(!showNewPlanForm)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {showNewPlanForm
                    ? "Fechar Formulário"
                    : "Registrar Novo Diagnóstico e Plano de Enfermagem (Etapas 2 a 5)"}
                </span>
              </button>
            </div>
          )}

          {showNewPlanForm && canPrescribeNursing && (
            <form
              onSubmit={handleSaveNursingPlan}
              className="bg-white p-5 rounded-xl border-2 border-emerald-600 shadow-md space-y-4"
            >
              <div className="border-b pb-2 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Registro Estruturado das 5 Etapas do Processo de Enfermagem (COFEN nº 736/2024)
                </h4>
                <span className="text-[11px] text-slate-500">
                  Decisão clínica autoral do Enfermeiro habilitado
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">
                    Etapa 1 — Achados da Avaliação de Enfermagem que sustentam o diagnóstico *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.assessmentSummary}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, assessmentSummary: e.target.value })
                    }
                    placeholder="Ex: Paciente em infusão quimioterápica em bomba contínua, escala SAK = 7..."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 mb-1">
                    Etapa 2 — Código do Diagnóstico *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.nursingDiagnosisCode}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, nursingDiagnosisCode: e.target.value })
                    }
                    placeholder="Ex: 00155 ou DE-03"
                    className="w-full p-2 rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 mb-1">
                    Etapa 2 — Título do Diagnóstico de Enfermagem *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.nursingDiagnosisTitle}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, nursingDiagnosisTitle: e.target.value })
                    }
                    placeholder="Ex: Risco de Quedas no Adulto / Dor Aguda"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Domínio / Classe *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.domainClass}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, domainClass: e.target.value })
                    }
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Fatores Relacionados / Fatores de Risco *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.relatedFactors}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, relatedFactors: e.target.value })
                    }
                    placeholder="Ex: Uso de dispositivos de infusão venosa e medicamentos sedativos/antieméticos"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Características Definidoras (se aplicável)
                  </label>
                  <input
                    type="text"
                    value={planForm.definingCharacteristics}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, definingCharacteristics: e.target.value })
                    }
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-blue-900 mb-1">
                    Etapa 3 — Planejamento de Enfermagem (Resultados Esperados / Metas) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={planForm.expectedOutcomes}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, expectedOutcomes: e.target.value })
                    }
                    placeholder="Ex: Paciente não apresentará episódios de queda durante toda a internação hospitalar."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Prazo / Prioridade
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={planForm.targetDeadline}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, targetDeadline: e.target.value })
                      }
                      className="flex-1 p-2 rounded border border-slate-300"
                    />
                    <select
                      value={planForm.priority}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          priority: e.target.value as "ALTA" | "MEDIA" | "BAIXA",
                        })
                      }
                      className="p-2 rounded border border-slate-300 font-bold"
                    >
                      <option value="ALTA">ALTA</option>
                      <option value="MEDIA">MÉDIA</option>
                      <option value="BAIXA">BAIXA</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-teal-900 mb-1">
                    Etapa 4 — Implementação de Enfermagem (Intervenções e Cuidados Prescritos) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={planForm.interventions}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, interventions: e.target.value })
                    }
                    placeholder="1. Manter grades do leito elevadas e rodas travadas; 2. Manter campainha ao alcance; 3. Auxiliar na deambulação..."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-purple-900 mb-1">
                    Etapa 5 — Evolução de Enfermagem (Avaliação dos Resultados Alcançados)
                  </label>
                  <input
                    type="text"
                    value={planForm.evaluationEvolution}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, evaluationEvolution: e.target.value })
                    }
                    placeholder="Ex: Paciente compreende orientações, solicita auxílio para levantar, sem ocorrência de quedas."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Situação do Resultado
                  </label>
                  <select
                    value={planForm.outcomeStatus}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        outcomeStatus: e.target.value as
                          | "MANTIDO"
                          | "MELHORADO"
                          | "RESOLVIDO"
                          | "PIORADO"
                          | "EM_ACOMPANHAMENTO",
                      })
                    }
                    className="w-full p-2 rounded border border-slate-300 font-bold"
                  >
                    <option value="EM_ACOMPANHAMENTO">Em Acompanhamento</option>
                    <option value="MELHORADO">Melhorado</option>
                    <option value="MANTIDO">Mantido</option>
                    <option value="RESOLVIDO">Resolvido</option>
                    <option value="PIORADO">Piorado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlanForm(false)}
                  className="px-4 py-1.5 rounded border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Finalizar e Salvar Plano de Enfermagem
                </button>
              </div>
            </form>
          )}

          {/* Lista de Planos do Processo de Enfermagem Registrados */}
          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-700" />
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                      Código {p.nursingDiagnosisCode}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {p.nursingDiagnosisTitle}
                    </h4>
                    <span className="text-[11px] text-slate-500">({p.domainClass})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                      Prioridade {p.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                      {p.outcomeStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      1. Avaliação de Enfermagem
                    </span>
                    <p className="text-slate-800">{p.assessmentSummary}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                      2. Diagnóstico de Enfermagem
                    </span>
                    <p className="font-semibold text-slate-900">{p.nursingDiagnosisTitle}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <strong>Fatores:</strong> {p.relatedFactors}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200">
                    <span className="text-[10px] font-bold uppercase text-blue-800 block mb-1">
                      3. Planejamento ({p.targetDeadline})
                    </span>
                    <p className="text-slate-800">{p.expectedOutcomes}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200">
                    <span className="text-[10px] font-bold uppercase text-teal-800 block mb-1">
                      4. Implementação ({p.scheduleFrequency})
                    </span>
                    <p className="text-slate-800">{p.interventions}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200">
                    <span className="text-[10px] font-bold uppercase text-purple-800 block mb-1">
                      5. Evolução de Enfermagem
                    </span>
                    <p className="text-slate-800">
                      {p.evaluationEvolution || "Em acompanhamento contínuo."}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>
                    Enfermeiro(a) Responsável: <strong>{p.author.name}</strong>{" "}
                    {p.author.professional
                      ? `(${p.author.professional.councilType}-${p.author.professional.councilState} ${p.author.professional.councilNumber})`
                      : ""}
                  </span>
                  <span>
                    Registrado em: {new Date(p.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

