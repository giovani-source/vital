"use client";

import React, { useState } from "react";
import {
  Pill,
  ClipboardCheck,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface PrescriptionItemData {
  id: string;
  itemOrder: number;
  category: string;
  description: string;
  observation: string | null;
  dose: string;
  route: string;
  infusionRate: string | null;
  frequency: string;
  condition: string;
  scheduledHours: string;
  administrations: Array<{
    id: string;
    scheduledTime: string;
    effectiveTime: string;
    status: string;
    justification: string | null;
    batchNumber: string | null;
    notes: string | null;
    checkedBy: {
      name: string;
      role: string;
      professional?: {
        councilType: string;
        councilNumber: string;
        councilState: string;
      } | null;
    };
  }>;
}

export interface PrescriptionData {
  id: string;
  prescriptionNumber: string;
  type: string;
  status: string;
  validFrom: string;
  validUntil: string;
  generalNotes: string | null;
  createdAt: string;
  prescriber: {
    name: string;
    role: string;
    professional?: {
      councilType: string;
      councilNumber: string;
      councilState: string;
    } | null;
  };
  items: PrescriptionItemData[];
}

interface PrescriptionsAndChecksTabProps {
  mode: "PRESCRICOES" | "CHECAGEM";
  patientId: string;
  encounterId: string;
  prescriptions: PrescriptionData[];
  canPrescribeMedications: boolean;
  canPrescribeNursingCare: boolean;
  canCheckMedications: boolean;
  onSaved: () => void;
}

export default function PrescriptionsAndChecksTab({
  mode,
  patientId,
  encounterId,
  prescriptions,
  canPrescribeMedications,
  canPrescribeNursingCare,
  canCheckMedications,
  onSaved,
}: PrescriptionsAndChecksTabProps) {
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Estado do Modal de Checagem Beira-Leito
  const [checkingTarget, setCheckingTarget] = useState<{
    item: PrescriptionItemData;
    hour: string;
  } | null>(null);
  const [checkStatus, setCheckStatus] = useState<
    "REALIZADO" | "NAO_REALIZADO" | "RECUSADO" | "ADIADO"
  >("REALIZADO");
  const [checkJustification, setCheckJustification] = useState("");
  const [checkBatch, setCheckBatch] = useState("");
  const [checkNotes, setCheckNotes] = useState("");

  // Estado do formulário de nova prescrição
  const [prescType, setPrescType] = useState<"MEDICA" | "ENFERMAGEM">(
    canPrescribeMedications ? "MEDICA" : "ENFERMAGEM"
  );
  const [generalNotes, setGeneralNotes] = useState("");
  const [newItems, setNewItems] = useState([
    {
      category: canPrescribeMedications ? "MEDICAMENTO" : "CUIDADO",
      description: "",
      observation: "",
      dose: "",
      route: canPrescribeMedications ? "Endovenosa" : "Assistencial",
      infusionRate: "",
      frequency: "6/6 horas",
      condition: "FIXO",
      scheduledHoursText: "08:00, 14:00, 20:00, 02:00",
    },
  ]);

  const activePrescription = prescriptions[0] || null;
  const allItems = activePrescription?.items || [];
  const careAndDietItems = allItems.filter(
    (i) => i.category === "CUIDADO" || i.category === "DIETA"
  );
  const medicationItems = allItems.filter((i) => i.category === "MEDICAMENTO");

  function parseHours(jsonStr: string): string[] {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return ["08:00"];
    }
  }

  async function handleConfirmCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!checkingTarget) return;
    setFeedback(null);

    const res = await fetch(`/api/pep/${patientId}/checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prescriptionItemId: checkingTarget.item.id,
        encounterId,
        scheduledTime: checkingTarget.hour,
        status: checkStatus,
        justification: checkJustification || null,
        batchNumber: checkBatch || null,
        notes: checkNotes || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao registrar checagem." });
      return;
    }

    setFeedback({ type: "success", text: data.message });
    setCheckingTarget(null);
    setCheckJustification("");
    setCheckBatch("");
    setCheckNotes("");
    onSaved();
  }

  async function handleCreatePrescription(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const formattedItems = newItems.map((it) => ({
      category: it.category,
      description: it.description,
      observation: it.observation || null,
      dose: it.dose,
      route: it.route,
      infusionRate: it.infusionRate || null,
      frequency: it.frequency,
      condition: it.condition,
      scheduledHours: it.scheduledHoursText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));

    const res = await fetch(`/api/pep/${patientId}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encounterId,
        type: prescType,
        validUntilHours: 24,
        generalNotes,
        items: formattedItems,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao criar prescrição." });
      return;
    }

    setFeedback({ type: "success", text: data.message });
    setShowNewPrescription(false);
    onSaved();
  }

  const allAdministrations = prescriptions.flatMap((pr) =>
    pr.items.flatMap((it) =>
      it.administrations.map((adm) => ({
        ...adm,
        itemDescription: it.description,
        itemDose: it.dose,
        itemRoute: it.route,
        prescriptionNumber: pr.prescriptionNumber,
      }))
    )
  );
  allAdministrations.sort(
    (a, b) => new Date(b.effectiveTime).getTime() - new Date(a.effectiveTime).getTime()
  );

  return (
    <div className="space-y-4 text-xs">
      {/* Cabeçalho da Prescrição / Checagem */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase text-emerald-700">
            {mode === "PRESCRICOES"
              ? "Aba 6 — Prescrição Hospitalar Vigente (Sem Recomendação Automática)"
              : "Aba 7 — Aprazamento e Checagem Beira-Leito de Medicamentos e Cuidados"}
          </span>
          <h3 className="text-base font-bold text-slate-900">
            {activePrescription
              ? `${activePrescription.prescriptionNumber} • Prescritor(a): ${activePrescription.prescriber.name}`
              : "Nenhuma prescrição ativa"}
          </h3>
          {activePrescription && (
            <p className="text-[11px] text-slate-500">
              Vigência:{" "}
              {new Date(activePrescription.validFrom).toLocaleString("pt-BR")} até{" "}
              {new Date(activePrescription.validUntil).toLocaleString("pt-BR")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(canPrescribeMedications || canPrescribeNursingCare) && (
            <button
              type="button"
              onClick={() => setShowNewPrescription(!showNewPrescription)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {showNewPrescription ? "Fechar Formulário" : "+ Nova Prescrição"}
              </span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Formulário de Nova Prescrição */}
      {showNewPrescription && (
        <form
          onSubmit={handleCreatePrescription}
          className="bg-white p-5 rounded-xl border-2 border-emerald-600 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-slate-900">
              Elaborar Nova Prescrição Hospitalar
            </h4>
            <select
              value={prescType}
              onChange={(e) => setPrescType(e.target.value as "MEDICA" | "ENFERMAGEM")}
              className="px-3 py-1 rounded border border-slate-300 font-bold"
            >
              {canPrescribeMedications && (
                <option value="MEDICA">Prescrição Médica</option>
              )}
              {canPrescribeNursingCare && (
                <option value="ENFERMAGEM">Prescrição de Enfermagem</option>
              )}
            </select>
          </div>

          {newItems.map((it, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-6 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo</label>
                <select
                  value={it.category}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].category = e.target.value;
                    setNewItems(copy);
                  }}
                  className="w-full p-1.5 rounded border bg-white"
                >
                  <option value="MEDICAMENTO">Medicamento</option>
                  <option value="CUIDADO">Cuidado</option>
                  <option value="DIETA">Dieta</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Descrição do Medicamento / Cuidado *
                </label>
                <input
                  type="text"
                  required
                  value={it.description}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].description = e.target.value;
                    setNewItems(copy);
                  }}
                  placeholder="Ex: ONDANSETRONA 8 MG INJETAVEL"
                  className="w-full p-1.5 rounded border bg-white uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dose *</label>
                <input
                  type="text"
                  required
                  value={it.dose}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].dose = e.target.value;
                    setNewItems(copy);
                  }}
                  placeholder="Ex: 8 MG"
                  className="w-full p-1.5 rounded border bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Via / Freq. *</label>
                <input
                  type="text"
                  required
                  value={it.route}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].route = e.target.value;
                    setNewItems(copy);
                  }}
                  placeholder="Endovenosa"
                  className="w-full p-1.5 rounded border bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Horários (separados por vírgula)
                </label>
                <input
                  type="text"
                  required
                  value={it.scheduledHoursText}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].scheduledHoursText = e.target.value;
                    setNewItems(copy);
                  }}
                  placeholder="08:00, 16:00, 00:00"
                  className="w-full p-1.5 rounded border bg-white font-mono"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setNewItems([
                  ...newItems,
                  {
                    category: "MEDICAMENTO",
                    description: "",
                    observation: "",
                    dose: "",
                    route: "Oral",
                    infusionRate: "",
                    frequency: "8/8 horas",
                    condition: "FIXO",
                    scheduledHoursText: "08:00, 16:00, 00:00",
                  },
                ])
              }
              className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800 cursor-pointer"
            >
              + Adicionar Mais um Item
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewPrescription(false)}
                className="px-4 py-1.5 rounded border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Assinar e Publicar Prescrição
              </button>
            </div>
          </div>
        </form>
      )}

      {/* GRADE FIEL À FOTO 4 DO AGHUSE: CUIDADOS/DIETA NO TOPO + MEDICAMENTOS ABAIXO */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        {/* Seção Superior: Cuidados e Dieta (BHP E BHT, Chá de Camomila, Controle de Sinais Vitais) */}
        <div className="divide-y divide-slate-200 border-b-2 border-slate-300">
          {careAndDietItems.map((item) => {
            const hours = parseHours(item.scheduledHours);
            return (
              <div
                key={item.id}
                className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50"
              >
                <div className="min-w-[280px] flex-1">
                  <div className="font-bold text-slate-900">{item.description}</div>
                  {item.observation && (
                    <div className="text-[11px] text-slate-500">{item.observation}</div>
                  )}
                </div>

                <div className="w-28 text-center font-semibold text-slate-700">
                  {item.frequency}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hours.map((hr) => {
                    const adm = item.administrations.find((a) => a.scheduledTime === hr);
                    const isDone = adm?.status === "REALIZADO";
                    const isNotDone = adm && adm.status !== "REALIZADO";
                    return (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => {
                          if (!canCheckMedications) return;
                          setCheckingTarget({ item, hour: hr });
                          setCheckStatus("REALIZADO");
                        }}
                        className={`px-3.5 py-1 rounded font-mono font-bold text-xs transition-all cursor-pointer border ${
                          isDone
                            ? "bg-lime-500 text-slate-950 border-lime-600 shadow-2xs"
                            : isNotDone
                            ? "bg-red-100 text-red-900 border-red-400"
                            : "bg-white hover:bg-emerald-50 text-slate-800 border-slate-300"
                        }`}
                        title={
                          adm
                            ? `${adm.status} por ${adm.checkedBy.name} às ${new Date(
                                adm.effectiveTime
                              ).toLocaleTimeString("pt-BR")}`
                            : "Clique para realizar checagem beira-leito"
                        }
                      >
                        {hr} {isDone ? "✓" : isNotDone ? "✗" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Faixa de Cabeçalho de Medicamentos (Idêntica à Foto 4 do AGHUse) */}
        <div className="bg-emerald-100/90 border-b border-slate-300 py-1.5 px-4 text-center font-bold text-slate-900 flex items-center justify-center gap-1.5">
          <Pill className="w-4 h-4 text-emerald-800" />
          <span>Medicamentos Prescritos e Aprazamento Beira-Leito</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[11px]">
                <th className="py-2 px-3">Descrição do Medicamento / Observação</th>
                <th className="py-2 px-2.5">Dose</th>
                <th className="py-2 px-2.5">Via</th>
                <th className="py-2 px-2">Veloc. Inf.</th>
                <th className="py-2 px-2.5">Frequência</th>
                <th className="py-2 px-2.5">Condição</th>
                <th className="py-2 px-3">Horários Aprazados / Checagem (Clique para Checar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {medicationItems.map((item) => {
                const hours = parseHours(item.scheduledHours);
                const allDone =
                  item.condition === "FIXO" &&
                  hours.every((hr) =>
                    item.administrations.some(
                      (a) => a.scheduledTime === hr && a.status === "REALIZADO"
                    )
                  );
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      allDone ? "bg-lime-50/70" : "hover:bg-sky-50/60"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.description}</div>
                      {item.observation && (
                        <div className="text-[11px] text-slate-600">{item.observation}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.dose}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-800">{item.route}</td>
                    <td className="py-2.5 px-2 text-slate-500">{item.infusionRate || "-"}</td>
                    <td className="py-2.5 px-2.5 font-medium">{item.frequency}</td>
                    <td className="py-2.5 px-2.5">
                      {item.condition === "SE_NECESSARIO" ? (
                        <span className="font-bold text-slate-800">Se Necessário</span>
                      ) : (
                        <span className="text-slate-700">Fixo</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {hours.map((hr) => {
                          const adm = item.administrations.find(
                            (a) => a.scheduledTime === hr
                          );
                          const isDone = adm?.status === "REALIZADO";
                          const isNotDone = adm && adm.status !== "REALIZADO";
                          return (
                            <button
                              key={hr}
                              type="button"
                              onClick={() => {
                                if (!canCheckMedications) return;
                                setCheckingTarget({ item, hour: hr });
                                setCheckStatus("REALIZADO");
                              }}
                              className={`min-w-[68px] px-3 py-1 rounded font-mono font-bold text-xs transition-all cursor-pointer border ${
                                isDone
                                  ? "bg-emerald-800 text-white border-emerald-950 shadow-2xs"
                                  : isNotDone
                                  ? "bg-red-600 text-white border-red-800"
                                  : hr === "SN"
                                  ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-lime-400/90 hover:bg-lime-500 text-slate-950 border-lime-600"
                              }`}
                            >
                              {hr} {isDone ? "✓" : isNotDone ? "!" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Imutável de Checagens e Administrações Realizadas / Não Realizadas */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
            <span>
              Histórico Auditável de Checagens e Administrações ({allAdministrations.length})
            </span>
          </h4>
          <span className="text-[11px] text-slate-500">
            Registros anteriores são preservados integralmente (COFEN 754/2024)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-[11px]">
                <th className="py-2 px-3">Item Prescrito</th>
                <th className="py-2 px-2">Horário Previsto</th>
                <th className="py-2 px-2">Horário Efetivo</th>
                <th className="py-2 px-2">Situação</th>
                <th className="py-2 px-3">Justificativa / Observação / Lote</th>
                <th className="py-2 px-3">Profissional Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allAdministrations.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">
                    {adm.itemDescription} ({adm.itemDose} • {adm.itemRoute})
                  </td>
                  <td className="py-2 px-2 font-mono font-bold">{adm.scheduledTime}</td>
                  <td className="py-2 px-2 font-mono">
                    {new Date(adm.effectiveTime).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 px-2">
                    {adm.status === "REALIZADO" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> REALIZADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px]">
                        <XCircle className="w-3 h-3" /> {adm.status}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {adm.justification && (
                      <span className="font-bold text-red-700 mr-1">
                        Justificativa: {adm.justification}
                      </span>
                    )}
                    {adm.batchNumber && (
                      <span className="font-mono text-slate-600 mr-1">
                        [Lote: {adm.batchNumber}]
                      </span>
                    )}
                    <span>{adm.notes || ""}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{adm.checkedBy.name}</div>
                    {adm.checkedBy.professional && (
                      <div className="text-[10px] text-slate-500">
                        {adm.checkedBy.professional.councilType}-
                        {adm.checkedBy.professional.councilState}{" "}
                        {adm.checkedBy.professional.councilNumber}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Checagem Beira-Leito */}
      {checkingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCheck}
            className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-300"
          >
            <div className="border-b pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Checagem Beira-Leito — Horário {checkingTarget.hour}</span>
              </div>
              <button
                type="button"
                onClick={() => setCheckingTarget(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">
                {checkingTarget.item.description}
              </div>
              <div className="text-slate-600 mt-0.5">
                Dose: <strong>{checkingTarget.item.dose}</strong> • Via:{" "}
                <strong>{checkingTarget.item.route}</strong> • Freq:{" "}
                {checkingTarget.item.frequency}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Situação da Administração / Cuidado *
              </label>
              <select
                value={checkStatus}
                onChange={(e) =>
                  setCheckStatus(
                    e.target.value as "REALIZADO" | "NAO_REALIZADO" | "RECUSADO" | "ADIADO"
                  )
                }
                className="w-full p-2 rounded border border-slate-300 font-bold"
              >
                <option value="REALIZADO">REALIZADO — Administrado no Paciente</option>
                <option value="NAO_REALIZADO">NÃO REALIZADO (Exige Justificativa)</option>
                <option value="RECUSADO">RECUSADO PELO PACIENTE (Exige Justificativa)</option>
                <option value="ADIADO">ADIADO POR EXAME / JEJUM (Exige Justificativa)</option>
              </select>
            </div>

            {checkStatus !== "REALIZADO" && (
              <div>
                <label className="block font-bold text-red-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Justificativa para Não Realização *
                </label>
                <textarea
                  rows={2}
                  required
                  value={checkJustification}
                  onChange={(e) => setCheckJustification(e.target.value)}
                  placeholder="Informe o motivo clínico pelo qual o item não foi administrado..."
                  className="w-full p-2 rounded border border-red-300 bg-red-50/40"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lote (Opcional)
                </label>
                <input
                  type="text"
                  value={checkBatch}
                  onChange={(e) => setCheckBatch(e.target.value)}
                  placeholder="Ex: LOTE-2026A"
                  className="w-full p-2 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observação
                </label>
                <input
                  type="text"
                  value={checkNotes}
                  onChange={(e) => setCheckNotes(e.target.value)}
                  placeholder="Acesso pérvio, sem intercorrências"
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckingTarget(null)}
                className="px-3 py-1.5 rounded border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Checagem</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

