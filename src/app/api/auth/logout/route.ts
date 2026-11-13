import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getSessionUser();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }

    if (user) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "LOGOUT",
        module: "AUTH",
        details: "Sessão encerrada manualmente pelo usuário.",
      });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  } catch {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }
}

