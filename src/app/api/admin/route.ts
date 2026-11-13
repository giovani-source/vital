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
      orderBy: [{ active: "asc" }, { createdAt: "desc" }],
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
        createdAt: u.createdAt,
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
        { error: "Apenas o Administrador (ADM) pode gerenciar perfis, liberações e unidades." },
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
        active = true,
      } = body;

      if (!username || !email || !name || !password || !role) {
        return NextResponse.json(
          { error: "Preencha todos os campos obrigatórios do usuário." },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { username: String(username).trim().toLowerCase() },
            { email: String(email).trim().toLowerCase() },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Já existe um usuário cadastrado com este login ou e-mail." },
          { status: 409 }
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
          active: Boolean(active),
          ...(councilType && councilNumber
            ? {
                professional: {
                  create: {
                    category: String(role),
                    councilType: String(councilType).toUpperCase(),
                    councilNumber: String(councilNumber),
                    councilState: String(councilState).toUpperCase(),
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
        details: `Cadastrou e liberou profissional/usuário ${created.name} (${created.role}).`,
      });

      return NextResponse.json({ success: true, createdUser: created });
    }

    if (action === "APPROVE_USER" && body.targetUserId) {
      const target = await prisma.user.findUnique({ where: { id: body.targetUserId } });
      if (!target) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
      }

      const newRole = body.role ? String(body.role) : target.role;

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: {
          active: true,
          role: newRole,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "APPROVE_USER",
        module: "ADMIN",
        entityType: "User",
        entityId: updated.id,
        details: `ADM liberou/aprovou o acesso de ${updated.name} com o perfil ${updated.role}.`,
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "UPDATE_USER_ROLE" && body.targetUserId && body.role) {
      const target = await prisma.user.findUnique({ where: { id: body.targetUserId } });
      if (!target) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: { role: String(body.role) },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "UPDATE_USER_ROLE",
        module: "ADMIN",
        entityType: "User",
        entityId: updated.id,
        details: `ADM alterou o perfil profissional de ${updated.name} para ${updated.role}.`,
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "RESET_USER_PASSWORD" && body.targetUserId && body.newPassword) {
      const { hash, salt } = hashPassword(String(body.newPassword));
      const updated = await prisma.user.update({
        where: { id: String(body.targetUserId) },
        data: {
          passwordHash: hash,
          passwordSalt: salt,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "RESET_USER_PASSWORD",
        module: "ADMIN",
        entityType: "User",
        entityId: updated.id,
        details: `ADM redefiniu a senha de acesso de ${updated.name}.`,
      });

      return NextResponse.json({ success: true });
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
        details: `Alterou status da conta de ${updated.name} para ${updated.active ? "ATIVO (Liberado)" : "BLOQUEADO / AGUARDANDO LIBERAÇÃO"}.`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "DELETE_USER" && body.targetUserId) {
      if (body.targetUserId === user.id) {
        return NextResponse.json(
          { error: "Você não pode excluir sua própria conta de Administrador em uso." },
          { status: 400 }
        );
      }
      const target = await prisma.user.findUnique({ where: { id: body.targetUserId } });
      if (!target) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
      }

      await prisma.session.deleteMany({ where: { userId: target.id } });
      await prisma.professionalProfile.deleteMany({ where: { userId: target.id } });
      await prisma.user.delete({ where: { id: target.id } });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "DELETE_USER",
        module: "ADMIN",
        entityType: "User",
        entityId: target.id,
        details: `Removeu cadastro de ${target.name} (${target.username}).`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_UNIT") {
      const { code, name, floor, specialty } = body;
      if (!code || !name) {
        return NextResponse.json(
          { error: "Informe o código e o nome da unidade hospitalar." },
          { status: 400 }
        );
      }

      const createdUnit = await prisma.hospitalUnit.create({
        data: {
          institutionId: user.institutionId,
          code: String(code).trim().toUpperCase(),
          name: String(name).trim(),
          floor: String(floor || "1º Andar").trim(),
          specialty: String(specialty || "Clínica Geral").trim(),
        },
      });

      return NextResponse.json({ success: true, unit: createdUnit });
    }

    if (action === "CREATE_BED") {
      const { unitId, code, room, type = "ENFERMARIA" } = body;
      if (!unitId || !code) {
        return NextResponse.json(
          { error: "Selecione a unidade e informe o código do leito." },
          { status: 400 }
        );
      }

      const createdBed = await prisma.bed.create({
        data: {
          unitId: String(unitId),
          code: String(code).trim().toUpperCase(),
          room: String(room || `Quarto ${code}`).trim(),
          type: String(type),
          status: "DISPONIVEL",
        },
      });

      return NextResponse.json({ success: true, bed: createdBed });
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
