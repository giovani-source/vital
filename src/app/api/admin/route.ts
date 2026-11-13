import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        professional: true,
        institution: true,
      },
      orderBy: { name: "asc" },
    });

    const units = await prisma.hospitalUnit.findMany({
      include: {
        beds: { orderBy: { code: "asc" } },
      },
      orderBy: { code: "asc" },
    });

    const permissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
        failedLoginAttempts: u.failedLoginAttempts,
        lockedUntil: u.lockedUntil,
        lastLoginAt: u.lastLoginAt,
        professional: u.professional,
      })),
      units,
      permissions,
    });
  } catch (error) {
    console.error("[ADMIN_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao carregar painel administrativo." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!user.capabilities.canManageUsersAndUnits) {
      return NextResponse.json(
        { error: "Apenas o Administrador Hospitalar pode gerenciar usuários e unidades." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_USER") {
      const {
        username,
        email,
        name,
        password,
        role,
        councilType,
        councilNumber,
        councilState = "RS",
        specialty = "Assistência Hospitalar",
      } = body;

      if (!username || !email || !name || !password || !role) {
        return NextResponse.json(
          { error: "Preencha todos os campos obrigatórios do usuário." },
          { status: 400 }
        );
      }

      const { hash, salt } = hashPassword(String(password));

      const created = await prisma.user.create({
        data: {
          institutionId: user.institutionId,
          username: String(username).trim().toLowerCase(),
          email: String(email).trim().toLowerCase(),
          name: String(name).trim(),
          passwordHash: hash,
          passwordSalt: salt,
          role: String(role),
          ...(role !== "ADMIN" && councilType && councilNumber
            ? {
                professional: {
                  create: {
                    category: String(role),
                    councilType: String(councilType),
                    councilNumber: String(councilNumber),
                    councilState: String(councilState),
                    specialty: String(specialty),
                  },
                },
              }
            : {}),
        },
        include: { professional: true },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "CREATE_USER",
        module: "ADMIN",
        entityType: "User",
        entityId: created.id,
        details: `Cadastrou profissional/usuário ${created.name} (${created.role}).`,
      });

      return NextResponse.json({ success: true, createdUser: created });
    }

    if (action === "TOGGLE_USER_STATUS" && body.targetUserId) {
      const target = await prisma.user.findUnique({ where: { id: body.targetUserId } });
      if (!target) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: {
          active: !target.active,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "UPDATE_USER_STATUS",
        module: "ADMIN",
        entityType: "User",
        entityId: updated.id,
        details: `Alterou status da conta de ${updated.name} para ${updated.active ? "ATIVO (Desbloqueado)" : "INATIVO"}.`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "UPDATE_BED_STATUS" && body.bedId && body.status) {
      const updatedBed = await prisma.bed.update({
        where: { id: body.bedId },
        data: { status: String(body.status) },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "UPDATE_BED_STATUS",
        module: "ADMIN",
        entityType: "Bed",
        entityId: updatedBed.id,
        details: `Atualizou status operacional do leito ${updatedBed.code} para ${updatedBed.status}.`,
      });

      return NextResponse.json({ success: true, bed: updatedBed });
    }

    return NextResponse.json({ error: "Ação administrativa inválida." }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao executar operação administrativa." },
      { status: 500 }
    );
  }
}

