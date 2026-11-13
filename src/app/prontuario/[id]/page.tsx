"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import AllergyModal from "@/components/pep/AllergyModal";
import VitalSignsTab, { VitalRecordItem } from "@/components/pep/VitalSignsTab";
import NursingProcessTab, {
  NursingAssessmentItem,
  NursingPlanItem,
} from "@/components/pep/NursingProcessTab";
import PrescriptionsAndChecksTab, {
  PrescriptionData,
} from "@/components/pep/PrescriptionsAndChecksTab";
import EvolutionEditorTab, {
  EvolutionRecordItem,
} from "@/components/pep/EvolutionEditorTab";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileEdit,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  Lock,
  Pill,
  Plus,
  Printer,
  ShieldAlert,
  Stethoscope,
  Upload,
} from "lucide-react";

const PEP_TABS = [
  { id: "visao-geral", label: "1. Visão Geral", icon: Stethoscope },
  { id: "historico", label: "2. Histórico Clínico", icon: History },
  { id: "evolucoes", label: "3. Evoluções e Anotações", icon: FileEdit },
  { id: "enfermagem", label: "4. Processo de Enfermagem", icon: ClipboardList },
  { id: "sinais-vitais", label: "5. Sinais Vitais / BH", icon: HeartPulse },
  { id: "prescricoes", label: "6. Prescrições", icon: Pill },
  { id: "checagem", label: "7. Checagem Beira-Leito", icon: ClipboardCheck },
  { id: "exames", label: "8. Exames e Procedimentos", icon: Activity },
  { id: "documentos", label: "9. Documentos e Anexos", icon: FolderOpen },
  { id: "linha-do-tempo", label: "10. Linha do Tempo", icon: Clock },
] as const;

interface PEPDataPayload {
  patient: {
    id: string;
    chartNumber: string;
    name: string;
    birthDate: string;
    sex: string;
    skinColor: string;
    maritalStatus: string;
    occupation: string;
    educationLevel: string;
    birthPlace: string;
    city: string;
    state: string;
    religion: string | null;
    cpf: string | null;
    cns: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyRelationship: string | null;
    emergencyPhone: string | null;
    bloodType: string | null;
    clinicalHistory: string | null;
    personalAntecedents: string | null;
    familyAntecedents: string | null;
    continuousMedications: string | null;
    transfusionHistory: string;
    allergies: Array<{
      id: string;
      category: string;
      substance: string;
      reaction: string;
      severity: string;
      reportedBy: string;
      recordedAt: string;
    }>;
    diagnoses: Array<{
      id: string;
      icd10Code: string;
      description: string;
      type: string;
      status: string;
      diagnosedAt: string;
      notes: string | null;
      author: { name: string };
    }>;
    encounters: Array<{
      id: string;
      encounterNumber: string;
      type: string;
      status: string;
      mainDiagnosis: string;
      mainIcd10: string;
      reasonForAdmission: string;
      dietSummary: string;
      careLine: string | null;
      openedAt: string;
      closedAt: string | null;
      dischargeSummary: string | null;
      unit: { id: string; code: string; name: string };
      admission: {
        id: string;
        admittedAt: string;
        estimatedDischargeAt: string | null;
        isolationPrecaution: string;
        bed: { id: string; code: string; room: string };
      } | null;
    }>;
    evolutions: EvolutionRecordItem[];
    nursingAssessments: NursingAssessmentItem[];
    nursingPlans: NursingPlanItem[];
    vitalSigns: VitalRecordItem[];
    prescriptions: PrescriptionData[];
    exams: Array<{
      id: string;
      category: string;
      code: string;
      name: string;
      clinicalIndication: string;
      priority: string;
      status: string;
      requestedAt: string;
      resultAt: string | null;
      resultSummary: string | null;
      referenceRange: string | null;
      requestedBy: { name: string };
    }>;
    documents: Array<{
      id: string;
      title: string;
      category: string;
      fileName: string;
      mimeType: string;
      fileSizeBytes: number;
      sha256Hash: string;
      description: string | null;
      uploadedAt: string;
      uploadedBy: { name: string };
    }>;
  };
  activeEncounter: {
    id: string;
    encounterNumber: string;
    status: string;
    mainDiagnosis: string;
    mainIcd10: string;
    reasonForAdmission: string;
    dietSummary: string;
    careLine: string | null;
    openedAt: string;
    unit: { code: string; name: string };
    admission: {
      isolationPrecaution: string;
      bed: { code: string; room: string };
    } | null;
  } | null;
  timeline: Array<{
    id: string;
    type: string;
    badge: string;
    timestamp: string;
    title: string;
    summary: string;
    authorName: string;
    authorCouncil: string;
    status: string;
  }>;
  currentUser: SessionUserClient;
}

function ProntuarioContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientIdParam = String(params.id || "7834153");
  const initialTab = searchParams.get("tab") || "visao-geral";
  const initialModal = searchParams.get("modal") || "";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [pepData, setPepData] = useState<PEPDataPayload | null>(null);
  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllergyModal, setShowAllergyModal] = useState(initialModal === "alergia");

  // Estados para Aba 8 (Exames), Aba 9 (Documentos), Diagnósticos e Linha do Tempo
  const [timelineFilter, setTimelineFilter] = useState<string>("TODOS");
  const [examForm, setExamForm] = useState({
    category: "LABORATORIAL",
    code: "LAB-PCR-01",
    name: "",
    clinicalIndication: "",
    priority: "ROTINA",
    status: "LAUDADO",
    resultSummary: "",
    referenceRange: "",
  });
  const [docForm, setDocForm] = useState({
    title: "",
    category: "LAUDO_EXTERNO",
    fileName: "Laudo_Complementar.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 184320,
    description: "",
  });
  const [diagForm, setDiagForm] = useState({
    icd10Code: "",
    description: "",
    type: "SECUNDARIO",
    notes: "",
  });
  const [tabFeedback, setTabFeedback] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
    if (searchParams.get("modal") === "alergia") {
      setShowAllergyModal(true);
    }
  }, [searchParams]);

  const loadPEP = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        const res = await fetch(
          `/api/pep/${encodeURIComponent(patientIdParam)}${silent ? "?silent=1" : ""}`
        );
        if (res.status === 403) {
          const errData = await res.json();
          setAccessDeniedError(errData.error);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPepData(data);
        }
      } finally {
        setLoading(false);
      }
    },
    [patientIdParam, router]
  );

  useEffect(() => {
    loadPEP(false);
  }, [loadPEP]);

  function calcExactAge(birthDateStr: string): string {
    const dob = new Date(birthDateStr);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} anos ${months}m`;
  }

  async function handleExportAndPrintPDF() {
    if (!pepData) return;
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: pepData.patient.id,
        encounterId: pepData.activeEncounter?.id,
        action: "EXPORT_PDF",
        details: `Exportou / imprimiu relatório identificado em PDF do prontuário ${pepData.patient.chartNumber} (${pepData.patient.name}).`,
      }),
    });
    window.print();
  }

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();
    if (!pepData || !pepData.activeEncounter) return;
    setTabFeedback(null);
    const res = await fetch(`/api/pep/${pepData.patient.id}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attachmentType: "EXAM",
        encounterId: pepData.activeEncounter.id,
        ...examForm,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setTabFeedback(data.message);
      setExamForm((prev) => ({
        ...prev,
        name: "",
        clinicalIndication: "",
        resultSummary: "",
      }));
      loadPEP(true);
    }
  }

  async function handleUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!pepData || !pepData.activeEncounter) return;
    setTabFeedback(null);
    const res = await fetch(`/api/pep/${pepData.patient.id}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attachmentType: "DOCUMENT",
        encounterId: pepData.activeEncounter.id,
        ...docForm,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setTabFeedback(data.message);
      setDocForm((prev) => ({ ...prev, title: "", description: "" }));
      loadPEP(true);
    }
  }

  async function handleAddDiagnosis(e: React.FormEvent) {
    e.preventDefault();
    if (!pepData || !pepData.activeEncounter) return;
    setTabFeedback(null);
    const res = await fetch(`/api/pep/${pepData.patient.id}/clinical-meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metaType: "DIAGNOSIS",
        encounterId: pepData.activeEncounter.id,
        ...diagForm,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setTabFeedback(data.message);
      setDiagForm({ icd10Code: "", description: "", type: "SECUNDARIO", notes: "" });
      loadPEP(true);
    } else {
      setTabFeedback(data.error);
    }
  }

  if (accessDeniedError) {
    return (
      <AppShell user={user}>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-red-300 p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <Lock className="w-8 h-8 shrink-0" />
              <div>
                <h1 className="text-lg font-bold">
                  Acesso Clínico Sigiloso Bloqueado pelo Controle de Permissões (RBAC)
                </h1>
                <p className="text-xs text-slate-600">
                  Tentativa registrada automaticamente na Trilha de Auditoria (LGPD / CFM / SBIS)
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{accessDeniedError}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Ir para Gestão Administrativa
              </button>
              <button
                type="button"
                onClick={() => router.push("/auditoria")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Ver Registro na Auditoria
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (loading || !pepData) {
    return (
      <AppShell user={user}>
        <div className="p-8 text-center text-sm text-slate-600">
          Carregando Prontuário Eletrônico do Paciente...
        </div>
      </AppShell>
    );
  }

  const { patient, activeEncounter, timeline, currentUser } = pepData;
  const latestVital = patient.vitalSigns[0] || null;
  const bedCode = activeEncounter?.admission?.bed?.code || "Sem Leito";

  return (
    <AppShell user={user}>
      <div className="max-w-[1600px] mx-auto p-3 lg:p-5 space-y-4">
        {/* CABEÇALHO FIXO E DESTACADO DO PACIENTE (Sempre visível durante o atendimento) */}
        <div className="sticky top-14 z-30 bg-white rounded-xl border-2 border-slate-300 shadow-md overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono font-bold text-xs">
                Leito {bedCode}
              </span>
              <div>
                <h1 className="text-base lg:text-lg font-bold tracking-tight text-white">
                  {patient.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span>
                    Idade: <strong className="text-white">{calcExactAge(patient.birthDate)}</strong> (
                    {new Date(patient.birthDate).toLocaleDateString("pt-BR")})
                  </span>
                  <span>•</span>
                  <span>
                    Prontuário:{" "}
                    <strong className="font-mono text-amber-300">
                      {patient.chartNumber}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Atendimento:{" "}
                    <strong className="font-mono text-emerald-300">
                      {activeEncounter?.encounterNumber || "Encerrado"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Unidade:{" "}
                    <strong className="text-white">
                      {activeEncounter?.unit.code || "Ambulatorial"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllergyModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  patient.allergies.length > 0
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {patient.allergies.length > 0
                    ? `Alergias (${patient.allergies.length}): ${patient.allergies
                        .map((a) => a.substance)
                        .join(", ")}`
                    : "Registrar Alergia"}
                </span>
              </button>

              {currentUser.capabilities.canExportPDF && (
                <button
                  type="button"
                  onClick={handleExportAndPrintPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar PDF / Imprimir</span>
                </button>
              )}
            </div>
          </div>

          {/* Segunda faixa do cabeçalho: Diagnóstico Principal + Precaução + SSVV Recente */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Diagnóstico Principal:</span>
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                {activeEncounter
                  ? `${activeEncounter.mainIcd10} — ${activeEncounter.mainDiagnosis}`
                  : "Sem atendimento ativo"}
              </span>
              {activeEncounter?.admission?.isolationPrecaution && (
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold text-[11px] border border-sky-300">
                  Precaução: {activeEncounter.admission.isolationPrecaution}
                </span>
              )}
            </div>

            {latestVital && (
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-700">
                <span>
                  Último SSVV: <strong>PA {latestVital.systolicBP}/{latestVital.diastolicBP}</strong>
                </span>
                <span>
                  FC <strong>{latestVital.heartRate} bpm</strong>
                </span>
                <span>
                  Tax <strong>{latestVital.temperature}°C</strong>
                </span>
                <span>
                  SpO2 <strong>{latestVital.spo2}%</strong>
                </span>
                <span>
                  Braden <strong>{latestVital.bradenScore ?? "-"}</strong> | SAK{" "}
                  <strong>{latestVital.sakFallScore ?? "-"}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Barra das 10 Abas do Prontuário Eletrônico */}
          <div className="no-print bg-white px-2 pt-1.5 flex items-center gap-1 overflow-x-auto border-t border-slate-200">
            {PEP_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-emerald-50/90 text-emerald-900 border-emerald-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {tabFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {tabFeedback}
            </span>
            <button
              type="button"
              onClick={() => setTabFeedback(null)}
              className="text-slate-500 hover:text-slate-800"
            >
              Fechar
            </button>
          </div>
        )}

        {/* ABA 1 — VISÃO GERAL */}
        {activeTab === "visao-geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            <div className="lg:col-span-8 space-y-4">
              {/* Resumo do Atendimento Atual */}
              <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-bold text-sm text-slate-900">
                    Resumo Clínico do Atendimento Ativo
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                    {activeEncounter?.status || "ATIVO"}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {patient.clinicalHistory || activeEncounter?.reasonForAdmission}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Motivo da Internação
                    </span>
                    <p className="font-medium text-slate-900 mt-0.5">
                      {activeEncounter?.reasonForAdmission}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Dieta Prescrita Vigente
                    </span>
                    <p className="font-medium text-slate-900 mt-0.5">
                      {activeEncounter?.dietSummary}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Linha de Cuidado
                    </span>
                    <p className="font-medium text-slate-900 mt-0.5">
                      {activeEncounter?.careLine || "Cuidado Hospitalar Integrado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Últimas Evoluções e Registros */}
              <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Últimas Evoluções e Anotações Clínicas
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("evolucoes")}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Abrir Editor de Evolução →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {patient.evolutions.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{ev.title}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(ev.finalizedAt || ev.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-slate-700 line-clamp-2">
                        {ev.freeText ||
                          `${ev.subjective ? `S: ${ev.subjective} ` : ""}${
                            ev.objective ? `O: ${ev.objective}` : ""
                          }`}
                      </p>
                      <div className="text-[11px] text-slate-500">
                        Por: <strong>{ev.author.name}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Direita da Visão Geral: Alergias, Diagnósticos Ativos e Sinais Vitais Recentes */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-red-200 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-red-100 pb-2">
                  <h3 className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Alergias e Reações Adversas ({patient.allergies.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAllergyModal(true)}
                    className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                  >
                    + Gerenciar
                  </button>
                </div>
                {patient.allergies.length === 0 ? (
                  <p className="text-slate-500">Nenhuma alergia registrada até o momento.</p>
                ) : (
                  <div className="space-y-2">
                    {patient.allergies.map((alg) => (
                      <div
                        key={alg.id}
                        className="p-2.5 rounded-lg bg-red-50/80 border border-red-200 text-red-950"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{alg.substance}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white">
                            {alg.severity}
                          </span>
                        </div>
                        <div className="text-[11px] mt-0.5">Reação: {alg.reaction}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Diagnósticos Cadastrados (CID-10)
                  </h3>
                </div>
                <div className="space-y-2">
                  {patient.diagnoses.map((d) => (
                    <div
                      key={d.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="font-mono text-emerald-800">{d.icd10Code}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200">
                          {d.type}
                        </span>
                      </div>
                      <div className="font-medium text-slate-800 mt-0.5">{d.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2 — HISTÓRICO CLÍNICO LONGITUDINAL */}
        {activeTab === "historico" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Antecedentes Pessoais e Familiares
                </h3>
                <p className="text-slate-700">
                  <strong>Pessoais:</strong>{" "}
                  {patient.personalAntecedents || "Sem comorbidades prévias relatadas."}
                </p>
                <p className="text-slate-700">
                  <strong>Familiares:</strong>{" "}
                  {patient.familyAntecedents || "Sem antecedentes familiares registrados."}
                </p>
                <p className="text-slate-700">
                  <strong>Histórico Transfusional:</strong> {patient.transfusionHistory}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Medicamentos de Uso Contínuo Domiciliar
                </h3>
                <p className="text-slate-700">
                  {patient.continuousMedications || "Nenhum medicamento de uso contínuo."}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Dados Demográficos e Responsável
                </h3>
                <p>
                  <strong>CPF:</strong> {patient.cpf || "-"} | <strong>CNS:</strong>{" "}
                  {patient.cns || "-"}
                </p>
                <p>
                  <strong>Naturalidade / Cidade:</strong> {patient.birthPlace} / {patient.city}-
                  {patient.state}
                </p>
                <p>
                  <strong>Responsável / Acompanhante:</strong>{" "}
                  {patient.emergencyContactName || "-"} ({patient.emergencyRelationship || "-"}) —{" "}
                  {patient.emergencyPhone || patient.phone || "-"}
                </p>
              </div>
            </div>

            {/* Cadastro de Novo Diagnóstico CID-10 (Se Médico) */}
            {currentUser.capabilities.canRecordMedicalDiagnosis && (
              <form
                onSubmit={handleAddDiagnosis}
                className="bg-white p-4 rounded-xl border border-slate-300 space-y-3"
              >
                <h4 className="font-bold text-sm text-slate-900">
                  Adicionar Diagnóstico Clínico (CID-10) ao Histórico
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    required
                    value={diagForm.icd10Code}
                    onChange={(e) => setDiagForm({ ...diagForm, icd10Code: e.target.value })}
                    placeholder="CID-10 (ex: D70)"
                    className="p-2 rounded border border-slate-300 font-mono uppercase"
                  />
                  <input
                    type="text"
                    required
                    value={diagForm.description}
                    onChange={(e) => setDiagForm({ ...diagForm, description: e.target.value })}
                    placeholder="Descrição do diagnóstico"
                    className="md:col-span-2 p-2 rounded border border-slate-300"
                  />
                  <select
                    value={diagForm.type}
                    onChange={(e) => setDiagForm({ ...diagForm, type: e.target.value })}
                    className="p-2 rounded border border-slate-300"
                  >
                    <option value="PRINCIPAL">Principal</option>
                    <option value="SECUNDARIO">Secundário</option>
                    <option value="COMORBIDADE">Comorbidade</option>
                  </select>
                  <button
                    type="submit"
                    className="p-2 rounded bg-emerald-600 text-white font-bold cursor-pointer"
                  >
                    + Gravar CID-10
                  </button>
                </div>
              </form>
            )}

            {/* Histórico de Internações e Atendimentos Anteriores */}
            <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                Histórico Longitudinal de Internações e Atendimentos ({patient.encounters.length})
              </h3>
              <div className="space-y-2.5">
                {patient.encounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="font-mono">{enc.encounterNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            enc.status === "EM_ANDAMENTO"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {enc.status}
                        </span>
                        <span>• {enc.unit.name}</span>
                      </div>
                      <p className="text-slate-700 mt-1">
                        <strong>Diagnóstico:</strong> {enc.mainIcd10} — {enc.mainDiagnosis} |{" "}
                        <strong>Motivo:</strong> {enc.reasonForAdmission}
                      </p>
                      {enc.dischargeSummary && (
                        <p className="text-slate-600 mt-0.5">
                          <strong>Sumário de Alta:</strong> {enc.dischargeSummary}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-600">
                      <div>Admissão: {new Date(enc.openedAt).toLocaleString("pt-BR")}</div>
                      {enc.closedAt && (
                        <div>Encerramento: {new Date(enc.closedAt).toLocaleString("pt-BR")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3 — EVOLUÇÕES E ANOTAÇÕES (Editor SOAP/Livre com Autosave e Retificação) */}
        {activeTab === "evolucoes" && activeEncounter && (
          <EvolutionEditorTab
            patientId={patient.id}
            encounterId={activeEncounter.id}
            evolutions={patient.evolutions}
            currentUserId={currentUser.id}
            userRole={currentUser.role}
            onSaved={() => loadPEP(true)}
          />
        )}

        {/* ABA 4 — PROCESSO DE ENFERMAGEM (5 Etapas COFEN 736/2024 + Anamnese Horta) */}
        {activeTab === "enfermagem" && activeEncounter && (
          <NursingProcessTab
            patientId={patient.id}
            encounterId={activeEncounter.id}
            patientInfo={{
              name: patient.name,
              birthDate: patient.birthDate,
              sex: patient.sex,
              skinColor: patient.skinColor,
              maritalStatus: patient.maritalStatus,
              occupation: patient.occupation,
              educationLevel: patient.educationLevel,
              birthPlace: patient.birthPlace,
              city: patient.city,
              religion: patient.religion,
              phone: patient.phone,
              emergencyContactName: patient.emergencyContactName,
              emergencyRelationship: patient.emergencyRelationship,
              bedCode,
            }}
            assessments={patient.nursingAssessments}
            plans={patient.nursingPlans}
            canPrescribeNursing={
              currentUser.capabilities.canPrescribeNursingDiagnosisAndPlan
            }
            userRole={currentUser.role}
            onSaved={() => loadPEP(true)}
          />
        )}

        {/* ABA 5 — SINAIS VITAIS E CONTROLES (Monitorização e Controle Hídrico) */}
        {activeTab === "sinais-vitais" && activeEncounter && (
          <VitalSignsTab
            patientId={patient.id}
            encounterId={activeEncounter.id}
            vitals={patient.vitalSigns}
            canRecord={currentUser.capabilities.canRecordVitalSigns}
            onSaved={() => loadPEP(true)}
          />
        )}

        {/* ABA 6 — PRESCRIÇÕES */}
        {activeTab === "prescricoes" && activeEncounter && (
          <PrescriptionsAndChecksTab
            mode="PRESCRICOES"
            patientId={patient.id}
            encounterId={activeEncounter.id}
            prescriptions={patient.prescriptions}
            canPrescribeMedications={currentUser.capabilities.canPrescribeMedications}
            canPrescribeNursingCare={currentUser.capabilities.canPrescribeNursingCare}
            canCheckMedications={currentUser.capabilities.canCheckMedicationsAndCare}
            onSaved={() => loadPEP(true)}
          />
        )}

        {/* ABA 7 — CHECAGEM DE MEDICAMENTOS E CUIDADOS */}
        {activeTab === "checagem" && activeEncounter && (
          <PrescriptionsAndChecksTab
            mode="CHECAGEM"
            patientId={patient.id}
            encounterId={activeEncounter.id}
            prescriptions={patient.prescriptions}
            canPrescribeMedications={currentUser.capabilities.canPrescribeMedications}
            canPrescribeNursingCare={currentUser.capabilities.canPrescribeNursingCare}
            canCheckMedications={currentUser.capabilities.canCheckMedicationsAndCare}
            onSaved={() => loadPEP(true)}
          />
        )}

        {/* ABA 8 — EXAMES E PROCEDIMENTOS */}
        {activeTab === "exames" && (
          <div className="space-y-4 text-xs">
            <form
              onSubmit={handleCreateExam}
              className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3"
            >
              <h3 className="font-bold text-sm text-slate-900">
                Solicitar ou Registrar Resultado de Exame / Procedimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300"
                  >
                    <option value="LABORATORIAL">Exame Laboratorial</option>
                    <option value="IMAGEM">Exame de Imagem</option>
                    <option value="PROCEDIMENTO">Procedimento Clínico / Cirúrgico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={examForm.code}
                    onChange={(e) => setExamForm({ ...examForm, code: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Exame / Procedimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={examForm.name}
                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                    placeholder="Ex: Proteína C Reativa Ultrassensível / Ecocardiograma Transtorácico"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Indicação Clínica *
                  </label>
                  <input
                    type="text"
                    required
                    value={examForm.clinicalIndication}
                    onChange={(e) =>
                      setExamForm({ ...examForm, clinicalIndication: e.target.value })
                    }
                    placeholder="Justificativa clínica do pedido"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Resultado / Laudo Anexado
                  </label>
                  <input
                    type="text"
                    value={examForm.resultSummary}
                    onChange={(e) =>
                      setExamForm({ ...examForm, resultSummary: e.target.value })
                    }
                    placeholder="Resultado estruturado ou resumo do laudo..."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Exame / Procedimento</span>
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-300 p-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Exames Laboratoriais, Imagem e Procedimentos do Paciente ({patient.exams.length})
              </h3>
              <div className="space-y-2.5">
                {patient.exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px]">
                          {ex.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          {ex.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{ex.name}</h4>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(ex.resultAt || ex.requestedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Indicação:</strong> {ex.clinicalIndication}
                    </p>
                    {ex.resultSummary && (
                      <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-slate-900">
                        <strong>Resultado / Laudo:</strong> {ex.resultSummary}
                        {ex.referenceRange && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Valores de Referência: {ex.referenceRange}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 9 — DOCUMENTOS E ANEXOS */}
        {activeTab === "documentos" && (
          <div className="space-y-4 text-xs">
            <form
              onSubmit={handleUploadDocument}
              className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3"
            >
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Anexar Documento PDF ou Imagem Clínica (Validação de Formato e SHA-256)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Título do Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    placeholder="Ex: Termo de Consentimento Informado / Parecer Cardiológico"
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300"
                  >
                    <option value="TERMO_CONSENTIMENTO">Termo de Consentimento</option>
                    <option value="LAUDO_EXTERNO">Laudo Externo PDF</option>
                    <option value="IMAGEM_CLINICA">Imagem Clínica</option>
                    <option value="ENCAMINHAMENTO">Encaminhamento</option>
                    <option value="PARECER">Parecer Especializado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Selecionar Arquivo (PDF / JPEG / PNG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setDocForm({
                        ...docForm,
                        fileName: f.name,
                        mimeType:
                          f.type === "image/png"
                            ? "image/png"
                            : f.type === "image/jpeg"
                            ? "image/jpeg"
                            : "application/pdf",
                        fileSizeBytes: f.size || 120000,
                      });
                    }}
                    className="w-full p-1.5 rounded border border-slate-300 bg-slate-50"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    placeholder="Observações sobre o anexo e autorização de acesso..."
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Validar e Anexar ao Prontuário
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-300 p-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Documentos e Anexos do Prontuário ({patient.documents.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patient.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {doc.category}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(doc.uploadedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{doc.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Arquivo: <strong className="font-mono">{doc.fileName}</strong> (
                      {doc.mimeType} • {Math.round(doc.fileSizeBytes / 1024)} KB)
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      Hash SHA-256: {doc.sha256Hash}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 10 — LINHA DO TEMPO CLÍNICA CRONOLÓGICA */}
        {activeTab === "linha-do-tempo" && (
          <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>
                    Linha do Tempo Unificada do Atendimento ({timeline.length} eventos auditados)
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ordem cronológica reversa integrando admissão, anamneses, evoluções, adendos, processo de enfermagem, sinais vitais, prescrições, checagens, exames e documentos.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "TODOS", label: "Todos" },
                  { id: "EVOLUCAO", label: "Evoluções" },
                  { id: "PROCESSO_ENF", label: "Processo Enf." },
                  { id: "SINAIS_VITAIS", label: "Sinais Vitais" },
                  { id: "PRESCRICAO", label: "Prescrições" },
                  { id: "CHECAGEM", label: "Checagens" },
                  { id: "EXAME", label: "Exames" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTimelineFilter(f.id)}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                      timelineFilter === f.id
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500 space-y-4">
              {timeline
                .filter((ev) => timelineFilter === "TODOS" || ev.type === timelineFilter)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="relative bg-slate-50 rounded-xl border border-slate-200 p-3.5 shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white absolute -left-[31px] top-4" />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                          {ev.badge}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {new Date(ev.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{ev.summary}</p>
                    <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Responsável: <strong className="text-slate-800">{ev.authorName}</strong>{" "}
                        ({ev.authorCouncil})
                      </span>
                      <span className="font-mono font-bold text-emerald-800">{ev.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Modal de Registro de Alergias (Conforme Foto 5 do AGHUse) */}
        {showAllergyModal && (
          <AllergyModal
            patientId={patient.id}
            allergies={patient.allergies}
            onClose={() => setShowAllergyModal(false)}
            onSaved={() => loadPEP(true)}
          />
        )}
      </div>
    </AppShell>
  );
}

export default function ProntuarioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-600">
          Carregando Prontuário Eletrônico...
        </div>
      }
    >
      <ProntuarioContent />
    </Suspense>
  );
}

