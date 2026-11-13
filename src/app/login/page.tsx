"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Mail,
  FileBadge,
} from "lucide-react";

const PROFESSIONAL_ROLES = [
  {
    value: "MEDICO",
    label: "Médico(a)",
    defaultCouncil: "CRM",
    permissionsSummary:
      "Evolução Médica, Prescrição Médica de medicamentos e dieta, Diagnósticos CID-10 e Solicitação de Exames.",
  },
  {
    value: "ENFERMEIRO",
    label: "Enfermeiro(a)",
    defaultCouncil: "COREN",
    permissionsSummary:
      "Processo de Enfermagem completo (Avaliação, Diagnóstico, Planejamento, Implementação e Evolução), Prescrição de Cuidados e Checagem.",
  },
  {
    value: "TECNICO_ENFERMAGEM",
    label: "Técnico(a) de Enfermagem",
    defaultCouncil: "COREN",
    permissionsSummary:
      "Anotações de Enfermagem, Sinais Vitais, Balanço Hídrico e Checagem de horários prescritos (sem emissão de prescrições ou diagnósticos).",
  },
  {
    value: "FISIOTERAPEUTA",
    label: "Fisioterapeuta",
    defaultCouncil: "CREFITO",
    permissionsSummary:
      "Evolução Fisioterapêutica, parâmetros cardiorrespiratórios, reabilitação motora e checagem assistencial.",
  },
  {
    value: "OUTRO_ASSISTENCIAL",
    label: "Farmacêutico(a) / Nutricionista / Equipe Multiprofissional",
    defaultCouncil: "CRF",
    permissionsSummary:
      "Consulta ao prontuário e registro de Evolução Multiprofissional.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Estados de Login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Criação de Perfil Profissional
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("ENFERMEIRO");
  const [regCouncilType, setRegCouncilType] = useState("COREN");
  const [regCouncilNumber, setRegCouncilNumber] = useState("");
  const [regCouncilState, setRegCouncilState] = useState("RS");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados de Recuperação de Senha
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryCouncil, setRecoveryCouncil] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryFeedback, setRecoveryFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha na autenticação.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão com o servidor.");
      setLoading(false);
    }
  }

  function handleRoleChange(newRole: string) {
    setRegRole(newRole);
    const found = PROFESSIONAL_ROLES.find((r) => r.value === newRole);
    if (found) {
      setRegCouncilType(found.defaultCouncil);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role: regRole,
          councilType: regCouncilType,
          councilNumber: regCouncilNumber,
          councilState: regCouncilState,
          specialty: regSpecialty || "Assistência Sênior",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegMessage({
          type: "error",
          text: data.error || "Não foi possível registrar o perfil.",
        });
        setRegLoading(false);
        return;
      }

      setRegMessage({
        type: "success",
        text: data.message,
      });
      setRegName("");
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegCouncilNumber("");
      setRegSpecialty("");
      setRegLoading(false);
    } catch {
      setRegMessage({
        type: "error",
        text: "Erro de comunicação ao registrar perfil profissional.",
      });
      setRegLoading(false);
    }
  }

  async function handleRecoverPassword(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryFeedback(null);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: recoveryIdentifier,
          councilNumber: recoveryCouncil,
          newPassword: recoveryNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryFeedback({
          type: "error",
          text: data.error || "Erro na recuperação.",
        });
        return;
      }
      setRecoveryFeedback({ type: "success", text: data.message });
    } catch {
      setRecoveryFeedback({
        type: "error",
        text: "Falha de comunicação ao recuperar acesso.",
      });
    }
  }

  const selectedRoleMeta = PROFESSIONAL_ROLES.find((r) => r.value === regRole);

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-center items-center p-4 lg:p-8">
      {/* Moldura Principal Editorial PerTe */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#C5A872]/50 grid grid-cols-1 lg:grid-cols-12">
        {/* Painel Esquerdo: Identidade PerTe Residencial Sênior */}
        <div className="lg:col-span-5 bg-[#FAF7F0] p-8 lg:p-10 flex flex-col items-center justify-between text-center border-b lg:border-b-0 lg:border-r border-[#E4DEC9]">
          <div className="w-full flex flex-col items-center space-y-5 pt-2">
            <div className="w-44 h-44 rounded-full bg-white p-2 shadow-md border-2 border-[#947743]/40 flex items-center justify-center">
              <img
                src="/logo-perte.jpg"
                alt="Per Te Residencial Sênior"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C703E] block">
                Sistema Clínico & Assistencial
              </span>
              <h1 className="font-editorial text-3xl font-bold text-[#143D25]">
                Prontuário PerTe
              </h1>
              <div className="w-12 h-0.5 bg-[#947743] mx-auto my-2" />
              <p className="text-xs text-[#524B3C] leading-relaxed max-w-xs mx-auto pt-1">
                Acompanhamento clínico longitudinal, evolução multiprofissional, processo de
                enfermagem e prescrição assistencial do <strong>Per Te Residencial Sênior</strong>.
              </p>
            </div>
          </div>

          <div className="w-full pt-6 mt-6 border-t border-[#E4DEC9] text-[11px] text-[#6E6654] space-y-1">
            <p className="font-semibold text-[#143D25]">Acesso por Alçada Profissional</p>
            <p>Novos cadastros profissionais são liberados pela Administração (ADM).</p>
          </div>
        </div>

        {/* Painel Direito: Formulário de Acesso / Cadastro Profissional */}
        <div className="lg:col-span-7 p-7 lg:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            {/* Abas de Navegação */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F0E6] rounded-xl border border-[#E4DEC9]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("LOGIN");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "LOGIN"
                    ? "bg-[#143D25] text-white shadow-xs"
                    : "text-[#524B3C] hover:text-[#143D25]"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Acessar Prontuário
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("REGISTER");
                  setRegMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "REGISTER"
                    ? "bg-[#947743] text-white shadow-xs"
                    : "text-[#524B3C] hover:text-[#143D25]"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Criar Perfil Profissional
              </button>
            </div>

            {activeTab === "LOGIN" ? (
              <>
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-[#143D25]">
                    Identificação do Profissional
                  </h2>
                  <p className="text-xs text-[#6E6654] mt-1">
                    Entre com seu usuário ou e-mail institucional para acessar o Prontuário PerTe.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#383328] mb-1.5">
                      Usuário ou E-mail
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C703E] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Informe seu usuário ou e-mail"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg focus:outline-none focus:bg-white focus:border-[#143D25] text-[#18281E]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#383328]">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => setRecoveryOpen(!recoveryOpen)}
                        className="text-xs text-[#8C703E] hover:text-[#143D25] font-semibold cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C703E] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg focus:outline-none focus:bg-white focus:border-[#143D25] text-[#18281E]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#143D25] hover:bg-[#0E2E1B] disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {loading ? "Autenticando..." : "Entrar no Prontuário PerTe"}
                  </button>
                </form>

                {recoveryOpen && (
                  <form
                    onSubmit={handleRecoverPassword}
                    className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E4DEC9] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#143D25] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#8C703E]" />
                        Redefinição de Senha por Registro Profissional
                      </span>
                      <button
                        type="button"
                        onClick={() => setRecoveryOpen(false)}
                        className="text-xs text-[#6E6654] hover:text-[#18281E]"
                      >
                        Fechar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="Usuário ou e-mail"
                        className="px-2.5 py-2 text-xs border border-[#CFC6AD] rounded bg-white text-[#18281E]"
                      />
                      <input
                        type="text"
                        required
                        value={recoveryCouncil}
                        onChange={(e) => setRecoveryCouncil(e.target.value)}
                        placeholder="Nº Conselho"
                        className="px-2.5 py-2 text-xs border border-[#CFC6AD] rounded bg-white text-[#18281E]"
                      />
                      <input
                        type="password"
                        required
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        placeholder="Nova senha"
                        className="px-2.5 py-2 text-xs border border-[#CFC6AD] rounded bg-white text-[#18281E]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#143D25] text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      Atualizar Senha
                    </button>
                    {recoveryFeedback && (
                      <p
                        className={`text-xs flex items-center gap-1.5 ${
                          recoveryFeedback.type === "success"
                            ? "text-[#143D25]"
                            : "text-red-600"
                        }`}
                      >
                        {recoveryFeedback.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {recoveryFeedback.text}
                      </p>
                    )}
                  </form>
                )}
              </>
            ) : (
              <>
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-[#143D25]">
                    Novo Cadastro Profissional
                  </h2>
                  <p className="text-xs text-[#6E6654] mt-1">
                    Preencha seus dados e escolha sua categoria profissional. O acesso será ativado
                    após liberação pela Administração (ADM).
                  </p>
                </div>

                {regMessage && (
                  <div
                    className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
                      regMessage.type === "success"
                        ? "bg-[#F2F6EE] border-[#9BBF82] text-[#143D25]"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    {regMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#558B2F] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{regMessage.text}</p>
                      {regMessage.type === "success" && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("LOGIN")}
                          className="mt-2 inline-flex items-center gap-1 text-[#143D25] underline font-bold cursor-pointer"
                        >
                          Ir para a tela de acesso →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Perfil Profissional *
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#143D25] font-semibold"
                      >
                        {PROFESSIONAL_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedRoleMeta && (
                    <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E4DEC9] text-[11px] text-[#524B3C]">
                      <span className="font-bold text-[#143D25]">
                        Atribuições de {selectedRoleMeta.label}:{" "}
                      </span>
                      {selectedRoleMeta.permissionsSummary}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Usuário de Acesso *
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Ex.: enf.helena"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        E-mail *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[#8C703E] absolute left-2.5 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nome@perte.com.br"
                          className="w-full pl-8 pr-2.5 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Senha *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mín. 6 caracteres"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Conselho *
                      </label>
                      <select
                        value={regCouncilType}
                        onChange={(e) => setRegCouncilType(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                      >
                        <option value="COREN">COREN</option>
                        <option value="CRM">CRM</option>
                        <option value="CREFITO">CREFITO</option>
                        <option value="CRF">CRF</option>
                        <option value="CRN">CRN</option>
                        <option value="CRP">CRP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Nº Registro *
                      </label>
                      <div className="relative">
                        <FileBadge className="w-3.5 h-3.5 text-[#8C703E] absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          required
                          value={regCouncilNumber}
                          onChange={(e) => setRegCouncilNumber(e.target.value)}
                          placeholder="Número"
                          className="w-full pl-8 pr-2.5 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        UF *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={regCouncilState}
                        onChange={(e) => setRegCouncilState(e.target.value.toUpperCase())}
                        placeholder="RS"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E] uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#383328] mb-1">
                        Setor / Área
                      </label>
                      <input
                        type="text"
                        value={regSpecialty}
                        onChange={(e) => setRegSpecialty(e.target.value)}
                        placeholder="Ex.: Gerontologia"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F3] border border-[#CFC6AD] rounded-lg text-[#18281E]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-2.5 px-4 bg-[#947743] hover:bg-[#7D6335] disabled:opacity-60 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {regLoading
                      ? "Registrando cadastro..."
                      : "Solicitar Criação de Perfil Profissional"}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="pt-5 mt-6 border-t border-[#E4DEC9] flex items-center justify-between text-[11px] text-[#6E6654]">
            <span>Per Te Residencial Sênior</span>
            <span className="font-editorial font-bold text-sm text-[#143D25]">
              Prontuário PerTe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
