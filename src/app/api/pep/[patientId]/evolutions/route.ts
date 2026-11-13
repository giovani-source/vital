import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinicalAccess } from "@/lib/auth";
import { canWriteEvolutionCategory } from "@/lib/rbac";
import { computeRecordSignature } from "@/lib/crypto";
import { recordAuditLog } from "@/lib/audit";
import { evolutionSaveSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;
    const authResult = await requireClinicalAccess(patientId, "EVOLUCAO");
    if ("errorResponse" in authResult) return authResult.errorResponse;
    const { user } = authResult;

    const body = await req.json();
    const parsed = evolutionSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados de evolução inválidos." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar permissão por categoria profissional
    if (!canWriteEvolutionCategory(user.role, data.category)) {
      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: data.encounterId,
        action: "ACCESS_DENIED",
        module: "EVOLUCAO",
        details: `Bloqueio RBAC: Perfil ${user.role} tentou registrar categoria ${data.category} sem habilitação legal.`,
      });
      return NextResponse.json(
        {
          error: `Seu perfil (${user.capabilities.label}) não possui autorização para registrar ${data.category.replace(/_/g, " ")}.`,
        },
        { status: 403 }
      );
    }

    // Caso seja um Adendo / Retificação de um registro já finalizado
    if (data.isAddendum && data.parentRecordId) {
      const parent = await prisma.clinicalEvolution.findUnique({
        where: { id: data.parentRecordId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Registro original para retificação/adendo não encontrado." },
          { status: 404 }
        );
      }
      if (parent.status !== "FINALIZADO") {
        return NextResponse.json(
          { error: "Apenas registros já finalizados recebem adendos/retificações." },
          { status: 400 }
        );
      }
      if (!data.addendumReason || data.addendumReason.trim().length < 5) {
        return NextResponse.json(
          { error: "Informe a justificativa da retificação/adendo (mínimo 5 caracteres)." },
          { status: 400 }
        );
      }

      const now = new Date();
      const sig = computeRecordSignature({
        patientId,
        parentRecordId: parent.id,
        authorId: user.id,
        addendumReason: data.addendumReason,
        ts: now.toISOString(),
      });

      const addendum = await prisma.clinicalEvolution.create({
        data: {
          patientId,
          encounterId: data.encounterId,
          authorId: user.id,
          category: data.category,
          format: data.format,
          title: data.title,
          subjective: data.subjective || null,
          objective: data.objective || null,
          impression: data.impression || null,
          conduct: data.conduct || null,
          freeText: data.freeText || null,
          status: "FINALIZADO",
          version: parent.version + 1,
          isAddendum: true,
          addendumReason: data.addendumReason.trim(),
          parentRecordId: parent.id,
          lastSavedAt: now,
          finalizedAt: now,
          signatureHash: sig,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: data.encounterId,
        action: "CREATE_ADDENDUM",
        module: "EVOLUCAO",
        entityType: "ClinicalEvolution",
        entityId: addendum.id,
        details: `Registrou Adendo/Retificação ao documento ${parent.id}. Motivo: ${data.addendumReason}`,
      });

      return NextResponse.json({
        success: true,
        evolution: addendum,
        message: "Adendo / Retificação auditável registrado com sucesso, mantendo o histórico original.",
      });
    }

    // Se enviou ID existente, verificar se é um rascunho pertencente ao próprio usuário
    if (data.id) {
      const existing = await prisma.clinicalEvolution.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });
      }

      if (existing.status === "FINALIZADO") {
        await recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          patientId,
          encounterId: data.encounterId,
          action: "IMMUTABILITY_BLOCKED",
          module: "EVOLUCAO",
          entityType: "ClinicalEvolution",
          entityId: existing.id,
          details: "Tentativa bloqueada de alterar registro clínico já finalizado (Imutabilidade PEP).",
        });
        return NextResponse.json(
          {
            error:
              "Registros finalizados são imutáveis e não podem ser editados ou excluídos. Utilize a opção de Adendo / Retificação.",
          },
          { status: 409 }
        );
      }

      if (existing.authorId !== user.id) {
        return NextResponse.json(
          { error: "Apenas o próprio autor pode editar seu rascunho em andamento." },
          { status: 403 }
        );
      }

      const now = new Date();
      const isFinalizing = Boolean(data.finalize);
      const sig = isFinalizing
        ? computeRecordSignature({
            id: existing.id,
            patientId,
            authorId: user.id,
            title: data.title,
            ts: now.toISOString(),
          })
        : null;

      const updated = await prisma.clinicalEvolution.update({
        where: { id: existing.id },
        data: {
          category: data.category,
          format: data.format,
          title: data.title,
          subjective: data.subjective || null,
          objective: data.objective || null,
          impression: data.impression || null,
          conduct: data.conduct || null,
          freeText: data.freeText || null,
          status: isFinalizing ? "FINALIZADO" : "RASCUNHO",
          lastSavedAt: now,
          finalizedAt: isFinalizing ? now : null,
          signatureHash: sig,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        encounterId: data.encounterId,
        action: isFinalizing ? "FINALIZE_RECORD" : "UPDATE_DRAFT",
        module: "EVOLUCAO",
        entityType: "ClinicalEvolution",
        entityId: updated.id,
        details: isFinalizing
          ? `Finalizou e assinou eletronicamente ${updated.title} (${updated.category}).`
          : `Salvou rascunho de evolução (${updated.title}).`,
      });

      return NextResponse.json({
        success: true,
        evolution: updated,
        message: isFinalizing
          ? "Evolução clínica finalizada e integrada à linha do tempo."
          : "Rascunho salvo com sucesso.",
      });
    }

    // Criação de novo rascunho ou registro finalizado direto
    const now = new Date();
    const isFinalizing = Boolean(data.finalize);
    const sig = isFinalizing
      ? computeRecordSignature({
          patientId,
          authorId: user.id,
          title: data.title,
          ts: now.toISOString(),
        })
      : null;

    const created = await prisma.clinicalEvolution.create({
      data: {
        patientId,
        encounterId: data.encounterId,
        authorId: user.id,
        category: data.category,
        format: data.format,
        title: data.title,
        subjective: data.subjective || null,
        objective: data.objective || null,
        impression: data.impression || null,
        conduct: data.conduct || null,
        freeText: data.freeText || null,
        status: isFinalizing ? "FINALIZADO" : "RASCUNHO",
        version: 1,
        lastSavedAt: now,
        finalizedAt: isFinalizing ? now : null,
        signatureHash: sig,
      },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      patientId,
      encounterId: data.encounterId,
      action: isFinalizing ? "FINALIZE_RECORD" : "CREATE_DRAFT",
      module: "EVOLUCAO",
      entityType: "ClinicalEvolution",
      entityId: created.id,
      details: isFinalizing
        ? `Registrou e finalizou ${created.title} (${created.category}).`
        : `Criou rascunho de evolução (${created.title}).`,
    });

    return NextResponse.json({
      success: true,
      evolution: created,
      message: isFinalizing
        ? "Evolução clínica finalizada com sucesso."
        : "Rascunho salvo automaticamente no servidor.",
    });
  } catch (error) {
    console.error("[EVOLUTION_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao salvar registro de evolução clínica." },
      { status: 500 }
    );
  }
}

