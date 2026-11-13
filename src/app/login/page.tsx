"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  BadgeCheck,
  Mail,
  FileBadge,
} from "lucide-react";

const PROFESSIONAL_ROLES = [
  {
    value: "MEDICO",
    label: "Médico(a)",
    defaultCouncil: "CRM",
    permissionsSummary:
      "Acesso integral ao PEP, Evolução Médica SOAP/Livre, Prescrição Médica de medicamentos/dieta, Diagnósticos CID-10 e Solicitação de Exames.",
  },
  {
    value: "ENFERMEIRO",
    label: "Enfermeiro(a)",
    defaultCouncil: "COREN",
    permissionsSummary:
      "Acesso ao PEP, Processo de Enfermagem completo (5 etapas COFEN 736/2024: Avaliação/Anamnese, Diagnóstico, Planejamento, Implementação e Evolução), Prescrição de Cuidados, Sinais Vitais e Checagem.",
  },
  {
    value: "TECNICO_ENFERMAGEM",
    label: "Técnico(a) de Enfermagem",
    defaultCouncil: "COREN",
    permissionsSummary:
      "Perfil com limitações legais: realiza Anotações de Enfermagem, Sinais Vitais/Balanço Hídrico e Checagem Beira-Leito. Bloqueado para Prescrições Médicas/Enfermagem e Diagnósticos.",
  },
  {
    value: "FISIOTERAPEUTA",
    label: "Fisioterapeuta",
    defaultCouncil: "CREFITO",
    permissionsSummary:
      "Acesso ao PEP, Evolução Fisioterapêutica SOAP/Livre, Sinais Vitais/Parâmetros Respiratórios e Checagem de Cuidados.",
  },
  {
    value: "OUTRO_ASSISTENCIAL",
    label: "Farmacêutico(a) / Nutricionista / Multiprofissional",
    defaultCouncil: "CRF",
    permissionsSummary:
      "Acesso ao PEP e registro de Evolução Multiprofissional (sem emissão de prescrições médicas ou diagnósticos privativos).",
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
      setError("Erro de conexão com o servidor hospitalar.");
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
          specialty: regSpecialty || "Assistência Hospitalar",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegMessage({
          type: "error",
          text: data.error || "Não foi possível criar o perfil profissional.",
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/50 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
          {/* Coluna Institucional */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-7 lg:p-9 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">HospVita PEP</h1>
                  <p className="text-xs text-emerald-400 font-medium">
                    Prontuário Eletrônico do Paciente
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">
                  Plataforma Clínica e Assistencial Hospitalar
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gestão integrada de internações, evoluções multiprofissionais SOAP, Processo de
                  Enfermagem (5 etapas COFEN 736/2024), prescrições, checagem beira-leito e
                  controles vitais com controle estrito de alçadas por perfil profissional.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-emerald-400 text-[11px]">
                  Fluxo de Perfis e Liberação ADM
                </h3>
                <ul className="space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Administrador Geral (ADM):</strong> Possui visão e acesso total a
                      todos os módulos clínicos, prontuários, unidades e aprova/libera novos
                      cadastros profissionais.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Médico(a) e Enfermeiro(a):</strong> Registram evoluções, prescrições
                      médicas/cuidados e Processo de Enfermagem conforme habilitação legal.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Técnico(a) de Enfermagem:</strong> Realiza anotações de enfermagem,
                      sinais vitais e checagem beira-leito, com bloqueio de prescrições e
                      diagnósticos.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Controle RBAC & Auditoria Ativa</span>
              </div>
              <span>Banco Persistente</span>
            </div>
          </div>

          {/* Coluna de Login / Criação de Perfil */}
          <div className="lg:col-span-7 p-7 lg:p-9 flex flex-col justify-between bg-white">
            <div className="space-y-5">
              {/* Seletor de Abas: Login vs Criar Perfil Profissional */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("LOGIN");
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "LOGIN"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Entrar no Sistema
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("REGISTER");
                    setRegMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "REGISTER"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Criar Perfil Profissional
                </button>
              </div>

              {activeTab === "LOGIN" ? (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Autenticação do Profissional
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Informe seu usuário ou e-mail institucional e senha. Caso ainda não possua
                      acesso, clique na aba <strong>Criar Perfil Profissional</strong> acima.
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Usuário ou E-mail
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Ex.: giovani@medaffection.com ou seu usuário"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Senha de Acesso
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecoveryOpen(!recoveryOpen)}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                        >
                          Recuperar ou desbloquear senha
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-lg shadow transition-colors cursor-pointer"
                    >
                      {loading ? "Validando credenciais..." : "Acessar Prontuário Eletrônico"}
                    </button>
                  </form>

                  {/* Recuperação de Acesso */}
                  {recoveryOpen && (
                    <form
                      onSubmit={handleRecoverPassword}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          Recuperação de Acesso e Desbloqueio
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecoveryOpen(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
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
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-900"
                        />
                        <input
                          type="text"
                          required
                          value={recoveryCouncil}
                          onChange={(e) => setRecoveryCouncil(e.target.value)}
                          placeholder="Nº Conselho (ex: 218490)"
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-900"
                        />
                        <input
                          type="password"
                          required
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          placeholder="Nova senha"
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded cursor-pointer"
                      >
                        Redefinir Senha
                      </button>
                      {recoveryFeedback && (
                        <p
                          className={`text-xs flex items-center gap-1.5 ${
                            recoveryFeedback.type === "success"
                              ? "text-emerald-700"
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
                    <h2 className="text-xl font-bold text-slate-900">
                      Cadastro de Perfil Profissional
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Crie seu login selecionando sua categoria profissional. Após o envio, o{" "}
                      <strong>Administrador (ADM)</strong> fará a liberação do seu acesso.
                    </p>
                  </div>

                  {regMessage && (
                    <div
                      className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
                        regMessage.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      {regMessage.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{regMessage.text}</p>
                        {regMessage.type === "success" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("LOGIN")}
                            className="mt-2 inline-flex items-center gap-1 text-emerald-800 underline font-bold cursor-pointer"
                          >
                            Voltar para a tela de Login →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nome Completo do Profissional *
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Informe seu nome completo"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Perfil Profissional (Alçada de Acesso) *
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
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
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900">
                          Permissões do perfil {selectedRoleMeta.label}:{" "}
                        </span>
                        {selectedRoleMeta.permissionsSummary}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Usuário de Login *
                        </label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="Ex.: enf.maria"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          E-mail *
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="nome@hospital.com"
                            className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Senha (mín. 6 dígitos) *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Conselho *
                        </label>
                        <select
                          value={regCouncilType}
                          onChange={(e) => setRegCouncilType(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nº Registro *
                        </label>
                        <div className="relative">
                          <FileBadge className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            required
                            value={regCouncilNumber}
                            onChange={(e) => setRegCouncilNumber(e.target.value)}
                            placeholder="Número"
                            className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          UF *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          value={regCouncilState}
                          onChange={(e) => setRegCouncilState(e.target.value.toUpperCase())}
                          placeholder="RS"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Especialidade / Setor
                        </label>
                        <input
                          type="text"
                          value={regSpecialty}
                          onChange={(e) => setRegSpecialty(e.target.value)}
                          placeholder="Ex.: UTI / Clínica"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-semibold text-xs rounded-lg shadow transition-colors cursor-pointer"
                    >
                      {regLoading
                        ? "Enviando cadastro..."
                        : "Criar Perfil Profissional (Solicitar Liberação ao ADM)"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="pt-5 mt-5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Acesso Administrativo (ADM): gerencia liberações em Gestão & Permissões</span>
              <span className="font-mono text-slate-700">HospVita PEP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
