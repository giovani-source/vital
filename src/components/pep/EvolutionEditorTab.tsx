"use client";

import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  FilePlus2,
  Filter,
  Search,
  Clock,
  ShieldCheck,
} from "lucide-react";

export interface EvolutionRecordItem {
  id: string;
  category: string;
  format: string;
  title: string;
  subjective: string | null;
  objective: string | null;
  impression: string | null;
  conduct: string | null;
  freeText: string | null;
  status: string;
  version: number;
  isAddendum: boolean;
  addendumReason: string | null;
  parentRecordId: string | null;
  lastSavedAt: string;
  finalizedAt: string | null;
  signatureHash: string | null;
  createdAt: string;
  authorId: string;
  author: {
    name: string;
    role: string;
    professional?: {
      category: string;
      councilType: string;
      councilNumber: string;
      councilState: string;
      specialty: string;
    } | null;
  };
  parentRecord?: {
    id: string;
    title: string;
    finalizedAt: string | null;
  } | null;
}

interface EvolutionEditorTabProps {
  patientId: string;
  encounterId: string;
  evolutions: EvolutionRecordItem[];
  currentUserId: string;
  userRole: string;
  onSaved: () => void;
}

function defaultCategoryForRole(role: string): string {
  switch (role) {
    case "MEDICO":
      return "EVOLUCAO_MEDICA";
    case "ENFERMEIRO":
      return "EVOLUCAO_ENFERMAGEM";
    case "TECNICO_ENFERMAGEM":
      return "ANOTACAO_TECNICO_ENF";
    case "FISIOTERAPEUTA":
      return "EVOLUCAO_FISIOTERAPIA";
    default:
      return "EVOLUCAO_MULTIPROFISSIONAL";
  }
}

