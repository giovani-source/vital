import { PrismaClient } from "@prisma/client";
import { hashPassword, computeRecordSignature } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados hospitalar (100% dados fictícios)...");

  // Limpar tabelas em ordem segura de integridade referencial
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
  await prisma.allergy.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.hospitalUnit.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Instituição
  const institution = await prisma.institution.create({
    data: {
      name: "Hospital Universitário de Clínicas — Unidade Integrada",
      ShortName: "HUC-UI",
      cnes: "2237601",
      cnpj: "87.020.517/0001-26",
      city: "Porto Alegre",
      state: "RS",
      phone: "(51) 3359-8000",
    },
  });

  // 2. Permissões de Perfis (RBAC Persistido)
  const permissions = [
    { role: "ADMIN", resource: "ADMIN_USERS", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Gerenciar usuários, instituições, unidades e leitos" },
    { role: "ADMIN", resource: "PEP_READ", canRead: false, canCreate: false, canUpdate: false, canFinalize: false, description: "Bloqueado de ver informações clínicas sigilosas por padrão" },
    { role: "MEDICO", resource: "PEP_READ", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Acesso clínico completo ao PEP" },
    { role: "MEDICO", resource: "PRESCRIPTION_MED", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Prescrição médica de medicamentos, dieta e cuidados" },
    { role: "ENFERMEIRO", resource: "PEP_READ", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Acesso clínico completo ao PEP e Processo de Enfermagem" },
    { role: "ENFERMEIRO", resource: "NURSING_DIAGNOSIS", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Privativo do Enfermeiro (COFEN 736/2024): Diagnóstico e Prescrição de Enfermagem" },
    { role: "TECNICO_ENFERMAGEM", resource: "PEP_READ", canRead: true, canCreate: true, canUpdate: false, canFinalize: true, description: "Leitura do PEP, anotação técnica, sinais vitais e checagem" },
    { role: "TECNICO_ENFERMAGEM", resource: "NURSING_DIAGNOSIS", canRead: true, canCreate: false, canUpdate: false, canFinalize: false, description: "Vedado registrar diagnósticos ou prescrições privativas do Enfermeiro" },
    { role: "FISIOTERAPEUTA", resource: "PEP_READ", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Evolução fisioterapêutica e avaliação funcional/respiratória" },
    { role: "OUTRO_ASSISTENCIAL", resource: "PEP_READ", canRead: true, canCreate: true, canUpdate: true, canFinalize: true, description: "Evolução multiprofissional e revisão farmacêutica/nutricional" },
  ];
  for (const p of permissions) {
    await prisma.rolePermission.create({ data: p });
  }

  // 3. Unidades Hospitalares
  const unit5Sul = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "5SUL",
      name: "5º Sul — Internação Clínica e Onco-Hematologia (Estação 5SUL-5S3)",
      floor: "5º Andar — Ala Sul",
      specialty: "Clínica Médica / Hematologia e TMO",
    },
  });

  const unitUti = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "UTI-AD",
      name: "UTI Adulto Central",
      floor: "3º Andar — Bloco B",
      specialty: "Terapia Intensiva Adulto",
    },
  });

  const unitEmerg = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "EMERG",
      name: "Emergência Clínica Referenciada",
      floor: "Térreo — Ala Leste",
      specialty: "Urgência e Emergência",
    },
  });

  const unitCir = await prisma.hospitalUnit.create({
    data: {
      institutionId: institution.id,
      code: "CIR-3N",
      name: "3º Norte — Internação Cirúrgica",
      floor: "3º Andar — Ala Norte",
      specialty: "Cirurgia Geral e Digestiva",
    },
  });

  // 4. Leitos Hospitalares
  const bedsData = [
    { unitId: unit5Sul.id, code: "0549A", room: "Enf. 549", type: "ENFERMARIA", status: "OCUPADO", features: "Oxigênio, Vácuo, Bomba de Infusão" },
    { unitId: unit5Sul.id, code: "0549B", room: "Enf. 549", type: "ENFERMARIA", status: "OCUPADO", features: "Oxigênio, Vácuo, Bomba de Infusão" },
    { unitId: unit5Sul.id, code: "0551A", room: "Enf. 551", type: "ISOLAMENTO", status: "OCUPADO", features: "Pressão Positiva HEPA, Bomba Dupla Canal, Monitor" },
    { unitId: unit5Sul.id, code: "0551B", room: "Enf. 551", type: "ENFERMARIA", status: "OCUPADO", features: "Oxigênio, Vácuo" },
    { unitId: unit5Sul.id, code: "0553B", room: "Enf. 553", type: "ENFERMARIA", status: "OCUPADO", features: "Oxigênio, Vácuo, Precaução Contato" },
    { unitId: unit5Sul.id, code: "0555A", room: "Enf. 555", type: "ENFERMARIA", status: "LIVRE", features: "Oxigênio, Vácuo" },
    { unitId: unit5Sul.id, code: "0555B", room: "Enf. 555", type: "ENFERMARIA", status: "HIGIENIZACAO", features: "Oxigênio, Vácuo" },
    { unitId: unit5Sul.id, code: "0556A", room: "Enf. 556", type: "ENFERMARIA", status: "OCUPADO", features: "Oxigênio, Vácuo" },
    { unitId: unitUti.id, code: "UTI-01", room: "Box 01", type: "UTI", status: "OCUPADO", features: "Ventilador Mecânico, Monitor Multiparamétrico, Hemodiálise" },
    { unitId: unitUti.id, code: "UTI-02", room: "Box 02", type: "UTI", status: "LIVRE", features: "Ventilador Mecânico, Monitor Multiparamétrico" },
    { unitId: unitEmerg.id, code: "EMG-04", room: "Sala Vermelha / Obs", type: "OBSERVACAO", status: "LIVRE", features: "Monitor Cardíaco, Desfibrilador" },
    { unitId: unitCir.id, code: "CIR-301A", room: "Enf. 301", type: "ENFERMARIA", status: "LIVRE", features: "Oxigênio, Vácuo" },
  ];

  const bedsMap: Record<string, { id: string; code: string }> = {};
  for (const b of bedsData) {
    const created = await prisma.bed.create({ data: b });
    bedsMap[b.code] = created;
  }

  // 5. Usuários e Profissionais (6 Perfis)
  const defaultPass = hashPassword("Hosp@2026");

  const userEnfermeiro = await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "enf.giovani",
      email: "enf.giovani@hospital.org.br",
      name: "Enf. Giovani Basso da Silva",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "ENFERMEIRO",
      professional: {
        create: {
          category: "Enfermeiro(a)",
          councilType: "COREN",
          councilNumber: "218490",
          councilState: "RS",
          specialty: "Enfermagem Clínica e Terapia Intensiva",
          digitalSignatureKey: "ICP-BR-SIM-COREN-RS-218490",
        },
      },
    },
  });

  const userMedico = await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "med.helena",
      email: "med.helena@hospital.org.br",
      name: "Dra. Helena Vasconcelos",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "MEDICO",
      professional: {
        create: {
          category: "Médico(a)",
          councilType: "CRM",
          councilNumber: "45892",
          councilState: "RS",
          specialty: "Hematologia e Clínica Médica",
          rqe: "31044",
          digitalSignatureKey: "ICP-BR-SIM-CRM-RS-45892",
        },
      },
    },
  });

  const userTecnico = await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "tec.marcos",
      email: "tec.marcos@hospital.org.br",
      name: "Téc. Enf. Marcos Vinícius Antunes",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "TECNICO_ENFERMAGEM",
      professional: {
        create: {
          category: "Técnico(a) de Enfermagem",
          councilType: "COREN-TE",
          councilNumber: "612904",
          councilState: "RS",
          specialty: "Assistência de Enfermagem Hospitalar",
        },
      },
    },
  });

  const userFisio = await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "fisio.camila",
      email: "fisio.camila@hospital.org.br",
      name: "Ft. Camila Dornelles",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "FISIOTERAPEUTA",
      professional: {
        create: {
          category: "Fisioterapeuta",
          councilType: "CREFITO",
          councilNumber: "198432-F",
          councilState: "RS",
          specialty: "Fisioterapia Cardiorrespiratória e Hospitalar",
        },
      },
    },
  });

  const userFarm = await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "farm.rafael",
      email: "farm.rafael@hospital.org.br",
      name: "Farm. Rafael Albuquerque",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "OUTRO_ASSISTENCIAL",
      professional: {
        create: {
          category: "Farmacêutico(a) Clínico",
          councilType: "CRF",
          councilNumber: "14820",
          councilState: "RS",
          specialty: "Farmácia Clínica e Oncológica",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      institutionId: institution.id,
      username: "admin",
      email: "admin@hospital.org.br",
      name: "Carlos Eduardo Mendes (Admin TI)",
      passwordHash: defaultPass.hash,
      passwordSalt: defaultPass.salt,
      role: "ADMIN",
    },
  });

  // 6. Pacientes Fictícios (Baseados na Lista de Pacientes de Enfermagem do AGHUse)
  // PACIENTE 1: JOSE LUIS RIBEIRO RODRIGUES (Prontuário 7834153 - Leito 0551A)
  const patJose = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "7834153",
      name: "JOSE LUIS RIBEIRO RODRIGUES",
      birthDate: new Date("1974-08-31T00:00:00.000Z"),
      sex: "M",
      skinColor: "Branca",
      maritalStatus: "Casado(a)",
      occupation: "Técnico Contábil",
      educationLevel: "Ensino Superior Completo",
      birthPlace: "Porto Alegre",
      city: "Porto Alegre",
      state: "RS",
      religion: "Católica",
      cpf: "614.829.300-15",
      cns: "704809126538410",
      phone: "(51) 99812-4410",
      emergencyContactName: "Marta Ribeiro Rodrigues",
      emergencyRelationship: "Esposa",
      emergencyPhone: "(51) 99812-9002",
      bloodType: "A+",
      clinicalHistory:
        "Paciente em protocolo de condicionamento pré-Transplante de Medula Óssea (TMO) por Linfoma não-Hodgkin difuso de grandes células B. Em monitorização rigorosa de balanço hídrico, profilaxia infecciosa e controle de mucosite.",
      personalAntecedents:
        "Hipertensão arterial sistêmica controlada; diagnóstico de Linfoma não-Hodgkin há 8 meses; cateter venoso central de longa permanência (Hickman) em subclávia direita.",
      familyAntecedents: "Pai falecido por IAM aos 71 anos; mãe hipertensa.",
      continuousMedications: "Alopurinol 300mg VO 1x/dia, Aciclovir 400mg VO 12/12h, Losartana 50mg VO 1x/dia.",
      transfusionHistory: "Transfundiu concentrado de hemácias há 2 meses — sem reação transfusional",
    },
  });

  // Atendimento Anterior Encerrado de José Luis (para demonstrar histórico longitudinal de múltiplos atendimentos)
  await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-01120",
      patientId: patJose.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "ALTA_HOSPITALAR",
      mainDiagnosis: "Estadiamento de Linfoma não-Hodgkin e implante de cateter central",
      mainIcd10: "C83.3",
      reasonForAdmission: "Internação eletiva para quimioterapia ciclo R-CHOP e implante de cateter",
      riskConditions: JSON.stringify(["ALERGIA", "QUEDA"]),
      openedAt: new Date("2026-08-10T09:30:00.000Z"),
      closedAt: new Date("2026-08-18T14:00:00.000Z"),
      dischargeSummary: "Alta hospitalar estável após 1º ciclo quimioterápico sem intercorrências infecciosas.",
    },
  });

  // Atendimento Ativo de José Luis (03/11/2026 17:06 - Leito 0551A)
  const encJose = await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-07834",
      patientId: patJose.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Linfoma não-Hodgkin difuso de grandes células B — Condicionamento pré-TMO",
      mainIcd10: "C83.3",
      reasonForAdmission: "Internação para protocolo quimioterápico de condicionamento (Ciclofosfamida + Mesna) e suporte hematológico",
      riskConditions: JSON.stringify(["ALERGIA", "QUEDA", "RISCO_SANGRAMENTO"]),
      dietSummary: "Dieta para neutropênico + Chá de camomila gelado para bochecho",
      careLine: "Linha de Cuidado Onco-Hematologia / TMO",
      openedAt: new Date("2026-11-03T17:06:00.000Z"),
      admission: {
        create: {
          patientId: patJose.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0551A"].id,
          admittedAt: new Date("2026-11-03T17:06:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-22T12:00:00.000Z"),
          origin: "Ambulatório de Hematologia",
          accompanyingPerson: "Marta Ribeiro Rodrigues",
          accompanyingRelation: "Esposa",
          isolationPrecaution: "Protetor / Neutropênico",
          status: "ATIVA",
        },
      },
    },
  });

  // Alergias de José Luis
  await prisma.allergy.createMany({
    data: [
      {
        patientId: patJose.id,
        recordedById: userEnfermeiro.id,
        category: "MEDICAMENTO",
        substance: "Contraste Iodado",
        reaction: "Urticária disseminada e broncoespasmo moderado",
        severity: "GRAVE",
        reportedBy: "PACIENTE",
      },
      {
        patientId: patJose.id,
        recordedById: userMedico.id,
        category: "MEDICAMENTO",
        substance: "Sulfametoxazol + Trimetoprima",
        reaction: "Exantema maculopapular pruriginoso",
        severity: "MODERADA",
        reportedBy: "PROFISSIONAL_HOSPITAL",
      },
    ],
  });

  // Diagnósticos de José Luis
  await prisma.diagnosis.createMany({
    data: [
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        authorId: userMedico.id,
        icd10Code: "C83.3",
        description: "Linfoma não-Hodgkin difuso de grandes células B",
        type: "PRINCIPAL",
        status: "ATIVO",
        notes: "Em condicionamento com Ciclofosfamida + proteção urotelial com Mesna.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        authorId: userMedico.id,
        icd10Code: "K12.3",
        description: "Mucosite oral grau I secundária a quimioterapia",
        type: "SECUNDARIO",
        status: "ATIVO",
        notes: "Em uso de bochecho de camomila gelado e Dexpantenol labial.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        authorId: userMedico.id,
        icd10Code: "I10",
        description: "Hipertensão arterial essencial (primária)",
        type: "COMORBIDADE",
        status: "ATIVO",
      },
    ],
  });

  // Sinais Vitais e Controles de José Luis (Reproduzindo os horários e anotações da Foto 1 do AGHUse)
  await prisma.vitalSignRecord.createMany({
    data: [
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        recordedById: userTecnico.id,
        recordedAt: new Date("2026-11-10T15:00:00.000Z"),
        systolicBP: 124,
        diastolicBP: 78,
        heartRate: 76,
        respiratoryRate: 18,
        temperature: 36.4,
        spo2: 98,
        painScore: 1,
        capillaryGlucose: 108,
        weightKg: 74.5,
        bradenScore: 18,
        sakFallScore: 7,
        fluidIntakeMl: 500,
        fluidOutputMl: 420,
        fluidDescription: "Início Mesna 1200mg EV em 24h",
        notes: "Início Mesna 1200mg EV em 24h em bomba de infusão contínua.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        recordedById: userTecnico.id,
        recordedAt: new Date("2026-11-10T15:10:00.000Z"),
        systolicBP: 122,
        diastolicBP: 76,
        heartRate: 78,
        respiratoryRate: 17,
        temperature: 36.5,
        spo2: 98,
        painScore: 0,
        fluidIntakeMl: 250,
        fluidOutputMl: 300,
        fluidDescription: "PI — Perdas insensíveis e diurese espontânea",
        notes: "Acesso venoso central pérvio sem sinais flogísticos.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        recordedById: userEnfermeiro.id,
        recordedAt: new Date("2026-11-10T16:00:00.000Z"),
        systolicBP: 128,
        diastolicBP: 80,
        heartRate: 82,
        respiratoryRate: 18,
        temperature: 36.6,
        spo2: 97,
        painScore: 2,
        capillaryGlucose: 114,
        weightKg: 74.4,
        bradenScore: 18,
        sakFallScore: 7,
        fluidIntakeMl: 200,
        fluidOutputMl: 180,
        fluidDescription: "Albendazol 1cp VO, Alopurinol 1cp VO",
        notes: "Administrado Albendazol 1cp VO e Alopurinol 1cp VO com boa aceitação.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        recordedById: userEnfermeiro.id,
        recordedAt: new Date("2026-11-10T17:02:00.000Z"),
        systolicBP: 126,
        diastolicBP: 82,
        heartRate: 80,
        respiratoryRate: 18,
        temperature: 36.7,
        spo2: 98,
        painScore: 1,
        fluidIntakeMl: 207,
        fluidOutputMl: 350,
        fluidDescription: "Resta SF 793mL | Eliminações presentes",
        notes: "Resta SF 793mL na linha de hidratação; diurese clara 350mL.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        recordedById: userEnfermeiro.id,
        recordedAt: new Date("2026-11-10T17:11:00.000Z"),
        systolicBP: 120,
        diastolicBP: 76,
        heartRate: 74,
        respiratoryRate: 16,
        temperature: 36.5,
        spo2: 99,
        painScore: 0,
        capillaryGlucose: 102,
        weightKg: 74.3,
        bradenScore: 19,
        sakFallScore: 7,
        fluidIntakeMl: 350,
        fluidOutputMl: 445,
        fluidDescription: "BHP -95 | Administrado o item Ciclofosfamida",
        notes: "Balanço Hídrico Parcial (BHP) -95mL. Administrado o item Ciclofosfamida conforme protocolo.",
      },
    ],
  });

  // Prescrição Vigente de José Luis (Reproduzindo fielmente os itens da Foto 4 do AGHUse)
  const prescJose = await prisma.prescription.create({
    data: {
      prescriptionNumber: "PRESC-2026-78341",
      patientId: patJose.id,
      encounterId: encJose.id,
      prescriberId: userMedico.id,
      type: "MEDICA",
      status: "VIGENTE",
      validFrom: new Date("2026-11-10T14:00:00.000Z"),
      validUntil: new Date("2026-11-14T14:00:00.000Z"),
      generalNotes: "Manter balanço hídrico rigoroso 6/6h; comunicar se Balanço Hídrico Positivo > 500mL.",
    },
  });

  const joseItemsData = [
    {
      itemOrder: 1,
      category: "CUIDADO",
      description: "BHP E BHT — BALANÇO HÍDRICO PARCIAL E TOTAL",
      observation: "Fechar balanço hídrico a cada turno e comunicar se positivo",
      dose: "Contínuo",
      route: "Controle Assistencial",
      frequency: "CONTÍNUO",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["06:00", "12:00", "18:00", "00:00"]),
    },
    {
      itemOrder: 2,
      category: "DIETA",
      description: "CHÁ DE CAMOMILA GELADO PARA BOCHECHO — REF. A DIETA",
      observation: "Realizar bochecho suave após as refeições para prevenção/alívio de mucosite",
      dose: "150 ML",
      route: "Tópica Oral",
      frequency: "CONTÍNUO",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["08:00", "12:00", "18:00", "22:00"]),
    },
    {
      itemOrder: 3,
      category: "CUIDADO",
      description: "CONTROLE DE SINAIS VITAIS",
      observation: "Verificar PA, FC, FR, Tax, SpO2 e Dor",
      dose: "Rotina",
      route: "Monitorização",
      frequency: "6/6 horas",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["20:00", "02:00", "08:00", "14:00"]),
    },
    {
      itemOrder: 4,
      category: "MEDICAMENTO",
      description: "ACICLOVIR COMPRIMIDO 200 MG",
      observation: "Obs.: Profilaxia antiviral",
      dose: "400 MG",
      route: "Oral",
      frequency: "12/12 horas",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["20:00", "08:00"]),
    },
    {
      itemOrder: 5,
      category: "MEDICAMENTO",
      description: "CODEINA COMPRIMIDO 30 MG",
      observation: "Obs.: Se dor moderada - intensa",
      dose: "30 MG",
      route: "Oral",
      frequency: "8/8 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 6,
      category: "MEDICAMENTO",
      description: "CODEINA SOLUCAO ORAL 3 MG/ML",
      observation: "Controle álgico regular",
      dose: "30 MG",
      route: "Oral",
      frequency: "8/8 horas",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["00:00", "08:00", "16:00"]),
    },
    {
      itemOrder: 7,
      category: "MEDICAMENTO",
      description: "DEXPANTENOL POMADA 50 MG/G",
      observation: "Obs.: Aplicar 2x ao dia em lábios, manhã e noite",
      dose: "1 TB",
      route: "Tópica Cutâneo",
      frequency: "2 X ao dia",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["22:00", "10:00"]),
    },
    {
      itemOrder: 8,
      category: "MEDICAMENTO",
      description: "DIFENIDRAMINA 1 ML INJETAVEL 50 MG/ML",
      observation: "Obs.: Se reação alérgica + pré TMO",
      dose: "50 MG",
      route: "Endovenosa",
      frequency: "6/6 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 9,
      category: "MEDICAMENTO",
      description: "DIMENIDRINATO B6 10 ML INJETAVEL 3 MG/ML",
      observation: "Obs.: Se náuseas/vômitos",
      dose: "30 MG",
      route: "Endovenosa",
      frequency: "6/6 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 10,
      category: "MEDICAMENTO",
      description: "DIPIRONA 2 ML INJETAVEL 500 MG/ML",
      observation: "Obs.: Se febre e/ou dor leve-moderada",
      dose: "1.000 MG",
      route: "Endovenosa",
      frequency: "6/6 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 11,
      category: "MEDICAMENTO",
      description: "ESCOPOLAMINA 1 ML INJETAVEL 20 MG/ML",
      observation: "Obs.: Se dor abdominal em cólica",
      dose: "20 MG",
      route: "Endovenosa",
      frequency: "6/6 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 12,
      category: "MEDICAMENTO",
      description: "FLUCONAZOL SUSPENSAO ORAL 50 MG/ML",
      observation: "Obs.: Profilaxia antifúngica",
      dose: "300 MG",
      route: "Oral",
      frequency: "1 X ao dia",
      condition: "FIXO",
      scheduledHours: JSON.stringify(["16:00"]),
    },
    {
      itemOrder: 13,
      category: "MEDICAMENTO",
      description: "FUROSEMIDA 2 ML INJETAVEL 10 MG/ML",
      observation: "Obs.: Se qualquer balanço hídrico positivo",
      dose: "20 MG",
      route: "Endovenosa",
      frequency: "6/6 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 14,
      category: "MEDICAMENTO",
      description: "HIDROCORTISONA INJETAVEL 100 MG",
      observation: "Obs.: Se reação transfusional + pré TMO",
      dose: "100 MG",
      route: "Endovenosa",
      frequency: "8/8 horas",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
    {
      itemOrder: 15,
      category: "MEDICAMENTO",
      description: "LACTULOSE 10 ML SOLUCAO ORAL 667 MG/ML",
      observation: "Obs.: Se constipação",
      dose: "15 ML",
      route: "Oral",
      frequency: "1 X ao dia",
      condition: "SE_NECESSARIO",
      scheduledHours: JSON.stringify(["SN"]),
    },
  ];

  const createdJoseItems = [];
  for (const item of joseItemsData) {
    const created = await prisma.prescriptionItem.create({
      data: {
        ...item,
        prescriptionId: prescJose.id,
      },
    });
    createdJoseItems.push(created);
  }

  // Checagens já realizadas para demonstrar histórico beira-leito
  await prisma.medicationAdministration.createMany({
    data: [
      {
        prescriptionItemId: createdJoseItems[2].id, // Controle de sinais vitais
        encounterId: encJose.id,
        checkedById: userTecnico.id,
        scheduledTime: "08:00",
        effectiveTime: new Date("2026-11-10T08:04:00.000Z"),
        status: "REALIZADO",
        notes: "SSVV aferidos e registrados na planilha de controles.",
      },
      {
        prescriptionItemId: createdJoseItems[2].id,
        encounterId: encJose.id,
        checkedById: userEnfermeiro.id,
        scheduledTime: "14:00",
        effectiveTime: new Date("2026-11-10T14:05:00.000Z"),
        status: "REALIZADO",
        notes: "Paciente afebril, normotenso.",
      },
      {
        prescriptionItemId: createdJoseItems[3].id, // Aciclovir
        encounterId: encJose.id,
        checkedById: userTecnico.id,
        scheduledTime: "08:00",
        effectiveTime: new Date("2026-11-10T08:10:00.000Z"),
        status: "REALIZADO",
        batchNumber: "LOTE-ACV-991",
        notes: "Administrado 2 comprimidos de 200mg VO.",
      },
      {
        prescriptionItemId: createdJoseItems[6].id, // Dexpantenol
        encounterId: encJose.id,
        checkedById: userTecnico.id,
        scheduledTime: "10:00",
        effectiveTime: new Date("2026-11-10T10:02:00.000Z"),
        status: "REALIZADO",
        notes: "Aplicado em região labial conforme prescrição.",
      },
      {
        prescriptionItemId: createdJoseItems[11].id, // Fluconazol
        encounterId: encJose.id,
        checkedById: userEnfermeiro.id,
        scheduledTime: "16:00",
        effectiveTime: new Date("2026-11-10T16:03:00.000Z"),
        status: "REALIZADO",
        batchNumber: "FLZ-2026-11",
        notes: "Administrado sem intercorrências.",
      },
    ],
  });

  // Avaliação de Enfermagem (Etapa 1) e Processo de Enfermagem (Etapas 2 a 5) de José Luis
  await prisma.nursingAssessment.create({
    data: {
      patientId: patJose.id,
      encounterId: encJose.id,
      authorId: userEnfermeiro.id,
      status: "FINALIZADO",
      admissionReason: "Condicionamento quimioterápico pré-TMO por Linfoma não-Hodgkin",
      hospitalizedLast6m: true,
      medicationsInUse: "Alopurinol 300mg, Aciclovir 400mg 12/12h, Losartana 50mg",
      transfusionReaction: "Transfundiu - sem reação",
      knowsHealthCondition: true,
      currentHistory: "Internado no 5º Sul (Leito 0551A) em protocolo Ciclofosfamida + Mesna.",
      pastHistory: "HAS controlada, implante prévio de cateter de Hickman.",
      familyHistory: "Pai cardiopata; mãe hipertensa.",
      neuroRegulation: "Lúcido, orientado no tempo e espaço, comunicativo, Glasgow 15",
      camScore: "Negativo para Delirium (CAM negativo)",
      painPresent: false,
      painDetails: "Nega dor álgica aguda no momento (EVA 0); leve desconforto em mucosa oral.",
      respiratoryExam: "Eupneico em ar ambiente (FR 16 irpm), SpO2 99%, murmúrio vesicular universalmente audível sem ruídos adventícios.",
      vitalSignsNotes: "PA 120/76 mmHg, FC 74 bpm, Tax 36.5 °C.",
      extremitiesPerfusion: "Extremidades aquecidas, perfusão periférica < 2s, sem edemas de MMII.",
      bmiNutrition: "Peso: 74,3 kg | Altura: 1,75 m | IMC: 24,2 kg/m² (Eutrófico).",
      oralCavity: "Hiperemia discreta em mucosa jugal (Mucosite Grau I); em uso de bochechos com camomila gelada e Dexpantenol.",
      skinIntegrity: "Pele íntegra, curativo de cateter central Hickman em subclávia D limpo, seco e datado.",
      pressureInjury: "Ausência de lesão por pressão (Escala de Braden = 19 pontos - Sem risco).",
      physicalMobility: "Deambula no quarto com suporte de pedestal de bombas de infusão.",
      fallRiskSak: "Escala SAK = 7 pontos (Risco Moderado devido a múltiplos equipos/quimioterapia).",
      eliminations: "Diurese clara e ampla sob hiper-hidratação e Mesna; hábito intestinal preservado.",
      sleepAndRest: "Sono preservado com breves despertares para aferição de controles noturnos.",
      familyRelationship: "Esposa presente e colaborativa no cuidado.",
      vulnerabilitySituations: "Sem vulnerabilidade identificada no momento",
      emotionalState: "Tranquilo",
      lifestyleAndWork: "Afastado temporariamente das atividades laborais para tratamento hematológico.",
      beliefsAndValues: "Católico; solicita respeito aos horários de repouso e apoio familiar.",
      selfCareCapacity: "Paciente com capacidade para o autocuidado preservada, necessitando auxílio com conexões de bomba.",
      educationLimitations: "Paciente sem limitações para a educação em saúde.",
      smokingStatus: "Nega tabagismo",
      otherDrugsStatus: "Nega uso de outras drogas",
      conductSummary: "Manter precaução protetora, rigor no balanço hídrico 6/6h, inspeção diária da cavidade oral e sítio de inserção do cateter central.",
      careLineHCPA: "Medicamentos especiais: quimioterápicos e imunobiológicos | Prevenção de infecção de corrente sanguínea",
      educationActions: JSON.stringify([
        "Prevenção de quedas",
        "Identificação do paciente",
        "Direitos do paciente",
        "Higiene oral e prevenção de mucosite",
      ]),
      finalizedAt: new Date("2026-11-10T14:30:00.000Z"),
    },
  });

  await prisma.nursingProcessPlan.createMany({
    data: [
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        authorId: userEnfermeiro.id,
        assessmentSummary: "Paciente em quimioterapia de alta dose (Ciclofosfamida) e portador de Cateter Venoso Central de Hickman.",
        nursingDiagnosisCode: "00004",
        nursingDiagnosisTitle: "Risco de Infecção",
        domainClass: "Domínio 11: Segurança/Proteção — Classe 1: Infecção",
        relatedFactors: "Imunossupressão secundária ao tratamento quimioterápico e presença de dispositivo venoso central invasivo.",
        definingCharacteristics: "Condição associada: protocolo de condicionamento pré-TMO.",
        expectedOutcomes: "Paciente permanecerá afebril (Tax < 37,8°C) e sem sinais flogísticos no óstio do cateter durante a internação.",
        targetDeadline: "Contínuo / 24h",
        priority: "ALTA",
        interventions: "1. Higienizar mãos rigorosamente antes de manipular conexões; 2. Realizar desinfecção de conectores valvulados com álcool 70% por 15s (Scrub the Hub); 3. Monitorar curva térmica de 6/6h; 4. Inspecionar óstio do cateter central a cada plantão.",
        scheduleFrequency: "6/6 horas",
        evaluationEvolution: "Mantém-se afebril (Tax 36,5°C), óstio do Hickman sem hiperemia ou exsudato.",
        outcomeStatus: "MANTIDO",
        status: "ATIVO",
        finalizedAt: new Date("2026-11-10T14:40:00.000Z"),
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        authorId: userEnfermeiro.id,
        assessmentSummary: "Hiperemia discreta em mucosa oral após início do condicionamento quimioterápico.",
        nursingDiagnosisCode: "00045",
        nursingDiagnosisTitle: "Integridade da Membrana Mucosa Oral Prejudicada",
        domainClass: "Domínio 11: Segurança/Proteção — Classe 2: Lesão Física",
        relatedFactors: "Efeito citotóxico de agentes quimioterápicos sobre células epiteliais da mucosa oral.",
        definingCharacteristics: "Hiperemia leve em mucosa jugal, ressecamento labial.",
        expectedOutcomes: "Regressão da hiperemia oral e ausência de ulcerações ou placas esbranquiçadas em 48 horas.",
        targetDeadline: "48 horas",
        priority: "MEDIA",
        interventions: "1. Orientar e supervisionar bochechos com chá de camomila gelado após as refeições; 2. Aplicar Dexpantenol pomada nos lábios 2x/dia; 3. Avaliar grau de mucosite (Escala OMS) diariamente.",
        scheduleFrequency: "8/8 horas",
        evaluationEvolution: "Paciente refere alívio importante do desconforto após bochechos gelados; sem progressão das lesões.",
        outcomeStatus: "MELHORADO",
        status: "ATIVO",
        finalizedAt: new Date("2026-11-10T14:45:00.000Z"),
      },
    ],
  });

  // Evoluções Clínicas de José Luis (Médica, Enfermagem e Fisioterapia)
  const evoMedJose = await prisma.clinicalEvolution.create({
    data: {
      patientId: patJose.id,
      encounterId: encJose.id,
      authorId: userMedico.id,
      category: "EVOLUCAO_MEDICA",
      format: "SOAP",
      title: "Evolução Médica — Hematologia / TMO",
      subjective: "Paciente refere boa tolerância à infusão de Ciclofosfamida, nega náuseas, vômitos, disúria ou hematúria. Refere apenas leve sensibilidade em mucosa oral melhorada com crioterapia/camomila.",
      objective: "Bom estado geral, corado, hidratado, afebril (Tax 36,5°C), PA 120/76 mmHg, FC 74 bpm, SpO2 99% em ar ambiente. Ausculta cardiopulmonar fisiológica. Abdome plano, flácido, indolor. Diurese clara, BHP -95mL nas últimas 6h.",
      impression: "Linfoma não-Hodgkin em protocolo de condicionamento pré-TMO evoluindo dentro do esperado, com estabilidade hemodinâmica e preservação renal/urotelial sob infusão de Mesna.",
      conduct: "1. Manter hidratação venosa e Mesna contínuo; 2. Manter profilaxias com Aciclovir e Fluconazol; 3. Vigiar balanço hídrico 6/6h (administrar Furosemida 20mg EV se BH positivo conforme prescrição); 4. Solicitar hemograma, função renal e eletrólitos de controle para amanhã às 06h.",
      status: "FINALIZADO",
      version: 1,
      finalizedAt: new Date("2026-11-10T16:30:00.000Z"),
      signatureHash: computeRecordSignature({ patientId: patJose.id, authorId: userMedico.id, ts: "2026-11-10T16:30:00.000Z" }),
    },
  });

  // Exemplo de Adendo / Retificação auditável vinculada à evolução médica
  await prisma.clinicalEvolution.create({
    data: {
      patientId: patJose.id,
      encounterId: encJose.id,
      authorId: userMedico.id,
      category: "EVOLUCAO_MEDICA",
      format: "LIVRE",
      title: "Adendo à Evolução Médica — Ajuste de Horário de Coleta",
      freeText: "ADENDO: Acrescenta-se à conduta a dosagem sérica de Magnésio e Fósforo junto à rotina laboratorial das 06h.",
      status: "FINALIZADO",
      version: 2,
      isAddendum: true,
      addendumReason: "Inclusão de eletrólitos adicionais (Magnésio e Fósforo) no pedido da rotina matinal.",
      parentRecordId: evoMedJose.id,
      finalizedAt: new Date("2026-11-10T16:50:00.000Z"),
      signatureHash: computeRecordSignature({ parent: evoMedJose.id, ts: "2026-11-10T16:50:00.000Z" }),
    },
  });

  await prisma.clinicalEvolution.create({
    data: {
      patientId: patJose.id,
      encounterId: encJose.id,
      authorId: userEnfermeiro.id,
      category: "EVOLUCAO_ENFERMAGEM",
      format: "SOAP",
      title: "Evolução de Enfermagem — Turno Tarde",
      subjective: "Paciente tranquilo no leito na companhia da esposa, nega queixas álgicas (EVA 0), relata boa aceitação hídrica e alimentar.",
      objective: "Lúcido e orientado (Glasgow 15). SSVV estáveis: PA 120/76 mmHg, FC 74 bpm, FR 16 irpm, Tax 36,5°C, SpO2 99%. Cateter central Hickman em subclávia D pérvio, recebendo Ciclofosfamida e Mesna em bombas de infusão distintas. Balanço hídrico parcial fechado em -95 mL.",
      impression: "Risco de infecção e integridade da mucosa oral em acompanhamento; resposta favorável às intervenções de enfermagem.",
      conduct: "Realizada desinfecção de conexões, fechado balanço hídrico parcial das 17h, reforçadas orientações de prevenção de quedas e bochechos com chá de camomila.",
      status: "FINALIZADO",
      version: 1,
      finalizedAt: new Date("2026-11-10T17:15:00.000Z"),
      signatureHash: computeRecordSignature({ patientId: patJose.id, authorId: userEnfermeiro.id, ts: "2026-11-10T17:15:00.000Z" }),
    },
  });

  await prisma.clinicalEvolution.create({
    data: {
      patientId: patJose.id,
      encounterId: encJose.id,
      authorId: userFisio.id,
      category: "EVOLUCAO_FISIOTERAPIA",
      format: "SOAP",
      title: "Evolução Fisioterapêutica — Cinesioterapia e Reexpansão Pulmonar",
      subjective: "Paciente disposto, nega dispneia ou fadiga aos esforços habituais no quarto.",
      objective: "Eupneico em ar ambiente, SpO2 99%, MV+ bilateralmente sem ruídos adventícios. Força muscular global preservada (MRC 5/5).",
      impression: "Capacidade funcional e ventilatória preservadas durante o internamento.",
      conduct: "Realizados exercícios ventilatórios com inspirômetro de incentivo, cinesioterapia ativa de MMSS/MMII e deambulação assistida no quarto.",
      status: "FINALIZADO",
      version: 1,
      finalizedAt: new Date("2026-11-10T15:40:00.000Z"),
      signatureHash: computeRecordSignature({ patientId: patJose.id, authorId: userFisio.id, ts: "2026-11-10T15:40:00.000Z" }),
    },
  });

  // Exames e Procedimentos de José Luis
  await prisma.examProcedure.createMany({
    data: [
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        requestedById: userMedico.id,
        category: "LABORATORIAL",
        code: "LAB-HEMO-01",
        name: "Hemograma Completo + Contagem de Plaquetas",
        clinicalIndication: "Monitorização hematológica diária — condicionamento pré-TMO",
        priority: "ROTINA",
        status: "LAUDADO",
        requestedAt: new Date("2026-11-10T06:00:00.000Z"),
        resultAt: new Date("2026-11-10T09:15:00.000Z"),
        resultSummary: "Hemoglobina: 10,8 g/dL | Ht: 32,4% | Leucócitos: 2.450 /mm³ (Neutrófilos: 1.120 /mm³) | Plaquetas: 94.000 /mm³",
        referenceRange: "Hb: 13,0-17,0 g/dL | Leucócitos: 4.000-11.000 /mm³ | Plaquetas: 150.000-450.000 /mm³",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        requestedById: userMedico.id,
        category: "LABORATORIAL",
        code: "LAB-BIOQ-04",
        name: "Creatinina, Ureia, Sódio, Potássio e Ácido Úrico",
        clinicalIndication: "Controle de função renal e lise tumoral durante infusão de Ciclofosfamida",
        priority: "URGENTE",
        status: "LAUDADO",
        requestedAt: new Date("2026-11-10T06:00:00.000Z"),
        resultAt: new Date("2026-11-10T08:50:00.000Z"),
        resultSummary: "Creatinina: 0,88 mg/dL | Ureia: 31 mg/dL | Na+: 139 mEq/L | K+: 4,2 mEq/L | Ácido Úrico: 4,6 mg/dL",
        referenceRange: "Cr: 0,7-1,2 mg/dL | Ur: 15-45 mg/dL | Na: 135-145 mEq/L | K: 3,5-5,1 mEq/L",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        requestedById: userMedico.id,
        category: "IMAGEM",
        code: "IMG-RX-TORAX",
        name: "Radiografia de Tórax PA e Perfil (Controle de Cateter Central)",
        clinicalIndication: "Verificação de posicionamento de extremidade distal de cateter Hickman",
        priority: "ROTINA",
        status: "LAUDADO",
        requestedAt: new Date("2026-11-04T10:00:00.000Z"),
        resultAt: new Date("2026-11-04T11:30:00.000Z"),
        resultSummary: "Cateter venoso central com entrada à direita e extremidade distal projetada na topografia da junção cavo-atrial. Campos pleuropulmonares livres.",
        referenceRange: "Laudo Radiológico Padrão",
      },
    ],
  });

  // Documentos Anexados de José Luis
  await prisma.clinicalDocument.createMany({
    data: [
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        uploadedById: userMedico.id,
        title: "Termo de Consentimento Livre e Esclarecido — Quimioterapia e TMO",
        category: "TERMO_CONSENTIMENTO",
        fileName: "TCLE_Quimioterapia_TMO_JoseLuis_7834153.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 248910,
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        description: "Documento assinado pelo paciente e pela equipe médica de Hematologia.",
      },
      {
        patientId: patJose.id,
        encounterId: encJose.id,
        uploadedById: userEnfermeiro.id,
        title: "Checklist de Manutenção Segura de Cateter Venoso Central (Bundle CVC)",
        category: "PARECER",
        fileName: "Bundle_CVC_Hickman_7834153.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 142300,
        sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        description: "Registro de auditoria de inserção e manutenção de cateter central sem infecção.",
      },
    ],
  });

  // PACIENTE 2: PEDRO MACHADO RODRIGUES (Prontuário 18382671 - Leito 0549B - Conforme Vídeo do AGHUse)
  const patPedro = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "18382671",
      name: "PEDRO MACHADO RODRIGUES",
      birthDate: new Date("2007-09-26T00:00:00.000Z"),
      sex: "M",
      skinColor: "Parda",
      maritalStatus: "Solteiro(a)",
      occupation: "Estudante",
      educationLevel: "Ensino Médio",
      birthPlace: "Porto Alegre",
      city: "Porto Alegre",
      state: "RS",
      religion: "Evangélica",
      cpf: "048.912.770-82",
      cns: "706204589123740",
      phone: "(51) 99145-3301",
      emergencyContactName: "Sandra Machado Rodrigues",
      emergencyRelationship: "Mãe",
      emergencyPhone: "(51) 99145-8890",
      bloodType: "O+",
      clinicalHistory: "Paciente jovem internado para investigação e tratamento de crise vaso-oclusiva / anemia hemolítica e antibioticoterapia venosa.",
      personalAntecedents: "Internação prévia há 1 ano por quadro infeccioso respiratório.",
      familyAntecedents: "Sem consanguinidade; mãe hígida.",
      continuousMedications: "Ácido Fólico 5mg VO 1x/dia.",
      transfusionHistory: "Transfundiu - sem reação",
    },
  });

  const encPedro = await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-08382",
      patientId: patPedro.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Anemia falciforme com crise álgica vaso-oclusiva controlada",
      mainIcd10: "D57.0",
      reasonForAdmission: "Dor osteoarticular intensa em membros inferiores e febre baixa para hidratação e analgesia venosa",
      riskConditions: JSON.stringify(["QUEDA"]),
      dietSummary: "Dieta livre hiper-hidratada",
      careLine: "Linha de Cuidado Hematologia Clínica",
      openedAt: new Date("2026-10-16T10:16:00.000Z"),
      admission: {
        create: {
          patientId: patPedro.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0549B"].id,
          admittedAt: new Date("2026-10-16T10:16:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-16T12:00:00.000Z"),
          origin: "Emergência",
          accompanyingPerson: "Sandra Machado Rodrigues",
          accompanyingRelation: "Mãe",
          isolationPrecaution: "Padrão",
          status: "ATIVA",
        },
      },
    },
  });

  await prisma.nursingAssessment.create({
    data: {
      patientId: patPedro.id,
      encounterId: encPedro.id,
      authorId: userEnfermeiro.id,
      status: "FINALIZADO",
      admissionReason: "Controle de crise vaso-oclusiva e hidratação parenteral",
      hospitalizedLast6m: false,
      medicationsInUse: "Ácido fólico 5mg/dia; Dipirona 1g EV 6/6h",
      transfusionReaction: "Transfundiu - sem reação",
      knowsHealthCondition: true,
      currentHistory: "Evoluindo com remissão progressiva da dor articular em MMII e estabilidade clínica.",
      neuroRegulation: "Lúcido, orientado, colaborativo, sem déficit focal.",
      camScore: "Negativo para Delirium",
      painPresent: true,
      painDetails: "Dor leve residual em região tibial bilateral (EVA 2/10), melhora após analgesia.",
      respiratoryExam: "Eupneico em ar ambiente, SpO2 98%, MV+ bilateral.",
      extremitiesPerfusion: "Extremidades aquecidas, pulsos pediosos cheios e simétricos.",
      bmiNutrition: "Peso: 63,0 kg | Altura: 1,72 m | IMC: 21,3 kg/m²",
      oralCavity: "Mucosas normocoradas e hidratadas.",
      skinIntegrity: "Pele íntegra, acesso venoso periférico em MSE salinizado sem sinais flogísticos.",
      pressureInjury: "Sem lesão por pressão (Braden 21).",
      physicalMobility: "Deambula com supervisão durante episódios álgicos.",
      fallRiskSak: "Escala SAK = 15 (Risco Moderado).",
      eliminations: "Diurese espontânea clara, evacuação presente.",
      sleepAndRest: "Sono preservado à noite.",
      familyRelationship: "Mãe presente no acompanhamento hospitalar.",
      vulnerabilitySituations: "Sem vulnerabilidade identificada no momento",
      emotionalState: "Tranquilo",
      beliefsAndValues: "Praticante; valoriza apoio familiar.",
      selfCareCapacity: "Paciente com capacidade para o autocuidado",
      educationLimitations: "Paciente sem limitações para a educação",
      smokingStatus: "Nega tabagismo",
      otherDrugsStatus: "Nega outras drogas",
      conductSummary: "Manter controle da dor (EVA) 6/6h, estímulo à ingesta hídrica oral e prevenção de quedas.",
      careLineHCPA: "Prevenção de quedas e manejo seguro da dor",
      educationActions: JSON.stringify([
        "Prevenção de quedas",
        "Identificação do paciente",
        "Direitos do paciente",
      ]),
      finalizedAt: new Date("2026-11-10T11:00:00.000Z"),
    },
  });

  await prisma.vitalSignRecord.create({
    data: {
      patientId: patPedro.id,
      encounterId: encPedro.id,
      recordedById: userTecnico.id,
      recordedAt: new Date("2026-11-10T16:00:00.000Z"),
      systolicBP: 116,
      diastolicBP: 72,
      heartRate: 78,
      respiratoryRate: 16,
      temperature: 36.6,
      spo2: 98,
      painScore: 2,
      capillaryGlucose: 94,
      weightKg: 63.0,
      bradenScore: 21,
      sakFallScore: 15,
      fluidIntakeMl: 1200,
      fluidOutputMl: 1100,
      fluidDescription: "Balanço hídrico equilibrado (+100mL)",
      notes: "Estável, refere melhora importante da dor em MMII.",
    },
  });

  // PACIENTE 3: MATHEUS DA SILVA ARAUJO (Prontuário 18431007 - Leito 0549A)
  const patMatheus = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "18431007",
      name: "MATHEUS DA SILVA ARAUJO",
      birthDate: new Date("2002-06-03T00:00:00.000Z"),
      sex: "M",
      skinColor: "Branca",
      maritalStatus: "Solteiro(a)",
      occupation: "Designer Gráfico",
      birthPlace: "Canoas",
      city: "Porto Alegre",
      state: "RS",
      cpf: "839.201.440-09",
      cns: "700508914230912",
      phone: "(51) 99601-2281",
      emergencyContactName: "Roberto Araujo",
      emergencyRelationship: "Pai",
      emergencyPhone: "(51) 99601-9900",
      bloodType: "B+",
      clinicalHistory: "Pielonefrite aguda não obstrutiva em antibioticoterapia venosa dirigida (Ceftriaxona).",
      personalAntecedents: "Nefrolitíase prévia há 2 anos.",
      continuousMedications: "Tansulosina 0,4mg VO 1x/dia.",
    },
  });

  const encMatheus = await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-08431",
      patientId: patMatheus.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Pielonefrite aguda associada a cálculo ureteral não obstrutivo",
      mainIcd10: "N10",
      reasonForAdmission: "Febre, calafrios e lombalgia à direita",
      riskConditions: JSON.stringify([]),
      openedAt: new Date("2026-10-26T12:02:00.000Z"),
      admission: {
        create: {
          patientId: patMatheus.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0549A"].id,
          admittedAt: new Date("2026-10-26T12:02:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-15T10:00:00.000Z"),
          origin: "Emergência",
          status: "ATIVA",
        },
      },
    },
  });

  await prisma.vitalSignRecord.create({
    data: {
      patientId: patMatheus.id,
      encounterId: encMatheus.id,
      recordedById: userTecnico.id,
      recordedAt: new Date("2026-11-10T16:30:00.000Z"),
      systolicBP: 118,
      diastolicBP: 74,
      heartRate: 70,
      respiratoryRate: 15,
      temperature: 36.3,
      spo2: 99,
      painScore: 0,
      weightKg: 71.2,
      bradenScore: 22,
      sakFallScore: 2,
      fluidIntakeMl: 1500,
      fluidOutputMl: 1450,
      notes: "Afebril há 72h, diurese límpida, previsão de transição para antibiótico oral.",
    },
  });

  // PACIENTE 4: LUCAS PORTO (Prontuário 17095571 - Leito 0551B)
  const patLucas = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "17095571",
      name: "LUCAS PORTO",
      birthDate: new Date("1979-09-08T00:00:00.000Z"),
      sex: "M",
      skinColor: "Branca",
      maritalStatus: "Casado(a)",
      occupation: "Engenheiro Civil",
      cpf: "912.340.110-53",
      cns: "708102394810293",
      phone: "(51) 99234-1190",
      bloodType: "O-",
      clinicalHistory: "Trombose venosa profunda proximal em MIE em ajuste de anticoagulação plena.",
      personalAntecedents: "Imobilização ortopédica recente em membro inferior esquerdo.",
      continuousMedications: "Enoxaparina 80mg SC 12/12h.",
    },
  });

  await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-07095",
      patientId: patLucas.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Trombose venosa profunda de membro inferior esquerdo",
      mainIcd10: "I80.2",
      reasonForAdmission: "Edema e empastamento de panturrilha esquerda confirmado por Eco-Doppler venoso",
      riskConditions: JSON.stringify(["RISCO_SANGRAMENTO", "QUEDA"]),
      openedAt: new Date("2026-10-28T11:56:00.000Z"),
      admission: {
        create: {
          patientId: patLucas.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0551B"].id,
          admittedAt: new Date("2026-10-28T11:56:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-15T12:00:00.000Z"),
          origin: "Emergência",
          status: "ATIVA",
        },
      },
    },
  });

  // PACIENTE 5: ERIK JOSE CORDOVA PEREIRA (Prontuário 18267963 - Leito 0553B)
  const patErik = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "18267963",
      name: "ERIK JOSE CORDOVA PEREIRA",
      birthDate: new Date("1999-10-06T00:00:00.000Z"),
      sex: "M",
      skinColor: "Branca",
      maritalStatus: "Solteiro(a)",
      occupation: "Analista de Sistemas",
      cpf: "301.882.490-77",
      cns: "702904817263541",
      phone: "(51) 98411-5520",
      bloodType: "A+",
      clinicalHistory: "Pneumonia bacteriana comunitária extensa em tratamento com Ampicilina+Sulbactam.",
    },
  });

  await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-08267",
      patientId: patErik.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Pneumonia bacteriana em lobo inferior direito",
      mainIcd10: "J15.9",
      reasonForAdmission: "Tosse produtiva, febre e dispneia moderada",
      riskConditions: JSON.stringify(["CONTATO"]),
      openedAt: new Date("2026-11-03T08:47:00.000Z"),
      admission: {
        create: {
          patientId: patErik.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0553B"].id,
          admittedAt: new Date("2026-11-03T08:47:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-14T12:00:00.000Z"),
          isolationPrecaution: "Contato",
          status: "ATIVA",
        },
      },
    },
  });

  // PACIENTE 6: MARIA INEZ SAALFELD KRUGER (Prontuário 18427682 - Leito 0556A)
  const patMaria = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "18427682",
      name: "MARIA INEZ SAALFELD KRUGER",
      birthDate: new Date("1964-06-01T00:00:00.000Z"),
      sex: "F",
      skinColor: "Branca",
      maritalStatus: "Viúvo(a)",
      occupation: "Professora Aposentada",
      cpf: "418.772.900-31",
      cns: "705109283746152",
      phone: "(51) 99710-4020",
      bloodType: "AB+",
      clinicalHistory: "Insuficiência cardíaca perfil B descompensada, em otimização de terapia vasodilatadora e diurética.",
      personalAntecedents: "HAS, DM tipo 2, Fibrilação Atrial crônica anticoagulada.",
      continuousMedications: "Sacubitril/Valsartana 49/51mg 12/12h, Bisoprolol 5mg, Dapagliflozina 10mg, Apixabana 5mg 12/12h.",
    },
  });

  const encMaria = await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-08427",
      patientId: patMaria.id,
      unitId: unit5Sul.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Insuficiência cardíaca congestiva em compensação clínica",
      mainIcd10: "I50.0",
      reasonForAdmission: "Ortopneia, dispneia paroxística noturna e edema de MMII",
      riskConditions: JSON.stringify(["ALERGIA", "QUEDA", "LESAO_PRESSAO"]),
      careLine: "Linha de Cuidado Insuficiência Cardíaca",
      openedAt: new Date("2026-11-08T16:07:00.000Z"),
      admission: {
        create: {
          patientId: patMaria.id,
          unitId: unit5Sul.id,
          bedId: bedsMap["0556A"].id,
          admittedAt: new Date("2026-11-08T16:07:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-18T12:00:00.000Z"),
          status: "ATIVA",
        },
      },
    },
  });

  await prisma.allergy.create({
    data: {
      patientId: patMaria.id,
      recordedById: userEnfermeiro.id,
      category: "MEDICAMENTO",
      substance: "Ácido Acetilsalicílico (AAS) / AINEs",
      reaction: "Broncoespasmo e angioedema palpebral",
      severity: "GRAVE",
      reportedBy: "PACIENTE",
    },
  });

  await prisma.vitalSignRecord.create({
    data: {
      patientId: patMaria.id,
      encounterId: encMaria.id,
      recordedById: userEnfermeiro.id,
      recordedAt: new Date("2026-11-10T17:00:00.000Z"),
      systolicBP: 134,
      diastolicBP: 84,
      heartRate: 86,
      respiratoryRate: 20,
      temperature: 36.4,
      spo2: 95,
      painScore: 0,
      capillaryGlucose: 142,
      weightKg: 68.4,
      bradenScore: 14,
      sakFallScore: 18,
      fluidIntakeMl: 800,
      fluidOutputMl: 1650,
      fluidDescription: "BHP -850 mL com estímulo diurético",
      notes: "Redução de 1,2 kg nas últimas 24h, melhora do padrão respiratório.",
    },
  });

  // PACIENTE 7: TATIELLE DE OLIVEIRA MARTINS (Prontuário 13272497 - UTI-01)
  const patTatielle = await prisma.patient.create({
    data: {
      institutionId: institution.id,
      chartNumber: "13272497",
      name: "TATIELLE DE OLIVEIRA MARTINS",
      birthDate: new Date("1995-09-28T00:00:00.000Z"),
      sex: "F",
      skinColor: "Branca",
      maritalStatus: "Casado(a)",
      occupation: "Arquiteta",
      cpf: "552.109.840-64",
      cns: "709401283746519",
      phone: "(51) 99522-7711",
      bloodType: "O+",
      clinicalHistory: "Pós-operatório imediato de colectomia videolaparoscópica em vigilância intensiva.",
    },
  });

  await prisma.encounter.create({
    data: {
      encounterNumber: "ATD-2026-03272",
      patientId: patTatielle.id,
      unitId: unitUti.id,
      type: "INTERNACAO",
      status: "EM_ANDAMENTO",
      mainDiagnosis: "Monitorização pós-operatória de cirurgia abdominal de grande porte",
      mainIcd10: "Z48.8",
      reasonForAdmission: "Vigilância hemodinâmica e analgesia multimodal em UTI Adulto",
      riskConditions: JSON.stringify(["QUEDA", "LESAO_PRESSAO"]),
      openedAt: new Date("2026-11-05T16:05:00.000Z"),
      admission: {
        create: {
          patientId: patTatielle.id,
          unitId: unitUti.id,
          bedId: bedsMap["UTI-01"].id,
          admittedAt: new Date("2026-11-05T16:05:00.000Z"),
          estimatedDischargeAt: new Date("2026-11-14T14:00:00.000Z"),
          origin: "Bloco Cirúrgico",
          status: "ATIVA",
        },
      },
    },
  });

  // 7. Logs de Auditoria Iniciais
  await prisma.auditLog.createMany({
    data: [
      {
        userId: userMedico.id,
        userName: userMedico.name,
        userRole: userMedico.role,
        patientId: patJose.id,
        encounterId: encJose.id,
        action: "FINALIZE_RECORD",
        module: "EVOLUCAO",
        entityType: "ClinicalEvolution",
        entityId: evoMedJose.id,
        details: "Finalizou Evolução Médica SOAP para JOSE LUIS RIBEIRO RODRIGUES (Prontuário 7834153).",
      },
      {
        userId: userEnfermeiro.id,
        userName: userEnfermeiro.name,
        userRole: userEnfermeiro.role,
        patientId: patJose.id,
        encounterId: encJose.id,
        action: "FINALIZE_RECORD",
        module: "ENFERMAGEM",
        entityType: "NursingProcessPlan",
        details: "Registrou Avaliação de Enfermagem e Diagnósticos de Enfermagem (COFEN 736/2024) para JOSE LUIS RIBEIRO RODRIGUES.",
      },
      {
        userId: userTecnico.id,
        userName: userTecnico.name,
        userRole: userTecnico.role,
        patientId: patJose.id,
        encounterId: encJose.id,
        action: "CHECK_MEDICATION",
        module: "CHECAGEM",
        entityType: "MedicationAdministration",
        details: "Realizou checagem beira-leito de ACICLOVIR 400mg VO e Controle de Sinais Vitais.",
      },
      {
        userId: userFarm.id,
        userName: userFarm.name,
        userRole: userFarm.role,
        patientId: patJose.id,
        encounterId: encJose.id,
        action: "VIEW_PATIENT_PEP",
        module: "PRESCRICAO",
        entityType: "Prescription",
        entityId: prescJose.id,
        details: "Conciliação medicamentosa e validação farmacêutica da prescrição PRESC-2026-78341.",
      },
    ],
  });

  console.log("Seed hospitalar concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

