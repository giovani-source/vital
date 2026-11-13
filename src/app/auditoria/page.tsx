"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell, { SessionUserClient } from "@/components/AppShell";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Truck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  userId: string | null;
  userName: string;
  userRole: string;
  patientId: string | null;
  encounterId: string | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditoriaPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUserClient | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [moduleFilter, setModuleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [transportPayload, setTransportPayload] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch(
        `/api/audit${moduleFilter ? `?module=${encodeURIComponent(moduleFilter)}` : ""}`
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } finally {
      setLoading(false);
    }
  }, [router, moduleFilter]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  async function testTransportIntegrationApi() {
    const res = await fetch("/api/v1/integration/transport-context");
    if (res.ok) {
      const data = await res.json();
      setTransportPayload(data);
      loadAudit();
    }
  }

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell user={user}>
      <div className="p-4 lg:p-6 space-y-5 max-w-[1550px] mx-auto text-xs">
        {/* Cabeçalho */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700">
              Segurança da Informação em Saúde, LGPD e Normas CFM/SBIS & COFEN
            </span>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900">
              Trilha de Auditoria de Acessos, Alterações e Arquitetura de Expansão
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testTransportIntegrationApi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Testar API REST de Integração (Transporte de Pacientes)</span>
            </button>
            <button
              type="button"
              onClick={loadAudit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Matriz Regulatória e Requisitos Pendentes de Homologação Clínica */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <FileCheck2 className="w-4 h-4" />
              <span>Resoluções COFEN nº 736/2024 e 754/2024</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Implementa as 5 etapas do Processo de Enfermagem com distinção estrita entre atribuições privativas do Enfermeiro (Avaliação, Diagnóstico e Prescrição de Enfermagem) e do Técnico de Enfermagem (Anotações e Checagens), além de auditoria eletrônica imutável.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-800">
              <Lock className="w-4 h-4" />
              <span>LGPD e Controle de Acesso (RBAC)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Senhas com PBKDF2-SHA512 + salt individual, bloqueio automático contra força bruta (5 tentativas), sessões HTTP-only e separação entre Administração de TI e sigilo clínico assistencial.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 space-y-2 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Aviso de Homologação e Requisitos Pendentes</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Este software opera exclusivamente com <strong>dados 100% fictícios</strong>. Para uso clínico real em produção hospitalar, permanecem pendentes: (1) Integração com certificado digital qualificado padrão ICP-Brasil (NGS2 SBIS/CFM); (2) Auditoria formal de conformidade SBIS; (3) Infraestrutura HSM/KMS e backup criptografado redundante.
            </p>
          </div>
        </div>

        {/* Visualizador do Contrato REST de Expansão (Seção 10 — Transporte de Pacientes) */}
        {transportPayload && (
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">
                Resposta Autenticada de /api/v1/integration/transport-context (Seção 10 — Preparado para Futuro Módulo de Transporte)
              </span>
              <button
                type="button"
                onClick={() => setTransportPayload(null)}
                className="text-slate-400 hover:text-white"
              >
                Fechar JSON
              </button>
            </div>
            <pre className="text-[11px] font-mono overflow-x-auto max-h-64 bg-slate-950 p-3 rounded border border-slate-800">
              {JSON.stringify(transportPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Tabela de Logs de Auditoria */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-slate-900">
                Registros de Auditoria ({filteredLogs.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
              >
                <option value="">Todos os Módulos</option>
                <option value="AUTH">Autenticação (AUTH)</option>
                <option value="PEP">Prontuário (PEP)</option>
                <option value="EVOLUCAO">Evoluções e Adendos</option>
                <option value="ENFERMAGEM">Processo de Enfermagem</option>
                <option value="SINAIS_VITAIS">Sinais Vitais e BH</option>
                <option value="PRESCRICAO">Prescrições</option>
                <option value="CHECAGEM">Checagem Beira-Leito</option>
                <option value="RELATORIOS_PDF">Exportação PDF</option>
                <option value="ADMIN">Administração</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por usuário, ação ou detalhe..."
                  className="pl-8 pr-3 py-1.5 rounded border border-slate-300 bg-white w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300 font-bold text-[11px] text-slate-700">
                  <th className="py-2.5 px-3">Data / Horário Servidor</th>
                  <th className="py-2.5 px-3">Profissional / Usuário</th>
                  <th className="py-2.5 px-2.5">Perfil</th>
                  <th className="py-2.5 px-2.5">Módulo</th>
                  <th className="py-2.5 px-2.5">Evento / Ação</th>
                  <th className="py-2.5 px-3">Detalhes da Operação Auditada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => {
                  const isDenied =
                    log.action.includes("DENIED") ||
                    log.action.includes("FAILED") ||
                    log.action.includes("BLOCKED");
                  return (
                    <tr
                      key={log.id}
                      className={
                        isDenied ? "bg-red-50/70 hover:bg-red-100/70" : "hover:bg-slate-50"
                      }
                    >
                      <td className="py-2 px-3 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{log.userName}</td>
                      <td className="py-2 px-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-mono font-semibold text-slate-700">
                        {log.module}
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            isDenied
                              ? "bg-red-600 text-white"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isDenied ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

