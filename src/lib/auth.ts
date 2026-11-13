import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import { verifySignedSessionToken } from "./crypto";
import { getRoleCapabilities, RoleCapabilities } from "./rbac";
import { recordAuditLog } from "./audit";

export const SESSION_COOKIE_NAME = "pep_session_token";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 horas (plantão hospitalar)

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  institutionId: string;
  institutionName: string;
  professional: {
    category: string;
    councilType: string;
    councilNumber: string;
    councilState: string;
    specialty: string;
  } | null;
  capabilities: RoleCapabilities;
}

export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    return await getSessionUserByToken(token);
  } catch {
    return null;
  }
}

export async function getSessionUserByToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          professional: true,
          institution: true,
        },
      },
    },
  });

  if (session) {
    if (session.expiresAt < new Date() || !session.user.active) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
      return null;
    }

    const u = session.user;
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      role: u.role,
      institutionId: u.institutionId,
      institutionName: u.institution.name,
      professional: u.professional
        ? {
            category: u.professional.category,
            councilType: u.professional.councilType,
            councilNumber: u.professional.councilNumber,
            councilState: u.professional.councilState,
            specialty: u.professional.specialty,
          }
        : null,
      capabilities: getRoleCapabilities(u.role),
    };
  }

  // Fallback para ambientes Serverless multi-instância (ex.: Vercel) com token assinado HMAC-SHA256
  const verified = verifySignedSessionToken(token);
  if (!verified) return null;

  const u = await prisma.user.findUnique({
    where: { id: verified.userId },
    include: {
      professional: true,
      institution: true,
    },
  });

  if (!u || !u.active) return null;

  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    institutionId: u.institutionId,
    institutionName: u.institution.name,
    professional: u.professional
      ? {
          category: u.professional.category,
          councilType: u.professional.councilType,
          councilNumber: u.professional.councilNumber,
          councilState: u.professional.councilState,
          specialty: u.professional.specialty,
        }
      : null,
    capabilities: getRoleCapabilities(u.role),
  };
}

export function getSessionCookieDurationSeconds(): number {
  return Math.floor(SESSION_DURATION_MS / 1000);
}

export function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function requireClinicalAccess(
  patientId?: string,
  moduleName = "PEP"
): Promise<{ user: AuthenticatedUser } | { errorResponse: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Sessão expirada ou usuário não autenticado." },
        { status: 401 }
      ),
    };
  }

  if (!user.capabilities.canViewClinicalPEP) {
    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId: patientId ?? null,
      action: "ACCESS_DENIED",
      module: moduleName,
      details: `Bloqueio RBAC: Perfil ${user.role} tentou acessar informações clínicas sigilosas sem autorização assistencial.`,
    });
    return {
      errorResponse: NextResponse.json(
        {
          error:
            "Acesso negado: O perfil de Administrador gerencia usuários e unidades, mas não possui autorização para visualizar informações clínicas sigilosas do prontuário (LGPD / CFM / SBIS).",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

