import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateSecureToken } from "@/lib/crypto";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, identifier, recoveryToken, newPassword } = body;

    if (action === "REQUEST_TOKEN") {
      const normalized = String(identifier || "").trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: { OR: [{ username: normalized }, { email: normalized }] },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuário ou e-mail institucional não localizado." },
          { status: 404 }
        );
      }

      const token = generateSecureToken(4).toUpperCase(); // Código de 8 caracteres para demonstração local
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          recoveryToken: token,
          recoveryExpiresAt: expires,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "PASSWORD_RECOVERY_REQUESTED",
        module: "AUTH",
        details: `Solicitação de recuperação de acesso gerada para ${user.email}.`,
      });

      return NextResponse.json({
        success: true,
        message: "Código de recuperação gerado e registrado com validade de 15 minutos.",
        demoRecoveryToken: token,
      });
    }

    if (action === "RESET_PASSWORD") {
      if (!recoveryToken || !newPassword || String(newPassword).length < 6) {
        return NextResponse.json(
          { error: "Informe o código de validação e uma nova senha com no mínimo 6 caracteres." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findFirst({
        where: {
          recoveryToken: String(recoveryToken).trim().toUpperCase(),
        },
      });

      if (!user || !user.recoveryExpiresAt || user.recoveryExpiresAt < new Date()) {
        return NextResponse.json(
          { error: "Código de recuperação inválido ou expirado." },
          { status: 400 }
        );
      }

      const { hash, salt } = hashPassword(String(newPassword));
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hash,
          passwordSalt: salt,
          recoveryToken: null,
          recoveryExpiresAt: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "PASSWORD_RESET_COMPLETED",
        module: "AUTH",
        details: `Senha redefinida e conta desbloqueada via fluxo de recuperação de acesso.`,
      });

      return NextResponse.json({
        success: true,
        message: "Senha atualizada com sucesso. Você já pode realizar login.",
      });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("[RECOVERY_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao processar recuperação de acesso." },
      { status: 500 }
    );
  }
}

