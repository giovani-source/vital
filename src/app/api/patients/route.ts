import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { patientCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    const patients = await prisma.patient.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { chartNumber: { contains: q } },
              { cpf: { contains: q } },
              { cns: { contains: q } },
            ],
          }
        : undefined,
      include: {
        allergies: { where: { active: true } },
        diagnoses: { where: { status: "ATIVO" } },
        encounters: {
          orderBy: { openedAt: "desc" },
          include: {
            unit: true,
            admission: { include: { bed: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const units = await prisma.hospitalUnit.findMany({
      include: {
        beds: {
          orderBy: { code: "asc" },
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({
      patients: patients.map((p) => ({
        ...p,
        clinicalHistory: user.capabilities.canViewClinicalPEP ? p.clinicalHistory : "Restrito (LGPD)",
        personalAntecedents: user.capabilities.canViewClinicalPEP ? p.personalAntecedents : "Restrito (LGPD)",
        continuousMedications: user.capabilities.canViewClinicalPEP ? p.continuousMedications : "Restrito (LGPD)",
      })),
      units,
    });
  } catch (error) {
    console.error("[PATIENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Erro ao consultar pacientes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!user.capabilities.canRegisterPatient) {
      return NextResponse.json(
        { error: "Seu perfil não possui permissão para cadastrar novos pacientes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = patientCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados cadastrais inválidos." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar duplicidade de prontuário ou CPF
    const existing = await prisma.patient.findFirst({
      where: {
        OR: [
          { chartNumber: data.chartNumber.trim() },
          ...(data.cpf ? [{ cpf: data.cpf.trim() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um paciente cadastrado com este número de prontuário ou CPF." },
        { status: 409 }
      );
    }

    const createdPatient = await prisma.patient.create({
      data: {
        institutionId: user.institutionId,
        chartNumber: data.chartNumber.trim(),
        name: data.name.trim().toUpperCase(),
        socialName: data.socialName || null,
        birthDate: new Date(data.birthDate),
        sex: data.sex,
        skinColor: data.skinColor,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        educationLevel: data.educationLevel,
        birthPlace: data.birthPlace,
        city: data.city,
        state: data.state,
        religion: data.religion || null,
        cpf: data.cpf?.trim() || null,
        cns: data.cns?.trim() || null,
        phone: data.phone || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyRelationship: data.emergencyRelationship || null,
        emergencyPhone: data.emergencyPhone || null,
        bloodType: data.bloodType || "O+",
        clinicalHistory: data.clinicalHistory || null,
        personalAntecedents: data.personalAntecedents || null,
        familyAntecedents: data.familyAntecedents || null,
        continuousMedications: data.continuousMedications || null,
        transfusionHistory: data.transfusionHistory,
      },
    });

    let createdEncounter = null;
    if (data.createAdmission && data.unitId && data.bedId) {
      const encounterNumber = `ATD-2026-${Math.floor(10000 + Math.random() * 89999)}`;
      createdEncounter = await prisma.encounter.create({
        data: {
          encounterNumber,
          patientId: createdPatient.id,
          unitId: data.unitId,
          type: "INTERNACAO",
          status: "EM_ANDAMENTO",
          mainDiagnosis: data.mainDiagnosis || "Em investigação diagnóstica hospitalar",
          mainIcd10: data.mainIcd10 || "R69",
          reasonForAdmission: data.reasonForAdmission || "Admissão hospitalar para investigação e tratamento clínico",
          riskConditions: JSON.stringify(["QUEDA"]),
          admission: {
            create: {
              patientId: createdPatient.id,
              unitId: data.unitId,
              bedId: data.bedId,
              origin: "Admissão Direta",
              accompanyingPerson: data.emergencyContactName || null,
              accompanyingRelation: data.emergencyRelationship || null,
              status: "ATIVA",
            },
          },
        },
      });

      await prisma.bed.update({
        where: { id: data.bedId },
        data: { status: "OCUPADO" },
      });
    }

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId: createdPatient.id,
      encounterId: createdEncounter?.id ?? null,
      action: "CREATE_PATIENT",
      module: "PACIENTES",
      entityType: "Patient",
      entityId: createdPatient.id,
      details: `Cadastrou paciente ${createdPatient.name} (Prontuário ${createdPatient.chartNumber})${createdEncounter ? ` com internação ${createdEncounter.encounterNumber}` : ""}.`,
    });

    return NextResponse.json({
      success: true,
      patient: createdPatient,
      encounter: createdEncounter,
    });
  } catch (error) {
    console.error("[PATIENT_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar paciente." },
      { status: 500 }
    );
  }
}

