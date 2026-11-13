"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import {
  Settings,
  UserPlus,
  BedDouble,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  professional?: {
    category: string;
    councilType: string;
    councilNumber: string;
    councilState: string;
    specialty: string;
  } | null;
}

interface AdminUnitItem {
  id: string;
  code: string;
  name: string;
  floor: string;
  specialty: string;
  beds: Array<{
    id: string;
    code: string;
    room: string;
    type: string;
    status: string;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [unitsList, setUnitsList] = useState<AdminUnitItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "Hosp@2026",
    role: "ENFERMEIRO",
    councilType: "COREN",
    councilNumber: "",
    councilState: "RS",
    specialty: "Enfermagem Assistencial",
  });

  const loadAdmin = useCallback(async () => {
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
      setUsersList(data.users);
      setUnitsList(data.units);
    }
  }, [router]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_USER",
        ...newUserForm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Erro ao criar usuário." });
      return;
    }
    setFeedback({
      type: "success",
      text: `Profissional ${data.createdUser.name} cadastrado com sucesso!`,
    });
    setNewUserForm((prev) => ({
      ...prev,
      username: "",
      email: "",
      name: "",
      councilNumber: "",
    }));
    loadAdmin();
  }

  async function handleToggleUserStatus(targetUserId: string) {
    setFeedback(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "TOGGLE_USER_STATUS",
        targetUserId,
      }),
    });
    if (res.ok) {
      setFeedback({
        type: "success",
        text: "Status / desbloqueio da conta atualizado com sucesso.",
      });
      loadAdmin();
    }
  }

  async function handleUpdateBedStatus(bedId: string, status: string) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_BED_STATUS",
        bedId,
        status,
      }),
    });
    if (res.ok) {
      loadAdmin();
    }
  }

  const isAdmin = user?.capabilities.canManageUsersAndUnits;

  return (
    <AppShell user={user}>
      <div className="p-4 lg:p-6 space-y-5 max-w-[1550px] mx-auto text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700">
              Administração Hospitalar, Controle de Acesso (RBAC) e Leitos
            </span>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Gestão de Usuários, Conselhos Profissionais, Unidades e Leitos</span>
            </h1>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-[11px] text-slate-700">
            <strong>Regra de Sigilo Clínico:</strong> O perfil <code>ADMIN</code> gerencia usuários e leitos, mas é bloqueado no backend caso tente abrir um prontuário eletrônico.
          </div>
        </div>

        {!isAdmin && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Você está conectado como <strong>{user?.name} ({user?.role})</strong>. A visualização da matriz está ativa; para criar usuários ou alterar status administrativos, alterne para o perfil <code>admin</code> na tela de login.
            </span>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Formulário de Cadastro de Novo Profissional (Exclusivo para ADMIN) */}
        {isAdmin && (
          <form
            onSubmit={handleCreateUser}
            className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs space-y-3"
          >
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Cadastrar Novo Profissional / Usuário no Sistema</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Ex: Enf. Patrícia Nogueira"
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identificador (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, username: e.target.value })
                  }
                  placeholder="Ex: enf.patricia"
                  className="w-full p-2 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  E-mail Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="enf.patricia@hospital.org.br"
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Perfil de Acesso (RBAC) *
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 font-bold"
                >
                  <option value="ENFERMEIRO">Enfermeiro(a)</option>
                  <option value="MEDICO">Médico(a)</option>
                  <option value="TECNICO_ENFERMAGEM">Técnico(a) de Enfermagem</option>
                  <option value="FISIOTERAPEUTA">Fisioterapeuta</option>
                  <option value="OUTRO_ASSISTENCIAL">Outro Assistencial (Farmácia/Nutrição)</option>
                  <option value="ADMIN">Administrador de TI</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Conselho</label>
                <select
                  value={newUserForm.councilType}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, councilType: e.target.value })
                  }
                  className="w-full p-2 rounded border border-slate-300"
                >
                  <option value="COREN">COREN</option>
                  <option value="CRM">CRM</option>
                  <option value="COREN-TE">COREN-TE</option>
                  <option value="CREFITO">CREFITO</option>
                  <option value="CRF">CRF</option>
                  <option value="CRN">CRN</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nº Registro Profissional
                </label>
                <input
                  type="text"
                  value={newUserForm.councilNumber}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, councilNumber: e.target.value })
                  }
                  placeholder="Ex: 310992"
                  className="w-full p-2 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha Inicial *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  className="w-full p-2 rounded border border-slate-300 font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tabela de Usuários e Perfis Cadastrados */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 font-bold text-sm text-slate-900">
            Profissionais e Usuários Cadastrados ({usersList.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300 font-bold text-[11px]">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Login / E-mail</th>
                  <th className="py-2.5 px-3">Perfil RBAC</th>
                  <th className="py-2.5 px-3">Registro Profissional</th>
                  <th className="py-2.5 px-3">Status / Tentativas</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <div>{u.username}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {u.professional ? (
                        <span>
                          {u.professional.councilType}-{u.professional.councilState}{" "}
                          <strong>{u.professional.councilNumber}</strong> •{" "}
                          {u.professional.specialty}
                        </span>
                      ) : (
                        <span className="text-slate-400">Administrativo (Sem acesso PEP)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {u.active ? (
                        <span className="text-emerald-700 font-bold">
                          ATIVO (Falhas: {u.failedLoginAttempts})
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">INATIVO</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
                        >
                          {u.active ? (
                            <>
                              <Lock className="w-3 h-3 text-slate-600" />
                              <span>Desativar / Resetar</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>Reativar</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gestão de Unidades e Status de Leitos */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
            <BedDouble className="w-4 h-4 text-emerald-600" />
            <span>Unidades Hospitalares e Gestão Operacional de Leitos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unitsList.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div>
                  <span className="font-mono font-bold text-emerald-800">{u.code}</span> —{" "}
                  <strong className="text-slate-900">{u.name}</strong>
                  <div className="text-[11px] text-slate-500">
                    {u.floor} • {u.specialty}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {u.beds.map((b) => (
                    <div
                      key={b.id}
                      className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">{b.code}</div>
                        <div className="text-[10px] text-slate-500">{b.status}</div>
                      </div>
                      {isAdmin && (
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBedStatus(b.id, e.target.value)}
                          className="text-[10px] p-1 rounded border border-slate-300"
                        >
                          <option value="LIVRE">LIVRE</option>
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
        </div>
      </div>
    </AppShell>
  );
}

