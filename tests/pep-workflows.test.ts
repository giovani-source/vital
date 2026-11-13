import { describe, it, expect } from "vitest";
import { prisma } from "../src/lib/db";
import { verifyPassword, hashPassword, computeRecordSignature } from "../src/lib/crypto";
import {
  getRoleCapabilities,
  canWriteEvolutionCategory,
} from "../src/lib/rbac";
import {
  evolutionSaveSchema,
  nursingProcessPlanSchema,
  medicationCheckSchema,
} from "../src/lib/validations";

describe("HospVita PEP — Validação Técnica de Fluxos Clínicos, Banco de Dados e RBAC", () => {
  it("1. Verifica criptografia de senhas (PBKDF2-SHA512) e ausência de senhas em texto puro no banco", async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThanOrEqual(6);

    for (const u of users) {
      expect(u.passwordHash).not.toBe("Hosp@2026");
      expect(u.passwordHash.length).toBe(128);
      expect(u.passwordSalt.length).toBeGreaterThanOrEqual(16);
      expect(verifyPassword("Hosp@2026", u.passwordHash, u.passwordSalt)).toBe(true);
      expect(verifyPassword("SenhaErrada", u.passwordHash, u.passwordSalt)).toBe(false);
    }
  });

  it("2. Verifica regras de RBAC (COFEN 736/2024, Lei do Exercício Profissional e Sigilo LGPD)", () => {
    const adminCap = getRoleCapabilities("ADMIN");
    const enfCap = getRoleCapabilities("ENFERMEIRO");
    const tecCap = getRoleCapabilities("TECNICO_ENFERMAGEM");
    const medCap = getRoleCapabilities("MEDICO");

    // Admin NÃO possui autorização automática para ver informações clínicas sigilosas
    expect(adminCap.canViewClinicalPEP).toBe(false);
    expect(adminCap.canManageUsersAndUnits).toBe(true);

    // Enfermeiro realiza Avaliação, Diagnóstico e Prescrição de Enfermagem (COFEN 736/2024)
    expect(enfCap.canViewClinicalPEP).toBe(true);
    expect(enfCap.canPerformNursingAssessment).toBe(true);
    expect(enfCap.canPrescribeNursingDiagnosisAndPlan).toBe(true);
    expect(canWriteEvolutionCategory("ENFERMEIRO", "EVOLUCAO_ENFERMAGEM")).toBe(true);
    expect(canWriteEvolutionCategory("ENFERMEIRO", "EVOLUCAO_MEDICA")).toBe(false);

    // Técnico de Enfermagem realiza anotações e checagens, mas NÃO diagnósticos/prescrições privativos do Enfermeiro
    expect(tecCap.canViewClinicalPEP).toBe(true);
    expect(tecCap.canWriteTechNursingNote).toBe(true);
    expect(tecCap.canCheckMedicationsAndCare).toBe(true);
    expect(tecCap.canRecordVitalSigns).toBe(true);
    expect(tecCap.canPrescribeNursingDiagnosisAndPlan).toBe(false);
    expect(tecCap.canPrescribeNursingCare).toBe(false);
    expect(canWriteEvolutionCategory("TECNICO_ENFERMAGEM", "EVOLUCAO_ENFERMAGEM")).toBe(false);
    expect(canWriteEvolutionCategory("TECNICO_ENFERMAGEM", "ANOTACAO_TECNICO_ENF")).toBe(true);

    // Médico prescreve medicamentos e registra evolução médica e diagnósticos CID-10
    expect(medCap.canPrescribeMedications).toBe(true);
    expect(medCap.canRecordMedicalDiagnosis).toBe(true);
    expect(canWriteEvolutionCategory("MEDICO", "EVOLUCAO_MEDICA")).toBe(true);
  });

  it("3. Verifica separação longitudinal entre Paciente e Atendimento/Internação (JOSE LUIS RIBEIRO RODRIGUES - 7834153)", async () => {
    const jose = await prisma.patient.findUnique({
      where: { chartNumber: "7834153" },
      include: {
        encounters: { include: { admission: { include: { bed: true } } } },
        allergies: true,
        diagnoses: true,
        vitalSigns: true,
        prescriptions: { include: { items: { include: { administrations: true } } } },
        nursingAssessments: true,
        nursingPlans: true,
      },
    });

    expect(jose).not.toBeNull();
    expect(jose?.name).toBe("JOSE LUIS RIBEIRO RODRIGUES");
    // Deve possuir histórico longitudinal (mais de 1 atendimento registrado)
    expect(jose?.encounters.length).toBeGreaterThanOrEqual(2);

    const activeEnc = jose?.encounters.find((e) => e.status === "EM_ANDAMENTO");
    expect(activeEnc).toBeDefined();
    expect(activeEnc?.admission?.bed.code).toBe("0551A");

    // Deve possuir os itens prescritos da referência (Aciclovir, Codeína, Dexpantenol, Controle SSVV, etc.)
    expect(jose?.prescriptions[0]?.items.length).toBeGreaterThanOrEqual(12);
    expect(jose?.nursingAssessments.length).toBeGreaterThanOrEqual(1);
    expect(jose?.nursingPlans.length).toBeGreaterThanOrEqual(2);
  });

  it("4. Valida fluxo de Rascunho, Finalização Imutável e Adendo/Retificação no banco de dados", async () => {
    const jose = await prisma.patient.findUniqueOrThrow({
      where: { chartNumber: "7834153" },
      include: { encounters: true },
    });
    const enf = await prisma.user.findUniqueOrThrow({
      where: { username: "enf.giovani" },
    });
    const activeEnc = jose.encounters.find((e) => e.status === "EM_ANDAMENTO")!;

    // 1. Criar rascunho
    const draft = await prisma.clinicalEvolution.create({
      data: {
        patientId: jose.id,
        encounterId: activeEnc.id,
        authorId: enf.id,
        category: "EVOLUCAO_ENFERMAGEM",
        format: "SOAP",
        title: "Teste Automatizado — Rascunho de Evolução",
        subjective: "Paciente sem queixas álgicas.",
        objective: "Afebril, eupneico.",
        status: "RASCUNHO",
      },
    });
    expect(draft.status).toBe("RASCUNHO");

    // 2. Finalizar registro com hash de integridade SHA-256
    const now = new Date();
    const sig = computeRecordSignature({ id: draft.id, ts: now.toISOString() });
    const finalized = await prisma.clinicalEvolution.update({
      where: { id: draft.id },
      data: {
        status: "FINALIZADO",
        finalizedAt: now,
        signatureHash: sig,
      },
    });
    expect(finalized.status).toBe("FINALIZADO");
    expect(finalized.signatureHash).toHaveLength(64);

    // 3. Criar Adendo / Retificação mantendo o registro original intacto
    const addendum = await prisma.clinicalEvolution.create({
      data: {
        patientId: jose.id,
        encounterId: activeEnc.id,
        authorId: enf.id,
        category: "EVOLUCAO_ENFERMAGEM",
        format: "LIVRE",
        title: "Adendo Automatizado de Teste",
        freeText: "Complementação auditável da evolução.",
        status: "FINALIZADO",
        version: finalized.version + 1,
        isAddendum: true,
        addendumReason: "Complementação de teste automatizado",
        parentRecordId: finalized.id,
        finalizedAt: new Date(),
      },
    });

    expect(addendum.isAddendum).toBe(true);
    expect(addendum.parentRecordId).toBe(finalized.id);

    // Limpar registros temporários do teste
    await prisma.clinicalEvolution.delete({ where: { id: addendum.id } });
    await prisma.clinicalEvolution.delete({ where: { id: finalized.id } });
  });

  it("5. Valida schemas Zod de Evolução, Processo de Enfermagem e Checagem Beira-Leito", () => {
    const validPlan = nursingProcessPlanSchema.safeParse({
      encounterId: "enc-123",
      assessmentSummary: "Paciente acamado com mobilidade reduzida",
      nursingDiagnosisCode: "00085",
      nursingDiagnosisTitle: "Mobilidade Física Prejudicada",
      domainClass: "Domínio 4: Atividade/Repouso",
      relatedFactors: "Restrição terapêutica e fadiga",
      expectedOutcomes: "Manter amplitude articular e integridade cutânea",
      interventions: "Mudança de decúbito 2/2h e proteção de proeminências ósseas",
    });
    expect(validPlan.success).toBe(true);

    const validCheck = medicationCheckSchema.safeParse({
      prescriptionItemId: "item-123",
      encounterId: "enc-123",
      scheduledTime: "20:00",
      status: "REALIZADO",
    });
    expect(validCheck.success).toBe(true);

    const validEvo = evolutionSaveSchema.safeParse({
      encounterId: "enc-123",
      category: "EVOLUCAO_ENFERMAGEM",
      format: "SOAP",
      title: "Evolução Noturna",
      subjective: "Paciente calmo",
      finalize: true,
    });
    expect(validEvo.success).toBe(true);
  });
});

