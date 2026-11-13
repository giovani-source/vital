import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unitCode = searchParams.get("unit") || "";
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    const units = await prisma.hospitalUnit.findMany({
      include: {
        beds: {
          orderBy: { code: "asc" },
        },
        _count: {
          select: {
            admissions: { where: { status: "ATIVA" } },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    const allBeds = units.flatMap((u) => u.beds);
    const occupiedBeds = allBeds.filter((b) => b.status === "OCUPADO").length;
    const freeBeds = allBeds.filter((b) => b.status === "LIVRE").length;

    const activeEncounters = await prisma.encounter.findMany({
      where: {
        status: "EM_ANDAMENTO",
        ...(unitCode ? { unit: { code: unitCode } } : {}),
      },
      include: {
        patient: {
          include: {
            allergies: { where: { active: true } },
          },
        },
        unit: true,
        admission: {
          include: {
            bed: true,
          },
        },
        evolutions: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        nursingAssessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        prescriptions: {
          where: { status: "VIGENTE" },
          include: {
            items: {
              include: {
                administrations: true,
              },
            },
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { openedAt: "desc" },
    });

    const filteredEncounters = activeEncounters.filter((enc) => {
      if (!query) return true;
      const p = enc.patient;
      const bedCode = enc.admission?.bed?.code?.toLowerCase() || "";
      return (
        p.name.toLowerCase().includes(query) ||
        p.chartNumber.toLowerCase().includes(query) ||
        (p.cpf && p.cpf.toLowerCase().includes(query)) ||
        enc.encounterNumber.toLowerCase().includes(query) ||
        bedCode.includes(query)
      );
    });

    const pendingDraftsCount = await prisma.clinicalEvolution.count({
      where: { status: "RASCUNHO" },
    });

    const pendingNursingDrafts = await prisma.nursingAssessment.count({
      where: { status: "RASCUNHO" },
    });

    // Calcular atividades assistenciais (itens fixos ainda não checados no turno)
    let pendingChecksCount = 0;
    const alerts: Array<{
      id: string;
      patientId: string;
      patientName: string;
      chartNumber: string;
      bedCode: string;
      severity: "ALTA" | "MEDIA";
      title: string;
      description: string;
    }> = [];

    const patientRows = filteredEncounters.map((enc) => {
      const p = enc.patient;
      const bedCode = enc.admission?.bed?.code || "S/L";
      const admittedAt = enc.admission?.admittedAt || enc.openedAt;
      const stayDays = Math.max(
        1,
        Math.ceil((Date.now() - new Date(admittedAt).getTime()) / (1000 * 60 * 60 * 24))
      );

      const latestVital = enc.vitalSigns[0] || null;
      const hasAnamnesis = enc.nursingAssessments.some((a) => a.status === "FINALIZADO");
      const hasEvolution = enc.evolutions.some((e) => e.status === "FINALIZADO");
      const hasDraft = enc.evolutions.some((e) => e.status === "RASCUNHO");
      const hasPrescription = enc.prescriptions.length > 0;

      // Contar itens fixos pendentes de checagem
      let patientPendingChecks = 0;
      for (const presc of enc.prescriptions) {
        for (const item of presc.items) {
          if (item.condition === "FIXO") {
            let hours: string[] = [];
            try {
              hours = JSON.parse(item.scheduledHours);
            } catch {
              hours = [];
            }
            const checkedCount = item.administrations.length;
            if (checkedCount < hours.length) {
              patientPendingChecks += hours.length - checkedCount;
            }
          }
        }
      }
      pendingChecksCount += patientPendingChecks;

      // Gerar alertas relevantes
      if (p.allergies.some((a) => a.severity === "GRAVE")) {
        alerts.push({
          id: `alg-${p.id}`,
          patientId: p.id,
          patientName: p.name,
          chartNumber: p.chartNumber,
          bedCode,
          severity: "ALTA",
          title: "Alergia Grave Registrada",
          description: user.capabilities.canViewClinicalPEP
            ? p.allergies.map((a) => `${a.substance} (${a.reaction})`).join("; ")
            : "Informação clínica protegida por perfil (LGPD)",
        });
      }

      if (latestVital && ((latestVital.sakFallScore ?? 0) >= 15 || (latestVital.bradenScore ?? 23) <= 14)) {
        alerts.push({
          id: `risk-${p.id}`,
          patientId: p.id,
          patientName: p.name,
          chartNumber: p.chartNumber,
          bedCode,
          severity: "MEDIA",
          title: "Alerta de Escala Assistencial (Braden / SAK)",
          description: `Braden: ${latestVital.bradenScore ?? "-"} | SAK Quedas: ${latestVital.sakFallScore ?? "-"}`,
        });
      }

      let riskConditions: string[] = [];
      try {
        riskConditions = JSON.parse(enc.riskConditions || "[]");
      } catch {
        riskConditions = [];
      }

      return {
        encounterId: enc.id,
        encounterNumber: enc.encounterNumber,
        patientId: p.id,
        name: p.name,
        birthDate: p.birthDate,
        sex: p.sex,
        chartNumber: p.chartNumber,
        unitCode: enc.unit.code,
        unitName: enc.unit.name,
        bedCode,
        admittedAt,
        estimatedDischargeAt: enc.admission?.estimatedDischargeAt || null,
        stayDays,
        status: enc.status,
        isolationPrecaution: enc.admission?.isolationPrecaution || "Padrão",
        mainDiagnosis: user.capabilities.canViewClinicalPEP
          ? `${enc.mainIcd10} — ${enc.mainDiagnosis}`
          : "Sigilo Clínico (Restrito a Profissionais Assistenciais)",
        riskConditions,
        allergiesCount: p.allergies.length,
        allergiesList: user.capabilities.canViewClinicalPEP
          ? p.allergies.map((a) => `${a.substance} (${a.severity})`)
          : [],
        hasAnamnesis,
        hasEvolution,
        hasDraft,
        hasPrescription,
        pendingChecks: patientPendingChecks,
        latestVital: user.capabilities.canViewClinicalPEP ? latestVital : null,
      };
    });

    // Ordenar lista pelo código do leito (padrão AGHUse Lista Paciente ENF)
    patientRows.sort((a, b) => a.bedCode.localeCompare(b.bedCode));

    return NextResponse.json({
      kpis: {
        admittedPatients: activeEncounters.length,
        activeEncounters: activeEncounters.length,
        totalBeds: allBeds.length,
        occupiedBeds,
        freeBeds,
        pendingClinicalRecords: pendingDraftsCount + pendingNursingDrafts,
        pendingCareActivities: pendingChecksCount,
        activeAlerts: alerts.length,
      },
      units: units.map((u) => ({
        id: u.id,
        code: u.code,
        name: u.name,
        floor: u.floor,
        specialty: u.specialty,
        activeAdmissions: u._count.admissions,
        totalBeds: u.beds.length,
        freeBeds: u.beds.filter((b) => b.status === "LIVRE").length,
        beds: u.beds,
      })),
      patients: patientRows,
      alerts,
    });
  } catch (error) {
    console.error("[DASHBOARD_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao carregar indicadores do dashboard hospitalar." },
      { status: 500 }
    );
  }
}

