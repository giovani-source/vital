import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSignedSessionToken } from "@/lib/crypto";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieDurationSeconds,
  getSessionExpiryDate,
} from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { loginSchema } from "@/lib/validations";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados de login inválidos." },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const normalized = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: normalized }, { email: normalized }],
      },
      include: {
        professional: true,
        institution: true,
      },
    });

    if (!user) {
      await recordAuditLog({
        userName: normalized,
        userRole: "DESCONHECIDO",
        action: "LOGIN_FAILED",
        module: "AUTH",
        details: `Tentativa de login com identificador inexistente (${normalized}).`,
      });
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique seu identificador e senha." },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        {
          error:
            "Seu perfil profissional aguarda liberação pelo Administrador (ADM). Acesse com o perfil ADM em 'Gestão & Permissões' para aprovar este acesso.",
        },
        { status: 403 }
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "LOGIN_BLOCKED",
        module: "AUTH",
        details: `Tentativa de login durante bloqueio temporário de segurança (${minutesLeft} min restantes).`,
      });
      return NextResponse.json(
        {
          error: `Conta temporariamente bloqueada por tentativas excessivas. Tente novamente em ${minutesLeft} minuto(s) ou solicite desbloqueio ao ADM.`,
        },
        { status: 429 }
      );
    }

    const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);

    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "LOGIN_FAILED",
        module: "AUTH",
        details: shouldLock
          ? `Senha incorreta (${attempts}/${MAX_FAILED_ATTEMPTS}). Conta bloqueada temporariamente por 15 minutos.`
          : `Senha incorreta (tentativa ${attempts}/${MAX_FAILED_ATTEMPTS}).`,
      });

      return NextResponse.json(
        {
          error: shouldLock
            ? "Conta bloqueada por 15 minutos após 5 tentativas inválidas consecutivas."
            : `Credenciais inválidas. Tentativa ${attempts} de ${MAX_FAILED_ATTEMPTS}.`,
        },
        { status: 401 }
      );
    }

    const expiresAt = getSessionExpiryDate();
    const token = createSignedSessionToken(user.id, expiresAt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent") || "Navegador Web Hospitalar",
        expiresAt,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LOGIN_SUCCESS",
      module: "AUTH",
      details: `Sessão iniciada com sucesso (${user.professional ? `${user.professional.councilType}-${user.professional.councilState} ${user.professional.councilNumber}` : user.role}).`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionName: user.institution.name,
        professional: user.professional,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getSessionCookieDurationSeconds(),
    });

    return response;
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno ao processar autenticação." },
      { status: 500 }
    );
  }
}
