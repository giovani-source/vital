"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileEdit,
  FileText,
  Filter,
  HeartPulse,
  Pill,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  Users,
  ArrowUpRight,
} from "lucide-react";

interface PatientRow {
  encounterId: string;
  encounterNumber: string;
  patientId: string;
  name: string;
  birthDate: string;
  sex: string;
  chartNumber: string;
  unitCode: string;
  unitName: string;
  bedCode: string;
  admittedAt: string;
  estimatedDischargeAt: string | null;
  stayDays: number;
  status: string;
  isolationPrecaution: string;
  mainDiagnosis: string;
  riskConditions: string[];
  allergiesCount: number;
  allergiesList: string[];
  hasAnamnesis: boolean;
  hasEvolution: boolean;
  hasDraft: boolean;
  hasPrescription: boolean;
  pendingChecks: number;
  latestVital: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
    painScore?: number;
    bradenScore?: number;
    sakFallScore?: number;
  } | null;
}

interface UnitSummary {
  id: string;
  code: string;
  name: string;
  floor: string;
  specialty: string;
  activeAdmissions: number;
  totalBeds: number;
  freeBeds: number;
  beds: Array<{
    id: string;
    code: string;
    room: string;
    type: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [kpis, setKpis] = useState({
    admittedPatients: 0,
    activeEncounters: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    freeBeds: 0,
    pendingClinicalRecords: 0,
    pendingCareActivities: 0,
    activeAlerts: 0,
  });
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [alerts, setAlerts] = useState<
    Array<{
      id: string;
      patientId: string;
      patientName: string;
      chartNumber: string;
      bedCode: string;
      severity: "ALTA" | "MEDIA";
      title: string;
      description: string;
    }>
  >([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const params = new URLSearchParams();
      if (selectedUnit) params.set("unit", selectedUnit);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const dashRes = await fetch(`/api/dashboard?${params.toString()}`);
      if (dashRes.ok) {
        const data = await dashRes.json();
        setKpis(data.kpis);
        setUnits(data.units);
        setPatients(data.patients);
        setAlerts(data.alerts);
        if (data.patients.length > 0 && !selectedPatient) {
          const jose = data.patients.find((p: PatientRow) => p.chartNumber === "7834153");
          setSelectedPatient(jose || data.patients[0]);
        }
        setLastUpdated(
          new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router, selectedUnit, searchQuery, selectedPatient]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function calcAge(birthDateStr: string): number {
    const dob = new Date(birthDateStr);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  return (
    <AppShell user={user}>
      <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Cabeçalho do Dashboard Hospitalar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Censo Hospitalar em Tempo Real
              </span>
              <span className="text-xs text-slate-500">
                Atualizado às {lastUpdated || "--:--"}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 mt-1">
              Lista de Pacientes de Enfermagem e Atendimentos Ativos
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Atualizar Lista</span>
            </button>

            <Link
              href={
                selectedPatient
                  ? `/prontuario/${selectedPatient.chartNumber}?tab=checagem`
                  : "/prontuario/7834153?tab=checagem"
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Checar Beira-Leito</span>
            </Link>

            <Link
              href="/pacientes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo Paciente / Internar</span>
            </Link>
          </div>
        </div>

        {/* Cartões de Indicadores (KPIs) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Pacientes Internados</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpis.admittedPatients}</p>
            <p className="text-[11px] text-emerald-700 font-medium">
              {kpis.activeEncounters} atendimentos em andamento
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Leitos Ocupados / Livres</span>
              <BedDouble className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {kpis.occupiedBeds}{" "}
              <span className="text-sm font-normal text-slate-500">
                / {kpis.totalBeds}
              </span>
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              {kpis.freeBeds} leitos disponíveis agora
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Pacientes 5º Sul</span>
              <Stethoscope className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {units.find((u) => u.code === "5SUL")?.activeAdmissions ?? 0}
            </p>
            <p className="text-[11px] text-slate-500">
              Estação 5SUL-5S3 (Onco/Clínica)
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Rascunhos Pendentes</span>
              <FileEdit className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {kpis.pendingClinicalRecords}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              Registros aguardando finalização
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Checagens Pendentes</span>
              <Pill className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {kpis.pendingCareActivities}
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              Horários aprazados no plantão
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Alertas Assistenciais</span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{kpis.activeAlerts}</p>
            <p className="text-[11px] text-red-700 font-medium">
              Alergias graves e risco queda/LP
            </p>
          </div>
        </div>

        {/* Filtros de Unidade Hospitalar e Pesquisa */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Unidade:
            </span>
            <button
              type="button"
              onClick={() => setSelectedUnit("")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedUnit === ""
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Todas ({kpis.admittedPatients})
            </button>
            {units.map((u) => (
              <button
                key={u.code}
                type="button"
                onClick={() => setSelectedUnit(u.code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedUnit === u.code
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {u.code} ({u.activeAdmissions}/{u.totalBeds} leitos)
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome, prontuário ou leito (ex: 0551A)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Grade Principal: Tabela Estilo AGHUse + Barra Lateral Direita de Ações Contextuais */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Tabela Principal de Pacientes Internados */}
          <div className="xl:col-span-9 bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
              <span>
                Lista de Pacientes Internados — Selecionado:{" "}
                <strong className="text-amber-300">
                  {selectedPatient
                    ? `${selectedPatient.bedCode} • ${selectedPatient.name} (Prontuário ${selectedPatient.chartNumber})`
                    : "Nenhum"}
                </strong>
              </span>
              <span>Total na lista: {patients.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-50/80 border-b border-slate-300 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-2.5">Local / Leito</th>
                    <th className="py-2.5 px-2">Condições</th>
                    <th className="py-2.5 px-3">Nome do Paciente</th>
                    <th className="py-2.5 px-2">Data Nasc.</th>
                    <th className="py-2.5 px-1.5 text-center">Idade</th>
                    <th className="py-2.5 px-2.5">Prontuário</th>
                    <th className="py-2.5 px-2">Admissão</th>
                    <th className="py-2.5 px-1.5 text-center" title="Anamnese de Enfermagem">
                      Anamn
                    </th>
                    <th className="py-2.5 px-1.5 text-center" title="Evolução Clínica">
                      Evol
                    </th>
                    <th className="py-2.5 px-1.5 text-center" title="Prescrição Vigente">
                      Presc
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Últimos Sinais Vitais">
                      Controles
                    </th>
                    <th className="py-2.5 px-1.5 text-center" title="Permanência em dias">
                      Perm
                    </th>
                    <th className="py-2.5 px-2">Situação</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan={14} className="py-10 px-4 text-center space-y-3">
                        <p className="text-sm font-bold text-slate-800">
                          Nenhum paciente internado no momento (banco de dados limpo, sem dados fictícios).
                        </p>
                        <p className="text-xs text-slate-500 max-w-xl mx-auto">
                          Cadastre um paciente e vincule-o a um leito disponível para abrir o Prontuário
                          Eletrônico completo, registrar evoluções, Processo de Enfermagem e prescrições.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <Link
                            href="/pacientes"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                          >
                            + Cadastrar Paciente e Internar
                          </Link>
                          <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs"
                          >
                            Gerenciar / Liberar Perfis (ADM)
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                  {patients.map((p) => {
                    const isSelected = selectedPatient?.patientId === p.patientId;
                    return (
                      <tr
                        key={p.encounterId}
                        onClick={() => setSelectedPatient(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-amber-200/80 hover:bg-amber-200 font-medium text-slate-950"
                            : "hover:bg-sky-50/80 text-slate-800"
                        }`}
                      >
                        <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-900 text-white text-[11px]">
                            L:{p.bedCode}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                            {p.unitCode}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {p.allergiesCount > 0 && (
                              <span
                                className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold"
                                title={`Alergia: ${p.allergiesList.join(", ")}`}
                              >
                                ALG
                              </span>
                            )}
                            {p.riskConditions.includes("QUEDA") && (
                              <span
                                className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold"
                                title="Risco de Queda (Escala SAK)"
                              >
                                QUEDA
                              </span>
                            )}
                            {p.riskConditions.includes("LESAO_PRESSAO") && (
                              <span
                                className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold"
                                title="Risco de Lesão por Pressão (Escala Braden)"
                              >
                                LPP
                              </span>
                            )}
                            {p.isolationPrecaution !== "Padrão" && (
                              <span
                                className="px-1.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold"
                                title={`Precaução: ${p.isolationPrecaution}`}
                              >
                                ISO
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-600 truncate max-w-xs">
                            {p.mainDiagnosis}
                          </div>
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-[11px]">
                          {new Date(p.birthDate).toLocaleDateString("pt-BR")}
                        </td>

                        <td className="py-2.5 px-1.5 text-center font-semibold">
                          {calcAge(p.birthDate)}a
                        </td>

                        <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">
                          {p.chartNumber}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap text-[11px]">
                          <div>{new Date(p.admittedAt).toLocaleDateString("pt-BR")}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(p.admittedAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        <td
                          className="py-2.5 px-1.5 text-center"
                          title={
                            p.hasAnamnesis
                              ? "Anamnese de Enfermagem finalizada"
                              : "Anamnese pendente"
                          }
                        >
                          {p.hasAnamnesis ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 mx-auto" />
                          )}
                        </td>

                        <td
                          className="py-2.5 px-1.5 text-center"
                          title={
                            p.hasEvolution
                              ? "Evolução registrada no turno"
                              : "Aguardando evolução do turno"
                          }
                        >
                          {p.hasEvolution ? (
                            <FileText className="w-4 h-4 text-blue-600 mx-auto" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400 mx-auto" />
                          )}
                        </td>

                        <td className="py-2.5 px-1.5 text-center">
                          {p.hasPrescription ? (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                              title="Prescrição vigente"
                            >
                              VIG
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          {p.latestVital ? (
                            <span className="text-[11px] font-mono text-slate-700">
                              {p.latestVital.systolicBP}/{p.latestVital.diastolicBP} •{" "}
                              {p.latestVital.temperature}°C
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem reg.</span>
                          )}
                        </td>

                        <td className="py-2.5 px-1.5 text-center font-bold text-slate-800">
                          {p.stayDays}d
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            INTERNADO
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Link
                            href={`/prontuario/${p.chartNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold shadow-2xs"
                          >
                            <span>Abrir PEP</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barra Direita de Ações Contextuais (Inspirada na coluna vertical direita do AGHUse Foto 5) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs p-3.5">
              <div className="border-b border-slate-200 pb-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Ações Rápidas do Paciente Selecionado
                </span>
                <h2 className="font-bold text-sm text-slate-900 truncate mt-0.5">
                  {selectedPatient ? selectedPatient.name : "Selecione um paciente"}
                </h2>
                {selectedPatient && (
                  <p className="text-xs text-slate-500 font-mono">
                    Prontuário: {selectedPatient.chartNumber} | Leito: {selectedPatient.bedCode}
                  </p>
                )}
              </div>

              {selectedPatient ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-1.5">
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=visao-geral`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs"
                  >
                    <span>1. Abrir Prontuário Completo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=enfermagem`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Anamnese / Processo Enf.</span>
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=evolucoes`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Evolução / Anotação SOAP</span>
                    <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=sinais-vitais`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Controles & Balanço Hídrico</span>
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=prescricoes`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Prescrição Médica / Enf.</span>
                    <Pill className="w-3.5 h-3.5 text-indigo-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=checagem`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Aprazar / Checar Beira-Leito</span>
                    <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=visao-geral&modal=alergia`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-semibold"
                  >
                    <span>Alergias ({selectedPatient.allergiesCount})</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=exames`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Solicitar / Consultar Exames</span>
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                  </Link>
                  <Link
                    href={`/prontuario/${selectedPatient.chartNumber}?tab=linha-do-tempo`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 text-xs font-semibold"
                  >
                    <span>Linha do Tempo Completa</span>
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Painel de Alertas Clínicos Ativos */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Alertas Clínicos Relevantes
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                  {alerts.length}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.map((al) => (
                  <Link
                    key={al.id}
                    href={`/prontuario/${al.chartNumber}`}
                    className={`block p-2.5 rounded-lg border text-xs transition-colors ${
                      al.severity === "ALTA"
                        ? "bg-red-50/80 border-red-200 hover:bg-red-100/80 text-red-950"
                        : "bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span>
                        L:{al.bedCode} • {al.patientName}
                      </span>
                      <span className="text-[10px] font-mono">{al.chartNumber}</span>
                    </div>
                    <div className="font-semibold text-[11px]">{al.title}</div>
                    <div className="text-[11px] opacity-85 mt-0.5">{al.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mapa de Leitos por Unidade */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-emerald-600" />
            <span>Mapa Operacional de Leitos por Unidade Hospitalar</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {units.map((u) => (
              <div
                key={u.id}
                className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{u.code}</span>
                  <span className="text-[11px] text-slate-600">
                    {u.freeBeds} livres de {u.totalBeds}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">{u.name}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {u.beds.map((b) => (
                    <span
                      key={b.id}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                        b.status === "OCUPADO"
                          ? "bg-amber-100 border-amber-300 text-amber-900"
                          : b.status === "LIVRE"
                          ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                          : "bg-slate-200 border-slate-300 text-slate-700"
                      }`}
                      title={`${b.code} (${b.type}) — ${b.status}`}
                    >
                      {b.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

