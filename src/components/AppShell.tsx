"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BedDouble,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Building2,
  Settings,
} from "lucide-react";

export interface SessionUserClient {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  institutionName: string;
  professional: {
    category: string;
    councilType: string;
    councilNumber: string;
    councilState: string;
    specialty: string;
  } | null;
  capabilities: {
    label: string;
    badgeColor: string;
    canViewClinicalPEP: boolean;
    canManageUsersAndUnits: boolean;
    canRegisterPatient: boolean;
    canWriteMedicalEvolution: boolean;
    canWriteNursingEvolution: boolean;
    canWriteTechNursingNote: boolean;
    canWriteMultiprofessionalEvolution: boolean;
    canPerformNursingAssessment: boolean;
    canPrescribeNursingDiagnosisAndPlan: boolean;
    canPrescribeMedications: boolean;
    canPrescribeNursingCare: boolean;
    canCheckMedicationsAndCare: boolean;
    canRecordVitalSigns: boolean;
    canRecordMedicalDiagnosis: boolean;
    canRecordAllergies: boolean;
    canRequestExams: boolean;
    canUploadDocuments: boolean;
    canExportPDF: boolean;
  };
}

interface AppShellProps {
  children: React.ReactNode;
  user: SessionUserClient | null;
}

export default function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [quickSearch, setQuickSearch] = useState("");
  const [currentClock, setCurrentClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentClock(
        now.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function handleQuickSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    router.push(`/pacientes?q=${encodeURIComponent(quickSearch.trim())}`);
  }

  const navItems = [
    {
      href: "/dashboard",
      label: "Lista Pacientes / Censo",
      icon: LayoutDashboard,
      match: pathname.startsWith("/dashboard"),
    },
    {
      href: "/pacientes",
      label: "Cadastro & Internações",
      icon: Users,
      match: pathname.startsWith("/pacientes"),
    },
    {
      href: "/prontuario/7834153",
      label: "Prontuário Eletrônico (PEP)",
      icon: FileText,
      match: pathname.startsWith("/prontuario"),
    },
    {
      href: "/auditoria",
      label: "Auditoria & Integração",
      icon: ShieldCheck,
      match: pathname.startsWith("/auditoria"),
    },
    {
      href: "/admin",
      label: "Gestão & Permissões",
      icon: Settings,
      match: pathname.startsWith("/admin"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Barra Superior Hospitalar */}
      <header className="no-print sticky top-0 z-40 h-14 bg-slate-900 text-white border-b border-slate-700 px-3 lg:px-5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-slate-800 text-slate-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 transition-colors">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-white">
                  HospVita
                </span>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
                  PEP v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block leading-none">
                {user?.institutionName || "Hospital Universitário de Clínicas"}
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleQuickSearchSubmit}
            className="hidden md:flex items-center ml-4 bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 w-64 lg:w-80 focus-within:border-emerald-500"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Buscar paciente ou prontuário..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {/* Status de Conexão e Estação */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estação: 5SUL-5S3</span>
            <span className="text-slate-500">|</span>
            <span>{currentClock}</span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${
              isOnline
                ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                : "bg-red-950/80 border-red-600 text-red-200"
            }`}
            title={
              isOnline
                ? "Conexão ativa com o banco de dados"
                : "Falha de conexão detectada"
            }
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold text-white">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${user.capabilities.badgeColor}`}
                  >
                    {user.professional
                      ? `${user.professional.councilType}-${user.professional.councilState} ${user.professional.councilNumber}`
                      : user.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  {user.professional?.specialty || user.capabilities.label}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                title="Encerrar sessão com segurança"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Menu Lateral Fixo / Recolhível */}
        <aside
          className={`no-print bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 shrink-0 ${
            collapsed ? "w-16" : "w-60"
          } ${
            mobileOpen
              ? "fixed inset-y-14 left-0 z-40 w-60 shadow-2xl"
              : "hidden lg:flex"
          }`}
        >
          <div className="p-2.5 space-y-1">
            <div className="px-2 py-1.5 flex items-center justify-between">
              {!collapsed && (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Módulos Hospitalares
                </span>
              )}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ml-auto cursor-pointer"
                title={collapsed ? "Expandir menu" : "Recolher menu"}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    item.match
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            {!collapsed && (
              <div className="pt-4 mt-4 border-t border-slate-800 px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Acesso Rápido — Pacientes 5º Sul
                </span>
                <div className="space-y-1">
                  <Link
                    href="/prontuario/7834153"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/70"
                  >
                    <span className="truncate font-medium">0551A • José Luis R.</span>
                    <span className="text-[10px] text-amber-300 font-mono">7834153</span>
                  </Link>
                  <Link
                    href="/prontuario/18382671"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/70"
                  >
                    <span className="truncate font-medium">0549B • Pedro Machado</span>
                    <span className="text-[10px] text-emerald-300 font-mono">18382671</span>
                  </Link>
                  <Link
                    href="/prontuario/18427682"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/70"
                  >
                    <span className="truncate font-medium">0556A • Maria Inez K.</span>
                    <span className="text-[10px] text-sky-300 font-mono">18427682</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="p-3 m-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Conformidade Técnica</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                COFEN 736/2024 • COFEN 754/2024 • LGPD • CFM/SBIS (Ambiente de Demonstração com Dados Fictícios)
              </p>
            </div>
          )}
        </aside>

        {/* Área Central Principal */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

