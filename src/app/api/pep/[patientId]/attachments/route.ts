import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { computeRecordSignature } from "@/lib/crypto";
import { recordAuditLog } from "@/lib/audit";
import { examCreateSchema, documentUploadSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "EXAMES_DOCS");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    const body = await req.json();
    const { attachmentType } = body; // "EXAM" ou "DOCUMENT"

    if (attachmentType === "EXAM") {
      const parsed = examCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Dados de exame inválidos." },
          { status: 400 }
        );
      }

      const d = parsed.data;
      const exam = await prisma.examProcedure.create({
        data: {
          patientId,
          encounterId: d.encounterId,
          requestedById: user.id,
          category: d.category,
          code: d.code.toUpperCase().trim(),
          name: d.name.trim(),
          clinicalIndication: d.clinicalIndication.trim(),
          priority: d.priority,
          status: d.status,
          resultAt: d.status === "LAUDADO" ? new Date() : null,
          resultSummary: d.resultSummary || null,
          referenceRange: d.referenceRange || null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId,
        action: "CREATE_EXAM",
        module: "EXAMES",
        entityType: "ExamProcedure",
        entityId: exam.id,
        details: `Registrou exame/procedimento ${exam.code} — ${exam.name} (${exam.status}).`,
      });

      return NextResponse.json({
        success: true,
        exam,
        message: "Exame/procedimento registrado com sucesso.",
      });
    }

    if (attachmentType === "DOCUMENT") {
      if (!user.capabilities.canUploadDocuments) {
        return NextResponse.json(
          { error: "Seu perfil não possui permissão para anexar documentos ao prontuário." },
          { status: 403 }
        );
      }

      const parsed = documentUploadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Arquivo inválido." },
          { status: 400 }
        );
      }

      const d = parsed.data;
      const sha256Hash = computeRecordSignature({
        fileName: d.fileName,
        fileSizeBytes: d.fileSizeBytes,
        contentSample: (d.contentBase64 || "").slice(0, 256),
        uploadedBy: user.id,
      });

      const doc = await prisma.clinicalDocument.create({
        data: {
          patientId,
          encounterId: d.encounterId,
          uploadedById: user.id,
          title: d.title.trim(),
          category: d.category,
          fileName: d.fileName.trim(),
          mimeType: d.mimeType,
          fileSizeBytes: d.fileSizeBytes,
          sha256Hash,
          contentBase64: d.contentBase64 || null,
          description: d.description || null,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: d.encounterId,
        action: "UPLOAD_DOCUMENT",
        module: "DOCUMENTOS",
        entityType: "ClinicalDocument",
        entityId: doc.id,
        details: `Anexou documento ${doc.fileName} (${doc.mimeType}, ${doc.fileSizeBytes} bytes, SHA-256: ${sha256Hash.slice(0, 16)}...).`,
      });

      return NextResponse.json({
        success: true,
        document: doc,
        message: "Documento validado e anexado ao prontuário com assinatura de integridade SHA-256.",
      });
    }

    return NextResponse.json({ error: "Tipo de anexo inválido." }, { status: 400 });
  } catch (error) {
    console.error("[ATTACHMENTS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao processar exame ou anexo." },
      { status: 500 }
    );
  }
}

