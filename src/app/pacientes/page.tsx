"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import {
  UserPlus,
  Search,
  FileText,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  ShieldAlert,
  PlusCircle,
} from "lucide-react";

interface PatientItem {
  id: string;
  chartNumber: string;
  name: string;
  birthDate: string;
  sex: string;
  skinColor: string;
  maritalStatus: string;
  occupation: string;
  cpf: string | null;
  cns: string | null;
  phone: string | null;
  emergencyContactName: string | null;
  emergencyRelationship: string | null;
  bloodType: string | null;
  clinicalHistory: string | null;
  personalAntecedents: string | null;
  continuousMedications: string | null;
  allergies: Array<{ id: string; substance: string; reaction: string; severity: string }>;
  diagnoses: Array<{ id: string; icd10Code: string; description: string }>;
  encounters: Array<{
    id: string;
    encounterNumber: string;
    type: string;
    status: string;
    mainDiagnosis: string;
    mainIcd10: string;
    openedAt: string;
    closedAt: string | null;
    unit: { code: string; name: string };
    admission: { bed: { code: string } } | null;
  }>;
}

interface HospitalUnitItem {
  id: string;
  code: string;
  name: string;
  beds: Array<{ id: string; code: string; status: string; room: string }>;
}

function PacientesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [units, setUnits] = useState<HospitalUnitItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Estado do formulário de novo paciente
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "1985-05-14",
    sex: "F",
    skinColor: "Branca",
    maritalStatus: "Casado(a)",
    occupation: "Analista Administrativa",
    cpf: "",
    cns: "",
    chartNumber: `${Math.floor(18500000 + Math.random() * 900000)}`,
    phone: "(51) 99800-1122",
    emergencyContactName: "",
    emergencyRelationship: "Cônjuge",
    bloodType: "A+",
    clinicalHistory: "",
    personalAntecedents: "",
    familyAntecedents: "",
    continuousMedications: "",
    createAdmission: true,
    unitId: "",
    bedId: "",
    mainDiagnosis: "",
    mainIcd10: "I10",
    reasonForAdmission: "",
  });

  // Modal de nova internação para paciente já cadastrado
  const [admitModalPatient, setAdmitModalPatient] = useState<PatientItem | null>(null);
  const [admitData, setAdmitData] = useState({
    unitId: "",
    bedId: "",
    mainIcd10: "J18.9",
    mainDiagnosis: "",
    reasonForAdmission: "",
    isolationPrecaution: "Padrão",
  });

  const loadData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    const meData = await meRes.json();
    setUser(meData.user);

    const res = await fetch(
      `/api/patients${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ""}`
    );
    if (res.ok) {
      const data = await res.json();
      setPatients(data.patients);
      setUnits(data.units);
      if (data.units.length > 0 && !formData.unitId) {
        const firstUnit = data.units[0];
        const freeBed = firstUnit.beds.find((b: { status: string }) => b.status === "LIVRE");
        setFormData((prev) => ({
          ...prev,
          unitId: firstUnit.id,
          bedId: freeBed ? freeBed.id : "",
        }));
        setAdmitData((prev) => ({
          ...prev,
          unitId: firstUnit.id,
          bedId: freeBed ? freeBed.id : "",
        }));
      }
    }
  }, [router, searchQuery, formData.unitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao cadastrar paciente." });
      return;
    }

    setFeedback({
      type: "success",
      text: `Paciente ${data.patient.name} (Prontuário ${data.patient.chartNumber}) cadastrado com sucesso!`,
    });
    setShowNewPatientForm(false);
    setFormData((prev) => ({
      ...prev,
      name: "",
      cpf: "",
      cns: "",
      chartNumber: `${Math.floor(18500000 + Math.random() * 900000)}`,
      clinicalHistory: "",
      personalAntecedents: "",
      continuousMedications: "",
      mainDiagnosis: "",
      reasonForAdmission: "",
    }));
    await loadData();
  }

  async function handleCreateEncounter(e: React.FormEvent) {
    e.preventDefault();
    if (!admitModalPatient) return;
    setFeedback(null);

    const res = await fetch(`/api/patients/${admitModalPatient.id}/encounters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ENCOUNTER",
        ...admitData,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao registrar internação." });
      return;
    }

    setFeedback({
      type: "success",
      text: `Novo atendimento ${data.encounter.encounterNumber} registrado para ${admitModalPatient.name}.`,
    });
    setAdmitModalPatient(null);
    await loadData();
  }

  const selectedUnitForForm = units.find((u) => u.id === formData.unitId);
  const selectedUnitForAdmit = units.find((u) => u.id === admitData.unitId);

  return (
    <AppShell user={user}>
      <div className="p-4 lg:p-6 space-y-5 max-w-[1500px] mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700">
              Módulo 3 — Cadastro Longitudinal e Admissão Hospitalar
            </span>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900">
              Cadastro de Pacientes e Histórico de Atendimentos / Internações
            </h1>
            <p className="text-xs text-slate-500">
              Cada paciente possui identificador e prontuário únicos, podendo ter múltiplos atendimentos e internações ao longo do tempo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewPatientForm(!showNewPatientForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showNewPatientForm ? "Fechar Formulário" : "Cadastrar Novo Paciente"}</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Formulário de Cadastro de Paciente */}
        {showNewPatientForm && (
          <form
            onSubmit={handleCreatePatient}
            className="bg-white rounded-xl border border-emerald-300 shadow-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-sm text-slate-900">
                Novo Cadastro de Paciente (Identificação, Demografia, Antecedentes e Admissão)
              </h2>
              <span className="text-[11px] text-slate-500">
                Campos validados pelo schema Zod no servidor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: CLAUDIA FERREIRA MONTEIRO"
                  className="w-full px-3 py-2 rounded border border-slate-300 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número do Prontuário *
                </label>
                <input
                  type="text"
                  required
                  value={formData.chartNumber}
                  onChange={(e) => setFormData({ ...formData, chartNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sexo *</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300"
                >
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="I">Intersexo / Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cartão Nacional de Saúde (CNS)
                </label>
                <input
                  type="text"
                  value={formData.cns}
                  onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                  placeholder="700000000000000"
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo Sanguíneo</label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Acompanhante / Responsável
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                  placeholder="Nome do familiar ou responsável legal"
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grau de Relação</label>
                <input
                  type="text"
                  value={formData.emergencyRelationship}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyRelationship: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Histórico Clínico Relevante
                </label>
                <textarea
                  rows={2}
                  value={formData.clinicalHistory}
                  onChange={(e) =>
                    setFormData({ ...formData, clinicalHistory: e.target.value })
                  }
                  placeholder="Resumo clínico, condições crônicas e contexto assistencial..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Antecedentes Pessoais e Medicamentos de Uso Contínuo
                </label>
                <textarea
                  rows={2}
                  value={formData.continuousMedications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      continuousMedications: e.target.value,
                      personalAntecedents: e.target.value,
                    })
                  }
                  placeholder="Ex: Losartana 50mg 1x/dia, Metformina 850mg 2x/dia..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
            </div>

            {/* Opção de Internar Imediatamente em Unidade / Leito */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createAdmission}
                  onChange={(e) =>
                    setFormData({ ...formData, createAdmission: e.target.checked })
                  }
                />
                <span>Vincular Atendimento e Internação Imediata em Unidade / Leito</span>
              </label>

              {formData.createAdmission && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Unidade</label>
                    <select
                      value={formData.unitId}
                      onChange={(e) => {
                        const u = units.find((unit) => unit.id === e.target.value);
                        const free = u?.beds.find((b) => b.status === "LIVRE");
                        setFormData({
                          ...formData,
                          unitId: e.target.value,
                          bedId: free ? free.id : "",
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.code} — {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Leito Disponível
                    </label>
                    <select
                      value={formData.bedId}
                      onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    >
                      {selectedUnitForForm?.beds
                        .filter((b) => b.status === "LIVRE")
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code} ({b.room}) — LIVRE
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      CID-10 e Diagnóstico Principal
                    </label>
                    <input
                      type="text"
                      value={formData.mainDiagnosis}
                      onChange={(e) =>
                        setFormData({ ...formData, mainDiagnosis: e.target.value })
                      }
                      placeholder="Ex: Crise hipertensiva / Investigação"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Motivo da Internação
                    </label>
                    <input
                      type="text"
                      value={formData.reasonForAdmission}
                      onChange={(e) =>
                        setFormData({ ...formData, reasonForAdmission: e.target.value })
                      }
                      placeholder="Queixa principal / Indicação"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewPatientForm(false)}
                className="px-4 py-2 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                Salvar Cadastro no Banco de Dados
              </button>
            </div>
          </form>
        )}

        {/* Barra de Pesquisa de Pacientes */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por Nome Completo, Número de Prontuário, CPF ou Cartão Nacional de Saúde (CNS)..."
            className="flex-1 text-xs focus:outline-none"
          />
        </div>

        {/* Lista de Pacientes com Histórico de Atendimentos (Paciente vs. Atendimento) */}
        <div className="space-y-3">
          {patients.map((p) => {
            const activeEnc = p.encounters.find((e) => e.status === "EM_ANDAMENTO");
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                        Prontuário: {p.chartNumber}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{p.name}</h2>
                      {activeEnc ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          INTERNADO • Leito {activeEnc.admission?.bed?.code || "S/L"} ({activeEnc.unit.code})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Sem internação ativa
                        </span>
                      )}
                      {p.allergies.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Alergias: {p.allergies.map((a) => a.substance).join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Nasc.: {new Date(p.birthDate).toLocaleDateString("pt-BR")} • Sexo: {p.sex}
                      </span>
                      <span>CPF: {p.cpf || "Não informado"}</span>
                      <span>CNS: {p.cns || "Não informado"}</span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {p.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdmitModalPatient(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Novo Atendimento</span>
                    </button>

                    <Link
                      href={`/prontuario/${p.chartNumber}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Acessar Prontuário (PEP)</span>
                    </Link>
                  </div>
                </div>

                {/* Histórico de Atendimentos / Internações deste Paciente */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">
                    Histórico de Atendimentos e Internações ({p.encounters.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {p.encounters.map((enc) => (
                      <div
                        key={enc.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          enc.status === "EM_ANDAMENTO"
                            ? "bg-emerald-50/60 border-emerald-300"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="font-mono">{enc.encounterNumber}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">
                              {enc.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {enc.unit.code} • Leito {enc.admission?.bed?.code || "Alta"} •{" "}
                            {enc.mainIcd10} - {enc.mainDiagnosis}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Início: {new Date(enc.openedAt).toLocaleString("pt-BR")}
                            {enc.closedAt
                              ? ` | Alta: ${new Date(enc.closedAt).toLocaleDateString("pt-BR")}`
                              : ""}
                          </div>
                        </div>

                        <Link
                          href={`/prontuario/${p.chartNumber}`}
                          className="text-xs font-semibold text-emerald-700 hover:underline ml-2 shrink-0"
                        >
                          Ver PEP
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Novo Atendimento / Internação para Paciente Existente */}
        {admitModalPatient && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateEncounter}
              className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Novo Atendimento / Internação — {admitModalPatient.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdmitModalPatient(null)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={admitData.unitId}
                    onChange={(e) => {
                      const u = units.find((unit) => unit.id === e.target.value);
                      const free = u?.beds.find((b) => b.status === "LIVRE");
                      setAdmitData({
                        ...admitData,
                        unitId: e.target.value,
                        bedId: free ? free.id : "",
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} — {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Leito</label>
                  <select
                    value={admitData.bedId}
                    onChange={(e) => setAdmitData({ ...admitData, bedId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded border border-slate-300 font-mono"
                  >
                    {selectedUnitForAdmit?.beds
                      .filter((b) => b.status === "LIVRE")
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code} ({b.room})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CID-10</label>
                  <input
                    type="text"
                    required
                    value={admitData.mainIcd10}
                    onChange={(e) =>
                      setAdmitData({ ...admitData, mainIcd10: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Precaução / Isolamento
                  </label>
                  <select
                    value={admitData.isolationPrecaution}
                    onChange={(e) =>
                      setAdmitData({ ...admitData, isolationPrecaution: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  >
                    <option value="Padrão">Padrão</option>
                    <option value="Contato">Contato</option>
                    <option value="Gotículas">Gotículas</option>
                    <option value="Protetor / Neutropênico">Protetor / Neutropênico</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Diagnóstico Principal do Atendimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={admitData.mainDiagnosis}
                    onChange={(e) =>
                      setAdmitData({ ...admitData, mainDiagnosis: e.target.value })
                    }
                    placeholder="Descrição diagnóstica da internação atual"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Motivo da Internação *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={admitData.reasonForAdmission}
                    onChange={(e) =>
                      setAdmitData({ ...admitData, reasonForAdmission: e.target.value })
                    }
                    placeholder="Justificativa clínica para admissão hospitalar"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdmitModalPatient(null)}
                  className="px-3 py-1.5 rounded border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                >
                  Confirmar Internação
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function PacientesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-600">Carregando módulo de pacientes...</div>}>
      <PacientesContent />
    </Suspense>
  );
}

