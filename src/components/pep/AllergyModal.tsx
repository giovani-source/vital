"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, Check, X } from "lucide-react";

interface AllergyItem {
  id: string;
  category: string;
  substance: string;
  reaction: string;
  severity: string;
  reportedBy: string;
  recordedAt: string;
  recordedBy?: {
    name: string;
  };
}

interface AllergyModalProps {
  patientId: string;
  allergies: AllergyItem[];
  onClose: () => void;
  onSaved: () => void;
}

export default function AllergyModal({
  patientId,
  allergies,
  onClose,
  onSaved,
}: AllergyModalProps) {
  const [activeTab, setActiveTab] = useState<"MEDICAMENTO" | "OUTRAS">("MEDICAMENTO");
  const [otherCategory, setOtherCategory] = useState("ALIMENTO");
  const [substance, setSubstance] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState<"LEVE" | "MODERADA" | "GRAVE">("MODERADA");
  const [reportedBy, setReportedBy] = useState<"PACIENTE" | "PROFISSIONAL_HOSPITAL">("PACIENTE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAddAllergy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/pep/${patientId}/clinical-meta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaType: "ALLERGY",
          category: activeTab === "MEDICAMENTO" ? "MEDICAMENTO" : otherCategory,
          substance,
          reaction,
          severity,
          reportedBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gravar alergia.");
        setSaving(false);
        return;
      }
      setSubstance("");
      setReaction("");
      onSaved();
    } catch {
      setError("Falha de conexão ao salvar alergia.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden text-xs">
        {/* Barra Superior do Modal */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Registro de Alergia do Paciente</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas estilo AGHUse (Medicamentos | Outras: Alimento/Materiais/Inseto/Plantas) */}
        <div className="bg-emerald-700 px-3 pt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("MEDICAMENTO")}
            className={`px-4 py-2 rounded-t-md font-bold transition-colors cursor-pointer ${
              activeTab === "MEDICAMENTO"
                ? "bg-white text-slate-900"
                : "bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800"
            }`}
          >
            Medicamentos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("OUTRAS")}
            className={`px-4 py-2 rounded-t-md font-bold transition-colors cursor-pointer ${
              activeTab === "OUTRAS"
                ? "bg-white text-slate-900"
                : "bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800"
            }`}
          >
            Outras (Alimento / Materiais / Inseto / Plantas)
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleAddAllergy} className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeTab === "OUTRAS" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria do Agente *
                  </label>
                  <select
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="ALIMENTO">Alimento</option>
                    <option value="MATERIAL">Materiais (ex: Látex / Esparadrapo)</option>
                    <option value="INSETO">Inseto</option>
                    <option value="PLANTA">Plantas</option>
                  </select>
                </div>
              )}

              <div className={activeTab === "MEDICAMENTO" ? "md:col-span-2" : ""}>
                <label className="block font-semibold text-slate-700 mb-1">
                  {activeTab === "MEDICAMENTO"
                    ? "Grupo de Medicamento / Princípio Ativo *"
                    : "Descrição do Agente Alérgeno *"}
                </label>
                <input
                  type="text"
                  required
                  value={substance}
                  onChange={(e) => setSubstance(e.target.value)}
                  placeholder={
                    activeTab === "MEDICAMENTO"
                      ? "Ex: Penicilinas, Dipirona, Contraste Iodado, AINEs..."
                      : "Ex: Látex, Frutos do Mar, Amendoim..."
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipo de Reação *
                </label>
                <input
                  type="text"
                  required
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value)}
                  placeholder="Ex: Urticária, Broncoespasmo, Anafilaxia..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <span className="block font-semibold text-slate-700">Relatada Por:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reportedBy"
                      checked={reportedBy === "PACIENTE"}
                      onChange={() => setReportedBy("PACIENTE")}
                    />
                    <span>Paciente</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reportedBy"
                      checked={reportedBy === "PROFISSIONAL_HOSPITAL"}
                      onChange={() => setReportedBy("PROFISSIONAL_HOSPITAL")}
                    />
                    <span>Profissional do Hospital</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gravidade:</label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "LEVE" | "MODERADA" | "GRAVE")
                  }
                  className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold"
                >
                  <option value="LEVE">Leve</option>
                  <option value="MODERADA">Moderada</option>
                  <option value="GRAVE">Grave / Risco de Anafilaxia</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{saving ? "Gravando..." : "Adicionar e Gravar"}</span>
              </button>
            </div>
          </form>

          {/* Tabela de Alergias Cadastradas */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3">Descrição / Substância</th>
                  <th className="py-2 px-3">Tipo de Reação</th>
                  <th className="py-2 px-3">Gravidade</th>
                  <th className="py-2 px-3">Relatado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allergies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      Nenhum registro encontrado!
                    </td>
                  </tr>
                ) : (
                  allergies.map((alg) => (
                    <tr key={alg.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono">
                        {new Date(alg.recordedAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2 px-3 font-semibold">{alg.category}</td>
                      <td className="py-2 px-3 font-bold text-red-800">{alg.substance}</td>
                      <td className="py-2 px-3">{alg.reaction}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alg.severity === "GRAVE"
                              ? "bg-red-600 text-white"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {alg.severity}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {alg.reportedBy === "PACIENTE"
                          ? "Paciente"
                          : "Profissional do Hospital"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Concluído</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fechar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

