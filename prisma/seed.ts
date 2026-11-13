import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Inicializando banco de dados hospitalar limpo (sem dados fictícios de pacientes/prescrições)...");

  // Limpar todas as tabelas relacionais em ordem de dependência
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.medicationAdministration.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.vitalSignRecord.deleteMany();
  await prisma.nursingProcessPlan.deleteMany();
  await prisma.nursingAssessment.deleteMany();
  await prisma.clinicalEvolution.deleteMany();
  await prisma.examProcedure.deleteMany();
  await prisma.clinicalDocument.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.hospitalUnit.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Instituição Hospitalar Principal
  const institution = await prisma.institution.create({
    data: {
      name: "Hospital Geral — Sistema PEP",
      ShortName: "HOSP-PEP",
      cnes: "2237601",
      cnpj: "87.123.456/0001-90",
      city: "Porto Alegre",
      state: "RS",
    },
  });

  // 2. Matriz de Permissões no Banco (ADM possui acesso total + perfis assistenciais com suas atribuições)
  const permissionsData = [
    {
      role: "ADMIN",
      resource: "ALL_MODULES_AND_PEP",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canFinalize: true,
      description: "Acesso total a todos os módulos clínicos, PEP e liberação de perfis",
    },
    {
      role: "MEDICO",
      resource: "PEP_CLINICAL_MEDICAL",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canFinalize: true,
      description: "Acesso ao PEP, Evolução Médica SOAP, Prescrição Médica e Exames",
    },
    {
      role: "ENFERMEIRO",
      resource: "PEP_NURSING_PROCESS",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canFinalize: true,
      description: "Acesso ao PEP, Processo de Enfermagem 5 etapas (COFEN 736/2024) e Prescrição de Cuidados",
    },
    {
      role: "TECNICO_ENFERMAGEM",
      resource: "PEP_TECH_NURSING",
      canRead: true,
      canCreate: true,
      canUpdate: false,
      canFinalize: true,
      description: "Anotação de Enfermagem, Sinais Vitais e Checagem Beira-Leito (bloqueado para prescrições e diagnósticos)",
    },
    {
      role: "FISIOTERAPEUTA",
      resource: "PEP_MULTIPROFESSIONAL",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canFinalize: true,
      description: "Evolução Fisioterapêutica e Parâmetros Cardiorrespiratórios",
    },
    {
      role: "OUTRO_ASSISTENCIAL",
      resource: "PEP_MULTIPROFESSIONAL",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canFinalize: true,
      description: "Evolução Multiprofissional",
    },
  ];

  for (const perm of permissionsData) {
    await prisma.rolePermission.create({ data: perm });
  }

  // 3. Unidades Hospitalares e Leitos (Todos DISPONÍVEIS, sem pacientes fictícios)
  const unit5Sul = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "5SUL",
      name: "Unidade de Internação 5º Sul",
      floor: "5º Andar — Ala Sul",
      specialty: "Clínica Médica e Cirúrgica",
    },
  });

  const unitUTI = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "UTI-AD",
      name: "UTI Adulto Geral",
      floor: "3º Andar — Bloco Crítico",
      specialty: "Terapia Intensiva Adulto",
    },
  });

  const unitEmerg = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "EMERG",
      name: "Emergência Clínica",
      floor: "Térreo — Ala Leste",
      specialty: "Urgência e Emergência",
    },
  });

  const beds5Sul = ["0545A", "0545B", "0549A", "0549B", "0551A", "0551B", "0556A", "0556B"];
  for (const code of beds5Sul) {
    await prisma.bed.create({
      data: {
        unitId: unit5Sul.id,
        code,
        room: `Enf. ${code.slice(0, 4)}`,
        type: "ENFERMARIA",
        status: "DISPONIVEL",
      },
    });
  }

  const bedsUTI = ["UTI-01", "UTI-02", "UTI-03", "UTI-04"];
  for (const code of bedsUTI) {
    await prisma.bed.create({
      data: {
        unitId: unitUTI.id,
        code,
        room: `Box ${code}`,
        type: "UTI",
        status: "DISPONIVEL",
      },
    });
  }

  const bedsEmerg = ["EMG-01", "EMG-02", "EMG-03", "EMG-04"];
  for (const code of bedsEmerg) {
    await prisma.bed.create({
      data: {
        unitId: unitEmerg.id,
        code,
        room: `Sala Observação`,
        type: "OBSERVACAO",
        status: "DISPONIVEL",
      },
    });
  }

  // 4. Perfil Master de Administrador Geral (ADM — vê tudo e libera novos perfis)
  const defaultPassword = hashPassword("Hosp@2026");

  await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "admin",
      email: "giovani@medaffection.com",
      name: "Giovani Basso da Silva (ADM)",
      passwordHash: defaultPassword.hash,
      passwordSalt: defaultPassword.salt,
      role: "ADMIN",
      active: true,
      professional: {
        create: {
          category: "ADMIN",
          councilType: "COREN",
          councilNumber: "218490",
          councilState: "RS",
          specialty: "Administração Hospitalar & Gestão Assistencial",
        },
      },
    },
  });

  console.log("Banco de dados limpo inicializado com sucesso! Conta ADM Master criada: giovani@medaffection.com / admin");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
