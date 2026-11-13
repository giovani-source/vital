import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { recordAuditLog } from "@/lib/audit";

const ALLOWED_SIGNUP_ROLES = new Set([
  "MEDICO",
  "ENFERMEIRO",
  "TECNICO_ENFERMAGEM",
  "FISIOTERAPEUTA",
  "OUTRO_ASSISTENCIAL",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      username,
      email,
      password,
      role,
      councilType,
      councilNumber,
      councilState = "RS",
      specialty = "Assistência Hospitalar",
    } = body;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Preencha nome completo, usuário, e-mail, senha e perfil profissional." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "A senha deve possuir no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const safeRole = ALLOWED_SIGNUP_ROLES.has(String(role))
      ? String(role)
      : "OUTRO_ASSISTENCIAL";

    if (!councilType || !councilNumber) {
      return NextResponse.json(
        { error: "Informe o conselho profissional (ex.: CRM, COREN, CREFITO) e o número do registro." },
        { status: 400 }
      );
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um cadastro com este nome de usuário ou e-mail." },
        { status: 409 }
      );
    }

    let institution = await prisma.institution.findFirst();
    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: "Hospital Geral — Sistema PEP",
          ShortName: "HOSP-PEP",
          cnes: "2237601",
          cnpj: "87.123.456/0001-90",
          city: "Porto Alegre",
          state: "RS",
        },
      });
    }

    const { hash, salt } = hashPassword(String(password));

    const created = await prisma.user.create({
      data: {
        institutionId: institution.id,
        username: normalizedUsername,
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: safeRole,
        active: false, // Criado pendente de liberação pelo ADM
        professional: {
          create: {
            category: safeRole,
            councilType: String(councilType).trim().toUpperCase(),
            councilNumber: String(councilNumber).trim(),
            councilState: String(councilState).trim().toUpperCase(),
            specialty: String(specialty).trim() || "Assistência Hospitalar",
          },
        },
      },
      include: {
        professional: true,
      },
    });

    await recordAuditLog({
      userId: created.id,
      userName: created.name,
      userRole: created.role,
      action: "USER_SIGNUP_PENDING",
      module: "AUTH",
      entityType: "User",
      entityId: created.id,
      details: `Solicitou criação de perfil profissional (${created.role} - ${councilType}/${councilState} ${councilNumber}). Aguardando liberação pelo ADM.`,
    });

    return NextResponse.json({
      success: true,
      message:
        "Perfil profissional criado com sucesso! Seu acesso está aguardando liberação pelo Administrador (ADM).",
      user: {
        id: created.id,
        name: created.name,
        username: created.username,
        email: created.email,
        role: created.role,
        active: created.active,
      },
    });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação de cadastro profissional." },
      { status: 500 }
    );
  }
}

