import { prisma } from "./db";

export interface AuditInput {
  userId?: string | null;
  userName: string;
  userRole: string;
  patientId?: string | null;
  encounterId?: string | null;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

export async function recordAuditLog(input: AuditInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        userName: input.userName,
        userRole: input.userRole,
        patientId: input.patientId ?? null,
        encounterId: input.encounterId ?? null,
        action: input.action,
        module: input.module,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        details: input.details,
        ipAddress: input.ipAddress ?? "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("[AUDIT_LOG_ERROR]", err);
    return null;
  }
}

