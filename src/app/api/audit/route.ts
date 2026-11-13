import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get("module") || "";
    const actionFilter = searchParams.get("action") || "";

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(moduleFilter ? { module: moduleFilter } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[AUDIT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao consultar trilha de auditoria." },
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

    const body = await req.json();
    const { patientId, encounterId, details, action = "EXPORT_PDF" } = body;

    const entry = await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId: patientId || null,
      encounterId: encounterId || null,
      action,
      module: "RELATORIOS_PDF",
      details: details || "Exportação / Impressão identificada de Prontuário Eletrônico em PDF.",
    });

    return NextResponse.json({ success: true, entry });
  } catch {
    return NextResponse.json({ error: "Falha ao registrar auditoria." }, { status: 500 });
  }
}

