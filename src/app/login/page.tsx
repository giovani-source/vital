"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
} from "lucide-react";

const DEMO_PROFILES = [
  {
    username: "enf.giovani",
    name: "Enf. Giovani Basso da Silva",
    roleLabel: "Enfermeiro(a) — COREN-RS 218490",
    badge: "bg-emerald-600 text-white",
    desc: "Acesso total ao PEP, Avaliação Horta, 5 etapas do Processo de Enfermagem (COFEN 736/2024), prescrição de cuidados e checagem.",
  },
  {
    username: "med.helena",
    name: "Dra. Helena Vasconcelos",
    roleLabel: "Médica Hematologista — CRM-RS 45892",
    badge: "bg-blue-600 text-white",
    desc: "Evolução médica SOAP, prescrição medicamentosa, diagnósticos CID-10, solicitação de exames e adendos.",
  },
  {
    username: "tec.marcos",
    name: "Téc. Enf. Marcos Vinícius Antunes",
    roleLabel: "Técnico de Enfermagem — COREN-TE 612904",
    badge: "bg-teal-600 text-white",
    desc: "Realiza anotações de enfermagem, sinais vitais/balanço hídrico e checagens beira-leito (vedado diagnóstico/prescrição privativos).",
  },
  {
    username: "fisio.camila",
    name: "Ft. Camila Dornelles",
    roleLabel: "Fisioterapeuta — CREFITO-5 198432-F",
    badge: "bg-indigo-600 text-white",
    desc: "Evolução fisioterapêutica, avaliação respiratória/motora e consulta ao prontuário.",
  },
  {
    username: "farm.rafael",
    name: "Farm. Rafael Albuquerque",
    roleLabel: "Farmacêutico Clínico — CRF-RS 14820",
    badge: "bg-purple-600 text-white",
    desc: "Outros profissionais assistenciais: conciliação medicamentosa e evolução multiprofissional.",
  },
  {
    username: "admin",
    name: "Carlos Eduardo Mendes",
    roleLabel: "Administrador de TI e Acessos",
    badge: "bg-slate-700 text-white",
    desc: "Gerencia usuários, unidades e leitos (bloqueado no backend de visualizar dados clínicos sigilosos do PEP).",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("enf.giovani");
  const [password, setPassword] = useState("Hosp@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal de Recuperação de Acesso
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [generatedDemoToken, setGeneratedDemoToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState("");
  const [recoveryErr, setRecoveryErr] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      router.push(data.user?.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Erro de comunicação com o servidor hospitalar.");
      setLoading(false);
    }
  }

  function selectDemoUser(userIdentifier: string) {
    setIdentifier(userIdentifier);
    setPassword("Hosp@2026");
    setError("");
  }

  async function handleRequestRecoveryToken(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryErr("");
    setRecoveryMsg("");
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_TOKEN",
          identifier: recoveryIdentifier,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryErr(data.error || "Falha ao solicitar código.");
        return;
      }
      setGeneratedDemoToken(data.demoRecoveryToken || "");
      setRecoveryToken(data.demoRecoveryToken || "");
      setRecoveryMsg(data.message);
    } catch {
      setRecoveryErr("Erro ao solicitar código de recuperação.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryErr("");
    setRecoveryMsg("");
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PASSWORD",
          recoveryToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryErr(data.error || "Falha ao redefinir senha.");
        return;
      }
      setRecoveryMsg(data.message);
      setPassword(newPassword);
      setTimeout(() => {
        setShowRecovery(false);
        setGeneratedDemoToken("");
      }, 1500);
    } catch {
      setRecoveryErr("Erro ao redefinir senha.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Faixa Superior */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">
            Hospital Universitário de Clínicas — Unidade Integrada (CNES 2237601)
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span>Auditoria LGPD / CFM / SBIS Ativa</span>
          <span>•</span>
          <span>Resoluções COFEN nº 736/2024 e 754/2024</span>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Formulário de Autenticação */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-7 text-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                HospVita PEP
              </h1>
              <p className="text-xs text-slate-500">
                Prontuário Eletrônico do Paciente e Gestão Assistencial
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identificador Profissional ou E-mail Institucional
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: enf.giovani ou med.helena@hospital.org.br"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
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
                  onClick={() => {
                    setRecoveryIdentifier(identifier);
                    setShowRecovery(true);
                  }}
                  className="text-xs text-emerald-700 hover:underline font-medium cursor-pointer"
                >
                  Recuperar acesso / Desbloquear
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>{loading ? "Autenticando sessão segura..." : "Acessar Sistema Hospitalar"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Segurança da Informação em Saúde</span>
            </div>
            <p>
              Todos os acessos, consultas e registros clínicos são auditados com identificação do profissional e horário oficial do servidor. Bloqueio automático após 5 tentativas inválidas.
            </p>
          </div>
        </div>

        {/* Painel de Perfis de Demonstração (6 Perfis RBAC) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-white space-y-1">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ambiente de Demonstração — Dados 100% Fictícios
            </span>
            <h2 className="text-2xl font-bold">
              Perfis Profissionais e Controle de Permissões (RBAC)
            </h2>
            <p className="text-xs text-slate-300">
              Clique em qualquer perfil abaixo para preencher automaticamente as credenciais (Senha padrão: <code className="text-emerald-300 font-mono">Hosp@2026</code>) e validar as regras de permissão no backend:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_PROFILES.map((p) => {
              const selected = identifier === p.username;
              return (
                <button
                  key={p.username}
                  type="button"
                  onClick={() => selectDemoUser(p.username)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg"
                      : "bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm text-white">
                      {p.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.badge}`}>
                      {p.username}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-emerald-300 mb-1.5">
                    {p.roleLabel}
                  </p>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Acesso */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Recuperação de Acesso e Desbloqueio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>

            {recoveryErr && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {recoveryErr}
              </div>
            )}

            {recoveryMsg && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{recoveryMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestRecoveryToken} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                1. Informe seu usuário ou e-mail institucional
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={recoveryIdentifier}
                  onChange={(e) => setRecoveryIdentifier(e.target.value)}
                  placeholder="Ex: enf.giovani"
                  className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Gerar Código
                </button>
              </div>
            </form>

            {generatedDemoToken && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                Código de validação gerado (ambiente local):{" "}
                <strong className="font-mono">{generatedDemoToken}</strong>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 pt-2 border-t">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Código de Validação
                </label>
                <input
                  type="text"
                  required
                  value={recoveryToken}
                  onChange={(e) => setRecoveryToken(e.target.value)}
                  placeholder="Código de 8 caracteres"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                Confirmar Redefinição e Desbloquear Conta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé Regulatório */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-3 text-center text-[11px] text-slate-400">
        HospVita PEP — Sistema de Prontuário Eletrônico do Paciente. Dados 100% fictícios para fins de desenvolvimento, ensino e validação funcional.
      </footer>
    </div>
  );
}

