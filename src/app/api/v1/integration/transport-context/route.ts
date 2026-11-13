import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

/**
 * Arquitetura para Expansão (Seção 10):
 * Endpoint REST autenticado e desacoplado para futura integração com o Módulo/App
 * de Transporte Interno de Pacientes (solicitação, distribuição de maqueiros/equipe,
 * origem/destino e precauções de transporte), compartilhando apenas os pacientes
 * e atendimentos ativos autorizados, sem expor evoluções clínicas sigilosas.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autenticação necessária para consumir a API de integração hospitalar." },
        { status: 401 }
      );
    }

    const activeEncounters = await prisma.encounter.findMany({
      where: { status: "EM_ANDAMENTO" },
      include: {
        patient: {
          select: {
            id: true,
            chartNumber: true,
            name: true,
            birthDate: true,
            sex: true,
            allergies: {
              where: { active: true },
              select: { substance: true, severity: true },
            },
          },
        },
        unit: {
          select: { id: true, code: true, name: true, floor: true },
        },
        admission: {
          include: {
            bed: {
              select: { id: true, code: true, room: true, type: true, features: true },
            },
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: "desc" },
          take: 1,
          select: {
            spo2: true,
            sakFallScore: true,
            bradenScore: true,
            recordedAt: true,
          },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    const destinationSectors = [
      { code: "IMG-RX", name: "Centro de Diagnóstico por Imagem — Raio-X / Tomografia", floor: "1º Andar" },
      { code: "BLOCO-CIR", name: "Centro Cirúrgico Central", floor: "4º Andar" },
      { code: "HEMOD", name: "Unidade de Hemodinâmica e Endoscopia", floor: "2º Andar" },
      { code: "UTI-AD", name: "UTI Adulto Central", floor: "3º Andar" },
    ];

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "INTEGRATION_API_READ",
      module: "INTEGRACAO_TRANSPORTE",
      details: "Consulta autenticada ao contrato REST /api/v1/integration/transport-context.",
    });

    return NextResponse.json({
      schemaVersion: "1.0.0",
      integrationModule: "INTERNAL_PATIENT_TRANSPORT_READY",
      timestamp: new Date().toISOString(),
      institution: user.institutionName,
      availableDestinationSectors: destinationSectors,
      eligiblePatientsForTransport: activeEncounters.map((enc) => {
        let risks: string[] = [];
        try {
          risks = JSON.parse(enc.riskConditions || "[]");
        } catch {
          risks = [];
        }
        return {
          patientId: enc.patient.id,
          chartNumber: enc.patient.chartNumber,
          patientName: enc.patient.name,
          birthDate: enc.patient.birthDate,
          sex: enc.patient.sex,
          encounterId: enc.id,
          encounterNumber: enc.encounterNumber,
          originUnit: enc.unit,
          originBed: enc.admission?.bed || null,
          isolationPrecaution: enc.admission?.isolationPrecaution || "Padrão",
          riskAlerts: risks,
          hasSevereAllergy: enc.patient.allergies.some((a) => a.severity === "GRAVE"),
          latestMobilityAndSpo2: enc.vitalSigns[0] || null,
        };
      }),
    });
  } catch (error) {
    console.error("[TRANSPORT_CONTEXT_API_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao consultar contexto de integração para transporte." },
      { status: 500 }
    );
  }
}

