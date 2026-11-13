"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserPlus,
  Clock,
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
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
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
      label: "Censo & Residentes",
      icon: LayoutDashboard,
      match: pathname.startsWith("/dashboard"),
    },
    {
      href: "/pacientes",
      label: "Pacientes & Admissões",
      icon: Users,
      match: pathname.startsWith("/pacientes") || pathname.startsWith("/prontuario"),
    },
    {
      href: "/admin",
      label: "Equipe & Acessos",
      icon: Settings,
      match: pathname.startsWith("/admin"),
    },
    {
      href: "/auditoria",
      label: "Registros de Auditoria",
      icon: ShieldCheck,
      match: pathname.startsWith("/auditoria"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-[#18281E]">
      {/* Cabeçalho Institucional PerTe */}
      <header className="no-print sticky top-0 z-40 h-16 bg-white border-b-2 border-[#C4A76E]/55 px-4 lg:px-6 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#F4F0E6] text-[#143D25]"
            aria-label="Abrir navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img
              src="/logo-perte.jpg"
              alt="Per Te Residencial Sênior"
              className="w-11 h-11 rounded-full object-contain bg-white border border-[#947743]/50 shadow-2xs shrink-0"
            />
            <div className="leading-tight">
              <span className="font-editorial text-xl font-bold text-[#143D25] tracking-tight block">
                Prontuário PerTe
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C703E] block">
                Residencial Sênior
              </span>
            </div>
          </Link>

          <form
            onSubmit={handleQuickSearchSubmit}
            className="hidden md:flex items-center ml-5 bg-[#F6F3EC] border border-[#DDD5C0] rounded-lg px-3 py-1.5 w-64 lg:w-80 focus-within:border-[#947743] focus-within:bg-white transition-colors"
          >
            <Search className="w-4 h-4 text-[#8C703E] mr-2 shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Localizar residente ou nº prontuário..."
              className="bg-transparent text-xs text-[#18281E] placeholder-[#8A816C] focus:outline-none w-full"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {currentClock && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#524B3C] bg-[#F6F3EC] px-3 py-1.5 rounded-lg border border-[#E4DEC9]">
              <Clock className="w-3.5 h-3.5 text-[#8C703E]" />
              <span>{currentClock}</span>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-[#E4DEC9]">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-bold text-[#143D25]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#143D25] text-[#F5EFE2] border border-[#947743]/60">
                    {user.professional
                      ? `${user.professional.councilType}-${user.professional.councilState} ${user.professional.councilNumber}`
                      : user.role}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6654] hidden sm:block">
                  {user.professional?.specialty || user.capabilities.label}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-red-700 text-[#383328] hover:text-white text-xs font-semibold transition-colors border border-[#DDD5C0] cursor-pointer"
                title="Encerrar turno"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navegação Lateral PerTe */}
        <aside
          className={`no-print bg-[#122B1D] text-[#EAE4D3] border-r border-[#947743]/30 flex flex-col justify-between transition-all duration-200 shrink-0 ${
            collapsed ? "w-16" : "w-60"
          } ${
            mobileOpen
              ? "fixed inset-y-16 left-0 z-40 w-60 shadow-2xl"
              : "hidden lg:flex"
          }`}
        >
          <div className="p-3 space-y-1.5">
            <div className="px-2 py-1.5 flex items-center justify-between border-b border-[#214732] mb-2">
              {!collapsed && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C5A872]">
                  Navegação Clínica
                </span>
              )}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-1 rounded hover:bg-[#1B3F2B] text-[#C5A872] ml-auto cursor-pointer"
                title={collapsed ? "Expandir" : "Recolher"}
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    item.match
                      ? "bg-[#1C462E] text-white border-l-3 border-[#C5A872] font-semibold shadow-2xs"
                      : "text-[#D5CEBC] hover:bg-[#183A26] hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.match ? "text-[#C5A872]" : "text-[#9BBF82]"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            {!collapsed && (
              <div className="pt-5 mt-5 border-t border-[#214732] px-1 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C5A872] block px-1">
                  Acesso Direto
                </span>
                <Link
                  href="/pacientes"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-[#183A26] hover:bg-[#214E34] text-[#F5EFE2] border border-[#947743]/35 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#C5A872] shrink-0" />
                  <span className="truncate font-medium">Nova Admissão / PEP</span>
                </Link>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="p-3.5 m-3 rounded-lg bg-[#0D2015] border border-[#947743]/30 text-[11px] text-[#D5CEBC]">
              <p className="font-editorial text-sm font-semibold text-[#C5A872]">
                Per Te Residencial Sênior
              </p>
              <p className="text-[10px] text-[#9C927A] mt-0.5 leading-relaxed">
                Prontuário Assistencial Multiprofissional
              </p>
            </div>
          )}
        </aside>

        {/* Área Principal */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
