"use client";

import React, { useState } from "react";
import {
  HeartPulse,
  Droplets,
  Plus,
  Printer,
  RotateCcw,
  Search,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface VitalRecordItem {
  id: string;
  recordedAt: string;
  systolicBP: number | null;
  diastolicBP: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  spo2: number | null;
  painScore: number | null;
  capillaryGlucose: number | null;
  weightKg: number | null;
  bradenScore: number | null;
  sakFallScore: number | null;
  fluidIntakeMl: number | null;
  fluidOutputMl: number | null;
  fluidDescription: string | null;
  notes: string | null;
  recordedBy: {
    name: string;
    role: string;
    professional?: {
      councilType: string;
      councilNumber: string;
      councilState: string;
    } | null;
  };
}

interface VitalSignsTabProps {
  patientId: string;
  encounterId: string;
  vitals: VitalRecordItem[];
  canRecord: boolean;
  onSaved: () => void;
}

export default function VitalSignsTab({
  patientId,
  encounterId,
  vitals,
  canRecord,
  onSaved,
}: VitalSignsTabProps) {
  const [subTab, setSubTab] = useState<"MONITORIZACAO" | "CONTROLE_HIDRICO" | "GRAFICOS">(
    "MONITORIZACAO"
  );
  const [periodHours, setPeriodHours] = useState<string>("ALL");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showBhSummary, setShowBhSummary] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [form, setForm] = useState({
    systolicBP: "120",
    diastolicBP: "78",
    heartRate: "76",
    respiratoryRate: "17",
    temperature: "36.5",
    spo2: "98",
    painScore: "0",
    capillaryGlucose: "104",
    weightKg: "74.3",
    bradenScore: "19",
    sakFallScore: "7",
    fluidIntakeMl: "350",
    fluidOutputMl: "300",
    fluidDescription: "",
    notes: "",
  });

  const filteredVitals = vitals.filter((v) => {
    if (periodHours === "ALL") return true;
    const hrs = Number(periodHours);
    const cutoff = Date.now() - hrs * 60 * 60 * 1000;
    return new Date(v.recordedAt).getTime() >= cutoff;
  });

  const totalIntake = filteredVitals.reduce((acc, v) => acc + (v.fluidIntakeMl ?? 0), 0);
  const totalOutput = filteredVitals.reduce((acc, v) => acc + (v.fluidOutputMl ?? 0), 0);
  const netBalance = totalIntake - totalOutput;

  async function handleSaveVital(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const payload = {
      encounterId,
      systolicBP: form.systolicBP ? Number(form.systolicBP) : null,
      diastolicBP: form.diastolicBP ? Number(form.diastolicBP) : null,
      heartRate: form.heartRate ? Number(form.heartRate) : null,
      respiratoryRate: form.respiratoryRate ? Number(form.respiratoryRate) : null,
      temperature: form.temperature ? Number(form.temperature) : null,
      spo2: form.spo2 ? Number(form.spo2) : null,
      painScore: form.painScore !== "" ? Number(form.painScore) : null,
      capillaryGlucose: form.capillaryGlucose ? Number(form.capillaryGlucose) : null,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      bradenScore: form.bradenScore ? Number(form.bradenScore) : null,
      sakFallScore: form.sakFallScore ? Number(form.sakFallScore) : null,
      fluidIntakeMl: form.fluidIntakeMl ? Number(form.fluidIntakeMl) : null,
      fluidOutputMl: form.fluidOutputMl ? Number(form.fluidOutputMl) : null,
      fluidDescription: form.fluidDescription || null,
      notes: form.notes || null,
    };

    const res = await fetch(`/api/pep/${patientId}/vitals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao registrar controle." });
      return;
    }

    setFeedback({ type: "success", text: data.message });
    setShowNewForm(false);
    setForm((prev) => ({ ...prev, fluidDescription: "", notes: "" }));
    onSaved();
  }

  const chronologicalForChart = [...filteredVitals].reverse();

  return (
    <div className="space-y-4 text-xs">
      {/* Barra de Filtro e Botões estilo AGHUse Controles do Paciente (Foto 1) */}
      <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Período de Consulta
            </label>
            <select
              value={periodHours}
              onChange={(e) => setPeriodHours(e.target.value)}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
            >
              <option value="ALL">Todo o Internamento</option>
              <option value="24">Últimas 24 horas</option>
              <option value="48">Últimas 48 horas</option>
              <option value="168">Últimos 7 dias</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 pt-4">
            <button
              type="button"
              onClick={() => setPeriodHours("ALL")}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-slate-800 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pesquisar</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriodHours("ALL")}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Limpar</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-slate-800 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBhSummary(!showBhSummary)}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 font-bold text-emerald-950 cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-700" />
              <span>Visualizar Resumo BH ({netBalance >= 0 ? `+${netBalance}` : netBalance} mL)</span>
            </button>
          </div>
        </div>

        {canRecord && (
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showNewForm ? "Fechar Lançamento" : "+ Novo Controle / SSVV"}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2 ${
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

      {/* Resumo de Balanço Hídrico (BH) */}
      {showBhSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-sky-50 p-3.5 rounded-xl border border-sky-200">
          <div className="bg-white p-3 rounded-lg border border-sky-200">
            <span className="text-slate-500 block">Total Infundido / Administrado</span>
            <strong className="text-lg font-bold text-emerald-700">+{totalIntake} mL</strong>
          </div>
          <div className="bg-white p-3 rounded-lg border border-sky-200">
            <span className="text-slate-500 block">Total Eliminado (Diurese / Drenos)</span>
            <strong className="text-lg font-bold text-amber-700">-{totalOutput} mL</strong>
          </div>
          <div className="bg-white p-3 rounded-lg border border-sky-200">
            <span className="text-slate-500 block">Balanço Hídrico Acumulado (BHT)</span>
            <strong
              className={`text-lg font-bold ${
                netBalance > 500 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {netBalance >= 0 ? `+${netBalance}` : netBalance} mL
            </strong>
          </div>
        </div>
      )}

      {/* Formulário para Registro de Novos Sinais Vitais e Balanço Hídrico */}
      {showNewForm && (
        <form
          onSubmit={handleSaveVital}
          className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-slate-900">
              Novo Registro de Monitorização e Controle Hídrico
            </h3>
            <span className="text-[11px] text-slate-500">
              Unidades: PA (mmHg) • FC (bpm) • FR (irpm) • Tax (°C) • SpO2 (%) • Glic Cap (mg/dL)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PAS (mmHg)</label>
              <input
                type="number"
                value={form.systolicBP}
                onChange={(e) => setForm({ ...form, systolicBP: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PAD (mmHg)</label>
              <input
                type="number"
                value={form.diastolicBP}
                onChange={(e) => setForm({ ...form, diastolicBP: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">FC (bpm)</label>
              <input
                type="number"
                value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">FR (irpm)</label>
              <input
                type="number"
                value={form.respiratoryRate}
                onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax (°C)</label>
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dor CALOI (0-10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.painScore}
                onChange={(e) => setForm({ ...form, painScore: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={form.spo2}
                onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Glic Cap (mg/dL)</label>
              <input
                type="number"
                value={form.capillaryGlucose}
                onChange={(e) => setForm({ ...form, capillaryGlucose: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Braden (6-23)</label>
              <input
                type="number"
                value={form.bradenScore}
                onChange={(e) => setForm({ ...form, bradenScore: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SAK Quedas</label>
              <input
                type="number"
                value={form.sakFallScore}
                onChange={(e) => setForm({ ...form, sakFallScore: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-800 mb-1">Infundido (mL)</label>
              <input
                type="number"
                value={form.fluidIntakeMl}
                onChange={(e) => setForm({ ...form, fluidIntakeMl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-emerald-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-amber-800 mb-1">Eliminado (mL)</label>
              <input
                type="number"
                value={form.fluidOutputMl}
                onChange={(e) => setForm({ ...form, fluidOutputMl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-amber-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resumo BH / Item</label>
              <input
                type="text"
                value={form.fluidDescription}
                onChange={(e) => setForm({ ...form, fluidDescription: e.target.value })}
                placeholder="Ex: BHP -50 | SF 0,9%"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Anotações do Controle de Horário
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Administrado item prescrito, diurese espontânea clara, resta SF 500mL..."
              className="w-full px-3 py-1.5 rounded border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1.5 rounded border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Gravar Controles no Banco
            </button>
          </div>
        </form>
      )}

      {/* Faixa Verde de Sub-Abas idêntica à Foto 1 do AGHUse: Monitorização | Controle Hídrico | Gráficos */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
        <div className="bg-emerald-700 px-3 pt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab("MONITORIZACAO")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-md font-bold transition-colors cursor-pointer ${
              subTab === "MONITORIZACAO"
                ? "bg-white text-slate-900"
                : "bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Monitorização</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("CONTROLE_HIDRICO")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-md font-bold transition-colors cursor-pointer ${
              subTab === "CONTROLE_HIDRICO"
                ? "bg-white text-slate-900"
                : "bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Controle Hídrico</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("GRAFICOS")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-md font-bold transition-colors cursor-pointer ${
              subTab === "GRAFICOS"
                ? "bg-white text-slate-900"
                : "bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Gráficos de Evolução</span>
          </button>
        </div>

        {/* Conteúdo da Sub-Aba Monitorização (Grade idêntica à Foto 1) */}
        {subTab === "MONITORIZACAO" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[11px]">
                  <th className="py-2.5 px-3">Horários</th>
                  <th className="py-2.5 px-2 text-center">PAS</th>
                  <th className="py-2.5 px-2 text-center">PAD</th>
                  <th className="py-2.5 px-2 text-center">FC</th>
                  <th className="py-2.5 px-2 text-center">FR</th>
                  <th className="py-2.5 px-2 text-center">Tax (°C)</th>
                  <th className="py-2.5 px-2 text-center">Dor CALOI</th>
                  <th className="py-2.5 px-2 text-center">SpO2 (%)</th>
                  <th className="py-2.5 px-2 text-center">Glic Cap</th>
                  <th className="py-2.5 px-2 text-center">Peso</th>
                  <th className="py-2.5 px-2 text-center">Braden</th>
                  <th className="py-2.5 px-2 text-center">SAK</th>
                  <th className="py-2.5 px-3">Anotações / BH</th>
                  <th className="py-2.5 px-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVitals.map((v) => (
                  <tr key={v.id} className="hover:bg-sky-50/60">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 font-mono font-bold text-[11px]">
                        {new Date(v.recordedAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-semibold">
                      {v.systolicBP ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-semibold">
                      {v.diastolicBP ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono">
                      {v.heartRate ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono">
                      {v.respiratoryRate ?? "-"}
                    </td>
                    <td
                      className={`py-2 px-2 text-center font-mono font-bold ${
                        (v.temperature ?? 36.5) >= 37.8
                          ? "text-red-600"
                          : "text-slate-800"
                      }`}
                    >
                      {v.temperature ?? "-"}
                    </td>
                    <td
                      className={`py-2 px-2 text-center font-mono font-bold ${
                        (v.painScore ?? 0) >= 5 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {v.painScore ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-semibold text-emerald-800">
                      {v.spo2 ? `${v.spo2}%` : "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono">
                      {v.capillaryGlucose ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono">
                      {v.weightKg ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      {v.bradenScore ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      {v.sakFallScore ?? "-"}
                    </td>
                    <td className="py-2 px-3 text-slate-800 max-w-md">
                      {v.fluidDescription && (
                        <span className="font-bold text-slate-900 mr-1.5">
                          [{v.fluidDescription}]
                        </span>
                      )}
                      <span>{v.notes || ""}</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800">{v.recordedBy.name}</div>
                      {v.recordedBy.professional && (
                        <div className="text-[10px]">
                          {v.recordedBy.professional.councilType}-
                          {v.recordedBy.professional.councilState}{" "}
                          {v.recordedBy.professional.councilNumber}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-Aba Controle Hídrico */}
        {subTab === "CONTROLE_HIDRICO" && (
          <div className="p-4 space-y-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="py-2 px-3">Horário</th>
                  <th className="py-2 px-3">Infundido / VO (mL)</th>
                  <th className="py-2 px-3">Eliminado / Diurese (mL)</th>
                  <th className="py-2 px-3">Saldo Parcial (BHP)</th>
                  <th className="py-2 px-3">Descrição / Soluções e Medicamentos</th>
                  <th className="py-2 px-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVitals.map((v) => {
                  const diff = (v.fluidIntakeMl ?? 0) - (v.fluidOutputMl ?? 0);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold">
                        {new Date(v.recordedAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-700 font-bold">
                        +{v.fluidIntakeMl ?? 0} mL
                      </td>
                      <td className="py-2 px-3 font-mono text-amber-700 font-bold">
                        -{v.fluidOutputMl ?? 0} mL
                      </td>
                      <td
                        className={`py-2 px-3 font-mono font-bold ${
                          diff > 0 ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {diff >= 0 ? `+${diff}` : diff} mL
                      </td>
                      <td className="py-2 px-3">
                        {v.fluidDescription || v.notes || "Registro hídrico"}
                      </td>
                      <td className="py-2 px-3">{v.recordedBy.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-Aba Gráficos de Evolução */}
        {subTab === "GRAFICOS" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900">
                Curva de Pressão Arterial (PAS / PAD mmHg) e Frequência Cardíaca (bpm)
              </h4>
              <div className="space-y-2 pt-2">
                {chronologicalForChart.map((v) => (
                  <div key={v.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>
                        {new Date(v.recordedAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        PA: <strong>{v.systolicBP}/{v.diastolicBP} mmHg</strong> | FC:{" "}
                        <strong>{v.heartRate} bpm</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${Math.min(100, ((v.systolicBP ?? 120) / 200) * 100)}%` }}
                        title={`PAS ${v.systolicBP} mmHg`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900">
                Curva Térmica (Tax °C), Saturação de O2 (%) e Escala de Dor (0-10)
              </h4>
              <div className="space-y-2 pt-2">
                {chronologicalForChart.map((v) => (
                  <div key={v.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>
                        {new Date(v.recordedAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        Tax: <strong>{v.temperature}°C</strong> | SpO2:{" "}
                        <strong>{v.spo2}%</strong> | Dor: <strong>{v.painScore ?? 0}/10</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${v.spo2 ?? 98}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

