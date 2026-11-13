import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { vitalSignsCreateSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "SINAIS_VITAIS");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    if (!user.capabilities.canRecordVitalSigns) {
      return NextResponse.json(
        { error: "Seu perfil não possui permissão para registrar controles e sinais vitais." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = vitalSignsCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Parâmetros de sinais vitais inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const record = await prisma.vitalSignRecord.create({
      data: {
        patientId,
        encounterId: d.encounterId,
        recordedById: user.id,
        systolicBP: d.systolicBP ?? null,
        diastolicBP: d.diastolicBP ?? null,
        heartRate: d.heartRate ?? null,
        respiratoryRate: d.respiratoryRate ?? null,
        temperature: d.temperature ?? null,
        spo2: d.spo2 ?? null,
        painScore: d.painScore ?? null,
        capillaryGlucose: d.capillaryGlucose ?? null,
        weightKg: d.weightKg ?? null,
        bradenScore: d.bradenScore ?? null,
        sakFallScore: d.sakFallScore ?? null,
        fluidIntakeMl: d.fluidIntakeMl ?? null,
        fluidOutputMl: d.fluidOutputMl ?? null,
        fluidDescription: d.fluidDescription ?? null,
        notes: d.notes ?? null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: d.encounterId,
      action: "CREATE_VITAL_SIGNS",
      module: "SINAIS_VITAIS",
      entityType: "VitalSignRecord",
      entityId: record.id,
      details: `Registrou controles/sinais vitais: PA ${d.systolicBP ?? "-"}/${d.diastolicBP ?? "-"} mmHg, FC ${d.heartRate ?? "-"} bpm, Tax ${d.temperature ?? "-"}°C, SpO2 ${d.spo2 ?? "-"}%.`,
    });

    return NextResponse.json({
      success: true,
      vitalSign: record,
      message: "Controles e sinais vitais registrados com sucesso.",
    });
  } catch (error) {
    console.error("[VITALS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao registrar sinais vitais." },
      { status: 500 }
    );
  }
}

