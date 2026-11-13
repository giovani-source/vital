"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import {
  Settings,
  UserPlus,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  Trash2,
  Building2,
  Plus,
} from "lucide-react";

interface UserAdminItem {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt?: string;
  professional: {
    category: string;
    councilType: string;
    councilNumber: string;
    councilState: string;
    specialty: string;
  } | null;
}

interface HospitalUnitItem {
  id: string;
  code: string;
  name: string;
  floor: string;
  specialty: string;
  beds: Array<{ id: string; code: string; room: string; type: string; status: string }>;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador Geral (ADM — Acesso Total)" },
  { value: "MEDICO", label: "Médico(a) — CRM" },
  { value: "ENFERMEIRO", label: "Enfermeiro(a) — COREN" },
  { value: "TECNICO_ENFERMAGEM", label: "Técnico(a) de Enfermagem (Com Limitações)" },
  { value: "FISIOTERAPEUTA", label: "Fisioterapeuta — CREFITO" },
  { value: "OUTRO_ASSISTENCIAL", label: "Multiprofissional (Farmácia / Nutrição)" },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [users, setUsers] = useState<UserAdminItem[]>([]);
  const [units, setUnits] = useState<HospitalUnitItem[]>([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [showNewBedModal, setShowNewBedModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Estado para ajuste de perfil antes de aprovar
  const [pendingRoleSelections, setPendingRoleSelections] = useState<Record<string, string>>({});

  // Novo usuário direto pelo ADM (sem dados pré-preenchidos)
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "ENFERMEIRO",
    councilType: "COREN",
    councilNumber: "",
    councilState: "RS",
    specialty: "",
  });

  // Nova unidade hospitalar
  const [newUnit, setNewUnit] = useState({
    code: "",
    name: "",
    floor: "",
    specialty: "",
  });

  // Novo leito
  const [newBed, setNewBed] = useState({
    unitId: "",
    code: "",
    room: "",
    type: "ENFERMARIA",
  });

  const loadData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    const meData = await meRes.json();
    setUser(meData.user);

    const res = await fetch("/api/admin");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setUnits(data.units || []);
      if (data.units?.length > 0 && !newBed.unitId) {
        setNewBed((prev) => ({ ...prev, unitId: data.units[0].id }));
      }
    }
  }, [router, newBed.unitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleApproveUser(targetUser: UserAdminItem) {
    setFeedback(null);
    const selectedRole = pendingRoleSelections[targetUser.id] || targetUser.role;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "APPROVE_USER",
        targetUserId: targetUser.id,
        role: selectedRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Falha ao liberar perfil." });
      return;
    }
    setFeedback({
      type: "success",
      text: `Acesso liberado com sucesso para ${targetUser.name} (${selectedRole})!`,
    });
    await loadData();
  }

  async function handleUpdateRole(targetUserId: string, role: string) {
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_USER_ROLE",
        targetUserId,
        role,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao alterar perfil." });
      return;
    }
    setFeedback({ type: "success", text: "Perfil profissional atualizado com sucesso." });
    await loadData();
  }

  async function handleToggleUser(targetUserId: string) {
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_USER_STATUS", targetUserId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Sem permissão administrativa." });
      return;
    }
    setFeedback({ type: "success", text: "Status do usuário atualizado com sucesso." });
    await loadData();
  }

  async function handleDeleteUser(targetUser: UserAdminItem) {
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_USER", targetUserId: targetUser.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Não foi possível remover o usuário." });
      return;
    }
    setFeedback({ type: "success", text: `Cadastro de ${targetUser.name} removido.` });
    await loadData();
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_USER",
        ...newUser,
        active: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Falha ao cadastrar usuário." });
      return;
    }
    setFeedback({
      type: "success",
      text: `Profissional ${data.createdUser.name} cadastrado e liberado com sucesso!`,
    });
    setShowNewUserModal(false);
    setNewUser({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "ENFERMEIRO",
      councilType: "COREN",
      councilNumber: "",
      councilState: "RS",
      specialty: "",
    });
    await loadData();
  }

  async function handleCreateUnit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_UNIT", ...newUnit }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao criar unidade." });
      return;
    }
    setFeedback({ type: "success", text: `Unidade ${data.unit.name} criada com sucesso!` });
    setShowNewUnitModal(false);
    setNewUnit({ code: "", name: "", floor: "", specialty: "" });
    await loadData();
  }

  async function handleCreateBed(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_BED", ...newBed }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao criar leito." });
      return;
    }
    setFeedback({ type: "success", text: `Leito ${data.bed.code} adicionado com sucesso!` });
    setShowNewBedModal(false);
    setNewBed((prev) => ({ ...prev, code: "", room: "" }));
    await loadData();
  }

  async function handleBedStatusChange(bedId: string, status: string) {
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_BED_STATUS", bedId, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Sem permissão administrativa." });
      return;
    }
    setFeedback({ type: "success", text: "Status do leito atualizado." });
    await loadData();
  }

  const pendingUsers = users.filter((u) => !u.active);
  const activeUsers = users.filter((u) => u.active);

  return (
    <AppShell user={user}>
      <div className="p-4 lg:p-6 space-y-5">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-900">
                Administração Geral (ADM) — Liberação de Perfis, Unidades e Leitos
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              O perfil ADM possui visão integral de todos os módulos do sistema e libera os
              cadastros solicitados pelos profissionais na tela de login.
            </p>
          </div>

          {user?.capabilities.canManageUsersAndUnits && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewUnitModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                Nova Unidade
              </button>
              <button
                type="button"
                onClick={() => setShowNewBedModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Leito
              </button>
              <button
                type="button"
                onClick={() => setShowNewUserModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Criar Perfil Já Liberado
              </button>
            </div>
          )}
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* FILA DE LIBERAÇÃO DO ADM: Cadastros Pendentes */}
        <div className="bg-white rounded-xl border-2 border-amber-300 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Solicitações de Cadastro Profissional Aguardando Liberação do ADM (
                {pendingUsers.length})
              </span>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Profissionais criados na tela de login aparecem aqui para aprovação
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhuma solicitação de cadastro pendente de liberação no momento. Quando um
              profissional criar sua conta na tela de login, ela aparecerá aqui para você aprovar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-50/50 border-b border-amber-200 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2.5 px-3">Profissional Solicitante</th>
                    <th className="py-2.5 px-3">Usuário / E-mail</th>
                    <th className="py-2.5 px-3">Conselho Informado</th>
                    <th className="py-2.5 px-3">Definir / Confirmar Perfil</th>
                    <th className="py-2.5 px-3 text-right">Liberação ADM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-xs">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="bg-amber-50/20 hover:bg-amber-50/60">
                      <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {u.username}
                        <div className="text-[10px] font-sans text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        {u.professional ? (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-semibold text-slate-800">
                            {u.professional.councilType}-{u.professional.councilState}{" "}
                            {u.professional.councilNumber} ({u.professional.specialty})
                          </span>
                        ) : (
                          "Não informado"
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={pendingRoleSelections[u.id] || u.role}
                          onChange={(e) =>
                            setPendingRoleSelections({
                              ...pendingRoleSelections,
                              [u.id]: e.target.value,
                            })
                          }
                          disabled={!user?.capabilities.canManageUsersAndUnits}
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {user?.capabilities.canManageUsersAndUnits && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveUser(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Liberar Acesso
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Recusar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tabela de Profissionais Liberados / Ativos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Profissionais Liberados & Gestão de Perfis ({activeUsers.length})
            </span>
            <span className="text-[11px] text-slate-300">
              Altere o perfil ou bloqueie o acesso a qualquer momento
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Nome Completo</th>
                  <th className="py-2.5 px-3">Usuário / E-mail</th>
                  <th className="py-2.5 px-3">Perfil RBAC</th>
                  <th className="py-2.5 px-3">Registro no Conselho</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações ADM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {activeUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {u.username}
                      <div className="text-[10px] font-sans text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {user?.capabilities.canManageUsersAndUnits ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold text-slate-800"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {u.professional ? (
                        <span>
                          <strong>
                            {u.professional.councilType}-{u.professional.councilState}
                          </strong>{" "}
                          {u.professional.councilNumber} ({u.professional.specialty})
                        </span>
                      ) : (
                        <span className="text-slate-400">Administração Geral</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        LIBERADO / ATIVO
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {user?.capabilities.canManageUsersAndUnits && u.id !== user.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleUser(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer"
                          >
                            <Lock className="w-3 h-3" />
                            Suspender Liberação
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matriz Comparativa de Limitações por Perfil Profissional */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Matriz de Alçadas e Limitações por Perfil Profissional (Verificada no Backend)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-2 px-3">Perfil</th>
                  <th className="py-2 px-3">Ver Tudo / PEP</th>
                  <th className="py-2 px-3">Evoluções / Anotações</th>
                  <th className="py-2 px-3">Processo de Enf. (5 Etapas)</th>
                  <th className="py-2 px-3">Prescrição Médica</th>
                  <th className="py-2 px-3">Checagem & Sinais Vitais</th>
                  <th className="py-2 px-3">Liberar Perfis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-bold text-slate-900">ADM (Administrador Geral)</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Total</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Todas</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Liberado</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Liberado</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Liberado</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Sim (Exclusivo)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-blue-800">Médico(a)</td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">Sim</td>
                  <td className="py-2 px-3">Evolução Médica</td>
                  <td className="py-2 px-3 text-slate-400">Consulta</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Sim (Privativo)</td>
                  <td className="py-2 px-3 text-emerald-700">Sim</td>
                  <td className="py-2 px-3 text-red-600">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-emerald-800">Enfermeiro(a)</td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">Sim</td>
                  <td className="py-2 px-3">Evolução e Anotação Enf.</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Completo (Privativo)</td>
                  <td className="py-2 px-3 text-red-600">Bloqueado (Só Cuidados)</td>
                  <td className="py-2 px-3 text-emerald-700">Sim</td>
                  <td className="py-2 px-3 text-red-600">Não</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="py-2 px-3 font-bold text-teal-800">
                    Técnico(a) de Enfermagem (Limitado)
                  </td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">Sim</td>
                  <td className="py-2 px-3 font-semibold text-teal-900">
                    Apenas Anotação de Enfermagem
                  </td>
                  <td className="py-2 px-3 text-red-600 font-bold">
                    Bloqueado (Diagnóstico/Prescrição)
                  </td>
                  <td className="py-2 px-3 text-red-600 font-bold">Bloqueado</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">Sim (Beira-Leito)</td>
                  <td className="py-2 px-3 text-red-600">Não</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gestão de Unidades e Leitos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {units.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    {u.code} — {u.name}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {u.floor} • {u.specialty}
                  </p>
                </div>
                <BedDouble className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {u.beds.map((b) => (
                  <div
                    key={b.id}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{b.code}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          b.status === "OCUPADO"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "DISPONIVEL" || b.status === "LIVRE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    {user?.capabilities.canManageUsersAndUnits && (
                      <select
                        value={b.status}
                        onChange={(e) => handleBedStatusChange(b.id, e.target.value)}
                        className="w-full px-1.5 py-1 text-[10px] border border-slate-300 rounded bg-white text-slate-800"
                      >
                        <option value="DISPONIVEL">DISPONÍVEL</option>
                        <option value="OCUPADO">OCUPADO</option>
                        <option value="HIGIENIZACAO">HIGIENIZAÇÃO</option>
                        <option value="MANUTENCAO">MANUTENÇÃO</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Novo Usuário Direto pelo ADM */}
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-sm font-bold">Cadastrar e Liberar Novo Profissional</h3>
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nome completo do profissional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Usuário (Login) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Ex.: med.carlos"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@hospital.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Perfil RBAC *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Senha Inicial *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Conselho</label>
                    <select
                      value={newUser.councilType}
                      onChange={(e) => setNewUser({ ...newUser, councilType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                    >
                      <option value="COREN">COREN</option>
                      <option value="CRM">CRM</option>
                      <option value="CREFITO">CREFITO</option>
                      <option value="CRF">CRF</option>
                      <option value="CRN">CRN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nº Registro</label>
                    <input
                      type="text"
                      value={newUser.councilNumber}
                      onChange={(e) => setNewUser({ ...newUser, councilNumber: e.target.value })}
                      placeholder="Número"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UF</label>
                    <input
                      type="text"
                      value={newUser.councilState}
                      onChange={(e) => setNewUser({ ...newUser, councilState: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Salvar e Liberar Profissional
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nova Unidade */}
        {showNewUnitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-sm font-bold">Nova Unidade Hospitalar</h3>
                <button
                  type="button"
                  onClick={() => setShowNewUnitModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
              <form onSubmit={handleCreateUnit} className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código / Sigla (ex: 4NORTE) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit.code}
                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome da Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Andar / Bloco</label>
                    <input
                      type="text"
                      value={newUnit.floor}
                      onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Especialidade</label>
                    <input
                      type="text"
                      value={newUnit.specialty}
                      onChange={(e) => setNewUnit({ ...newUnit, specialty: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewUnitModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Criar Unidade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Novo Leito */}
        {showNewBedModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-sm font-bold">Cadastrar Novo Leito</h3>
                <button
                  type="button"
                  onClick={() => setShowNewBedModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
              <form onSubmit={handleCreateBed} className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unidade Hospitalar *
                  </label>
                  <select
                    value={newBed.unitId}
                    onChange={(e) => setNewBed({ ...newBed, unitId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} — {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Código do Leito *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBed.code}
                      onChange={(e) => setNewBed({ ...newBed, code: e.target.value })}
                      placeholder="Ex.: 0560A"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quarto / Box</label>
                    <input
                      type="text"
                      value={newBed.room}
                      onChange={(e) => setNewBed({ ...newBed, room: e.target.value })}
                      placeholder="Ex.: Enf. 0560"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewBedModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Adicionar Leito
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