export default function EvolutionEditorTab({
  patientId,
  encounterId,
  evolutions,
  currentUserId,
  userRole,
  onSaved,
}: EvolutionEditorTabProps) {
  const defaultCat = defaultCategoryForRole(userRole);

  // Verificar se há rascunho ativo do usuário atual
  const existingDraft = evolutions.find(
    (e) => e.status === "RASCUNHO" && e.authorId === currentUserId
  );

  const [draftId, setDraftId] = useState<string | null>(existingDraft?.id || null);
  const [category, setCategory] = useState<string>(existingDraft?.category || defaultCat);
  const [format, setFormat] = useState<"SOAP" | "LIVRE">(
    (existingDraft?.format as "SOAP" | "LIVRE") || "SOAP"
  );
  const [activeSoapSection, setActiveSoapSection] = useState<"S" | "O" | "I" | "C" | "ALL">(
    "S"
  );
  const [title, setTitle] = useState<string>(
    existingDraft?.title ||
      (userRole === "ENFERMEIRO"
        ? "Evolução de Enfermagem — Avaliação Assistencial"
        : userRole === "MEDICO"
        ? "Evolução Médica Diária"
        : userRole === "TECNICO_ENFERMAGEM"
        ? "Anotação de Enfermagem do Plantão"
        : "Evolução Clínica Multiprofissional")
  );
  const [subjective, setSubjective] = useState<string>(existingDraft?.subjective || "");
  const [objective, setObjective] = useState<string>(existingDraft?.objective || "");
  const [impression, setImpression] = useState<string>(existingDraft?.impression || "");
  const [conduct, setConduct] = useState<string>(existingDraft?.conduct || "");
  const [freeText, setFreeText] = useState<string>(existingDraft?.freeText || "");

  const [autosaveStatus, setAutosaveStatus] = useState<string>("Pronto para edição");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);

  // Filtros do histórico de evoluções
  const [filterCategory, setFilterCategory] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal de Adendo / Retificação para registro já finalizado
  const [addendumParent, setAddendumParent] = useState<EvolutionRecordItem | null>(null);
  const [addendumReason, setAddendumReason] = useState("");
  const [addendumText, setAddendumText] = useState("");

  // Autosave de rascunho a cada alteração relevante (debounce de 2.5s)
  useEffect(() => {
    const hasContent =
      subjective.trim().length > 8 ||
      objective.trim().length > 8 ||
      freeText.trim().length > 8;
    if (!hasContent) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus("Salvando rascunho automaticamente...");
      try {
        const res = await fetch(`/api/pep/${patientId}/evolutions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draftId,
            encounterId,
            category,
            format,
            title,
            subjective,
            objective,
            impression,
            conduct,
            freeText,
            finalize: false,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.evolution?.id) {
            setDraftId(data.evolution.id);
          }
          setAutosaveStatus(
            `Rascunho salvo automaticamente às ${new Date().toLocaleTimeString("pt-BR")}`
          );
        }
      } catch {
        setAutosaveStatus("Falha temporária no autosave");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    subjective,
    objective,
    impression,
    conduct,
    freeText,
    title,
    category,
    format,
    draftId,
    encounterId,
    patientId,
  ]);

  function loadDraftIntoEditor(draft: EvolutionRecordItem) {
    setDraftId(draft.id);
    setCategory(draft.category);
    setFormat((draft.format as "SOAP" | "LIVRE") || "SOAP");
    setTitle(draft.title);
    setSubjective(draft.subjective || "");
    setObjective(draft.objective || "");
    setImpression(draft.impression || "");
    setConduct(draft.conduct || "");
    setFreeText(draft.freeText || "");
    setFeedback({
      type: "success",
      text: "Rascunho recuperado do banco de dados para continuidade da edição.",
    });
  }

  async function handleSaveEvolution(finalize: boolean) {
    setFeedback(null);
    setConfirmFinalizeOpen(false);

    const res = await fetch(`/api/pep/${patientId}/evolutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draftId,
        encounterId,
        category,
        format,
        title,
        subjective,
        objective,
        impression,
        conduct,
        freeText,
        finalize,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao salvar evolução." });
      return;
    }

    if (finalize) {
      setDraftId(null);
      setSubjective("");
      setObjective("");
      setImpression("");
      setConduct("");
      setFreeText("");
      setAutosaveStatus("Registro finalizado e assinado");
    } else if (data.evolution?.id) {
      setDraftId(data.evolution.id);
      setAutosaveStatus(
        `Rascunho salvo às ${new Date().toLocaleTimeString("pt-BR")}`
      );
    }

    setFeedback({ type: "success", text: data.message });
    onSaved();
  }

  async function handleSubmitAddendum(e: React.FormEvent) {
    e.preventDefault();
    if (!addendumParent) return;
    setFeedback(null);

    const res = await fetch(`/api/pep/${patientId}/evolutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encounterId,
        category: addendumParent.category,
        format: "LIVRE",
        title: `Adendo / Retificação — ${addendumParent.title}`,
        freeText: addendumText,
        finalize: true,
        isAddendum: true,
        parentRecordId: addendumParent.id,
        addendumReason,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao criar adendo." });
      return;
    }

    setFeedback({ type: "success", text: data.message });
    setAddendumParent(null);
    setAddendumReason("");
    setAddendumText("");
    onSaved();
  }

  const totalChars =
    subjective.length + objective.length + impression.length + conduct.length + freeText.length;
  const remainingChars = Math.max(0, 4000 - totalChars);

  const filteredEvolutions = evolutions.filter((ev) => {
    if (filterCategory !== "TODAS" && ev.category !== filterCategory) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.author.name.toLowerCase().includes(q) ||
      (ev.subjective && ev.subjective.toLowerCase().includes(q)) ||
      (ev.objective && ev.objective.toLowerCase().includes(q)) ||
      (ev.impression && ev.impression.toLowerCase().includes(q)) ||
      (ev.conduct && ev.conduct.toLowerCase().includes(q)) ||
      (ev.freeText && ev.freeText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 text-xs">
      {/* EDITOR DE EVOLUÇÃO CLÍNICA (Inspirado na Foto 3 do AGHUse: S / O / I / C + Livre) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-sm text-slate-900">
              Editor de Evolução do Paciente
            </span>
            {draftId && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                Rascunho em Edição
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {autosaveStatus}
            </span>

            {existingDraft && draftId !== existingDraft.id && (
              <button
                type="button"
                onClick={() => loadDraftIntoEditor(existingDraft)}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] cursor-pointer"
              >
                Recuperar Rascunho Salvo
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {feedback && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 ${
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipo de Registro Clínico *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white font-semibold"
              >
                <option value="EVOLUCAO_ENFERMAGEM">
                  Evolução de Enfermagem (Privativo Enfermeiro)
                </option>
                <option value="EVOLUCAO_MEDICA">
                  Evolução Médica (Privativo Médico)
                </option>
                <option value="ANOTACAO_TECNICO_ENF">
                  Anotação de Enfermagem (Técnico / Enfermeiro)
                </option>
                <option value="EVOLUCAO_FISIOTERAPIA">
                  Evolução Fisioterapêutica (Fisioterapeuta)
                </option>
                <option value="EVOLUCAO_MULTIPROFISSIONAL">
                  Evolução Multiprofissional
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Título / Identificação do Registro *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300"
              />
            </div>
          </div>

          {/* Layout idêntico à Foto 3 do AGHUse: Botões S / O / I / C à esquerda + Faixa verde Livre/SOAP */}
          <div className="flex flex-col md:flex-row gap-3 pt-1">
            {format === "SOAP" && (
              <div className="flex md:flex-col gap-1.5 shrink-0">
                {[
                  { key: "S", name: "Subjetivo" },
                  { key: "O", name: "Objetivo" },
                  { key: "I", name: "Impressão / Avaliação" },
                  { key: "C", name: "Conduta" },
                  { key: "ALL", name: "Visão Completa SOAP" },
                ].map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() =>
                      setActiveSoapSection(sec.key as "S" | "O" | "I" | "C" | "ALL")
                    }
                    className={`px-3 py-2 rounded font-bold text-left transition-colors cursor-pointer border ${
                      activeSoapSection === sec.key
                        ? "bg-emerald-700 text-white border-emerald-800"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                    title={sec.name}
                  >
                    <span className="font-mono font-bold mr-1.5">{sec.key}</span>
                    <span className="text-[11px]">{sec.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 border border-slate-300 rounded-lg overflow-hidden">
              {/* Faixa Verde Superior da Caixa de Texto (Idêntica à Foto 3 do AGHUse) */}
              <div className="bg-emerald-600 px-3 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFormat("SOAP")}
                    className={`px-4 py-1.5 rounded-t font-bold cursor-pointer ${
                      format === "SOAP"
                        ? "bg-white text-slate-900"
                        : "bg-emerald-700 text-emerald-100"
                    }`}
                  >
                    Estruturado (S / O / I / C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("LIVRE")}
                    className={`px-4 py-1.5 rounded-t font-bold cursor-pointer ${
                      format === "LIVRE"
                        ? "bg-white text-slate-900"
                        : "bg-emerald-700 text-emerald-100"
                    }`}
                  >
                    Livre
                  </button>
                </div>
                <span className="text-white text-[11px] font-semibold pb-1">
                  {format === "LIVRE"
                    ? "Texto Livre"
                    : activeSoapSection === "S"
                    ? "S — Subjetivo (Relato do paciente e sintomas)"
                    : activeSoapSection === "O"
                    ? "O — Objetivo (Exame físico, sinais vitais e exames)"
                    : activeSoapSection === "I"
                    ? "I — Impressão / Avaliação Clínica"
                    : activeSoapSection === "C"
                    ? "C — Conduta e Plano Terapêutico"
                    : "Visão Integrada SOAP"}
                </span>
              </div>

              <div className="p-3 bg-white space-y-3">
                {format === "LIVRE" ? (
                  <textarea
                    rows={8}
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="Digite a evolução ou anotação clínica em texto livre..."
                    className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                  />
                ) : activeSoapSection === "ALL" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        S — Subjetivo
                      </label>
                      <textarea
                        rows={3}
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        O — Objetivo
                      </label>
                      <textarea
                        rows={3}
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        I — Impressão / Avaliação
                      </label>
                      <textarea
                        rows={3}
                        value={impression}
                        onChange={(e) => setImpression(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        C — Conduta
                      </label>
                      <textarea
                        rows={3}
                        value={conduct}
                        onChange={(e) => setConduct(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {activeSoapSection === "S" && (
                      <textarea
                        rows={7}
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        placeholder="S (Subjetivo): Queixas do paciente, evolução álgica, aceitação da dieta, padrão de sono..."
                        className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                      />
                    )}
                    {activeSoapSection === "O" && (
                      <textarea
                        rows={7}
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="O (Objetivo): Estado geral, nível de consciência, exame físico segmentar, dispositivos invasivos, SSVV e balanço hídrico..."
                        className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                      />
                    )}
                    {activeSoapSection === "I" && (
                      <textarea
                        rows={7}
                        value={impression}
                        onChange={(e) => setImpression(e.target.value)}
                        placeholder="I (Impressão / Avaliação): Análise da evolução clínica, resposta terapêutica, diagnósticos..."
                        className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                      />
                    )}
                    {activeSoapSection === "C" && (
                      <textarea
                        rows={7}
                        value={conduct}
                        onChange={(e) => setConduct(e.target.value)}
                        placeholder="C (Conduta): Intervenções realizadas, ajustes terapêuticos, orientações à equipe e ao paciente..."
                        className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                      />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <span>{remainingChars} caracteres restantes</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEvolution(false)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar como Rascunho (Pendente)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmFinalizeOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Finalizar e Assinar Registro</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmação antes de ação irreversível (Finalização Imutável) */}
      {confirmFinalizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-300">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Confirmar Finalização Imutável do Registro Clínico</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Após a finalização, este documento receberá carimbo de tempo do servidor e assinatura de integridade SHA-256, <strong>não podendo ser silenciosamente alterado ou excluído</strong>. Eventuais correções futuras exigirão Adendo / Retificação auditável.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmFinalizeOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 font-semibold"
              >
                Voltar à Edição
              </button>
              <button
                type="button"
                onClick={() => handleSaveEvolution(true)}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Confirmar e Finalizar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO CRONOLÓGICO DE EVOLUÇÕES E ANOTAÇÕES COM FILTROS */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Histórico Cronológico de Evoluções e Anotações ({filteredEvolutions.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
            >
              <option value="TODAS">Todas as Categorias Profissionais</option>
              <option value="EVOLUCAO_MEDICA">Evolução Médica</option>
              <option value="EVOLUCAO_ENFERMAGEM">Evolução de Enfermagem</option>
              <option value="ANOTACAO_TECNICO_ENF">Anotação de Técnico de Enfermagem</option>
              <option value="EVOLUCAO_FISIOTERAPIA">Evolução Fisioterapêutica</option>
              <option value="EVOLUCAO_MULTIPROFISSIONAL">Evolução Multiprofissional</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por profissional ou termo..."
                className="pl-8 pr-3 py-1.5 rounded border border-slate-300 w-56"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvolutions.map((ev) => (
            <div
              key={ev.id}
              className={`rounded-xl border p-4 space-y-2.5 ${
                ev.status === "RASCUNHO"
                  ? "bg-amber-50/60 border-amber-300"
                  : ev.isAddendum
                  ? "bg-sky-50/60 border-sky-300 ml-4"
                  : "bg-slate-50/60 border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ev.status === "FINALIZADO"
                        ? "bg-emerald-700 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {ev.status} • v{ev.version}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold text-[10px] text-slate-700">
                    {ev.category.replace(/_/g, " ")}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-600">
                    {new Date(ev.finalizedAt || ev.lastSavedAt).toLocaleString("pt-BR")}
                  </span>

                  {ev.status === "RASCUNHO" && ev.authorId === currentUserId && (
                    <button
                      type="button"
                      onClick={() => loadDraftIntoEditor(ev)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] cursor-pointer"
                    >
                      Retomar Rascunho
                    </button>
                  )}

                  {ev.status === "FINALIZADO" && (
                    <button
                      type="button"
                      onClick={() => setAddendumParent(ev)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-[11px] cursor-pointer"
                      title="Adicionar Adendo ou Retificação mantendo o registro original"
                    >
                      <FilePlus2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Retificar / Adendo</span>
                    </button>
                  )}
                </div>
              </div>

              {ev.isAddendum && ev.addendumReason && (
                <div className="p-2 rounded bg-sky-100/80 border border-sky-300 text-sky-950 text-[11px]">
                  <strong>Motivo da Retificação / Adendo:</strong> {ev.addendumReason}
                </div>
              )}

              {ev.format === "SOAP" && !ev.freeText ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-slate-800">
                  {ev.subjective && (
                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <strong className="text-emerald-800 block mb-0.5">
                        S — Subjetivo:
                      </strong>
                      {ev.subjective}
                    </div>
                  )}
                  {ev.objective && (
                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <strong className="text-blue-800 block mb-0.5">O — Objetivo:</strong>
                      {ev.objective}
                    </div>
                  )}
                  {ev.impression && (
                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <strong className="text-indigo-800 block mb-0.5">
                        I — Impressão / Avaliação:
                      </strong>
                      {ev.impression}
                    </div>
                  )}
                  {ev.conduct && (
                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <strong className="text-teal-800 block mb-0.5">C — Conduta:</strong>
                      {ev.conduct}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded bg-white border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {ev.freeText}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                <div>
                  Profissional: <strong className="text-slate-800">{ev.author.name}</strong>{" "}
                  {ev.author.professional
                    ? `• ${ev.author.professional.category} (${ev.author.professional.councilType}-${ev.author.professional.councilState} ${ev.author.professional.councilNumber})`
                    : `• ${ev.author.role}`}
                </div>
                {ev.signatureHash && (
                  <div className="font-mono text-[10px] text-slate-400">
                    Assinatura SHA-256: {ev.signatureHash.slice(0, 20)}...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Criação de Adendo / Retificação Auditável */}
      {addendumParent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAddendum}
            className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-300"
          >
            <div className="border-b pb-2.5 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">
                Registrar Adendo / Retificação Auditável
              </h4>
              <button
                type="button"
                onClick={() => setAddendumParent(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              Documento original preservado: <strong>{addendumParent.title}</strong> (Finalizado em{" "}
              {new Date(
                addendumParent.finalizedAt || addendumParent.createdAt
              ).toLocaleString("pt-BR")}
              ).
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Motivo da Retificação / Adendo *
              </label>
              <input
                type="text"
                required
                value={addendumReason}
                onChange={(e) => setAddendumReason(e.target.value)}
                placeholder="Ex: Complementação de resultado laboratorial / Correção de dado clínico"
                className="w-full p-2 rounded border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Conteúdo do Adendo / Retificação *
              </label>
              <textarea
                rows={4}
                required
                value={addendumText}
                onChange={(e) => setAddendumText(e.target.value)}
                placeholder="Descreva o conteúdo retificado ou complementar..."
                className="w-full p-2.5 rounded border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddendumParent(null)}
                className="px-3 py-1.5 rounded border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Assinar e Gravar Adendo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

