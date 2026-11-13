import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(2, "Informe o e-mail ou identificador de usuário"),
  password: z.string().min(4, "Informe a senha"),
});

export const patientCreateSchema = z.object({
  name: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  socialName: z.string().optional().nullable(),
  birthDate: z.string().min(8, "Data de nascimento obrigatória"),
  sex: z.enum(["M", "F", "I"]),
  skinColor: z.string().default("Branca"),
  maritalStatus: z.string().default("Solteiro(a)"),
  occupation: z.string().default("Outros"),
  educationLevel: z.string().default("Ensino Médio"),
  birthPlace: z.string().default("Porto Alegre"),
  city: z.string().default("Porto Alegre"),
  state: z.string().default("RS"),
  religion: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  cns: z.string().optional().nullable(),
  chartNumber: z.string().min(4, "Número de prontuário obrigatório"),
  phone: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyRelationship: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  clinicalHistory: z.string().optional().nullable(),
  personalAntecedents: z.string().optional().nullable(),
  familyAntecedents: z.string().optional().nullable(),
  continuousMedications: z.string().optional().nullable(),
  transfusionHistory: z.string().default("Nunca transfundiu"),
  // Opcional para abrir internação imediata no cadastro
  createAdmission: z.boolean().optional().default(false),
  unitId: z.string().optional(),
  bedId: z.string().optional(),
  mainDiagnosis: z.string().optional(),
  mainIcd10: z.string().optional(),
  reasonForAdmission: z.string().optional(),
});

export const allergyCreateSchema = z.object({
  category: z.enum(["MEDICAMENTO", "ALIMENTO", "MATERIAL", "INSETO", "PLANTA", "OUTRO"]),
  substance: z.string().min(2, "Informe o agente ou grupo de medicamento"),
  reaction: z.string().min(2, "Informe o tipo de reação"),
  severity: z.enum(["LEVE", "MODERADA", "GRAVE"]).default("MODERADA"),
  reportedBy: z.enum(["PACIENTE", "PROFISSIONAL_HOSPITAL", "FAMILIAR"]).default("PACIENTE"),
});

export const diagnosisCreateSchema = z.object({
  encounterId: z.string().optional().nullable(),
  icd10Code: z.string().min(2, "Código CID-10 obrigatório"),
  description: z.string().min(3, "Descrição diagnóstica obrigatória"),
  type: z.enum(["PRINCIPAL", "SECUNDARIO", "COMORBIDADE"]).default("SECUNDARIO"),
  status: z.enum(["ATIVO", "RESOLVIDO", "SUSPEITO"]).default("ATIVO"),
  notes: z.string().optional().nullable(),
});

export const evolutionSaveSchema = z.object({
  id: z.string().optional().nullable(),
  encounterId: z.string().min(1, "Atendimento ativo obrigatório"),
  category: z.enum([
    "EVOLUCAO_MEDICA",
    "EVOLUCAO_ENFERMAGEM",
    "ANOTACAO_TECNICO_ENF",
    "EVOLUCAO_FISIOTERAPIA",
    "EVOLUCAO_MULTIPROFISSIONAL",
  ]),
  format: z.enum(["SOAP", "LIVRE"]).default("SOAP"),
  title: z.string().min(3, "Título do registro clínico obrigatório"),
  subjective: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  impression: z.string().optional().nullable(),
  conduct: z.string().optional().nullable(),
  freeText: z.string().optional().nullable(),
  finalize: z.boolean().default(false),
  isAddendum: z.boolean().default(false),
  parentRecordId: z.string().optional().nullable(),
  addendumReason: z.string().optional().nullable(),
});

export const nursingAssessmentSchema = z.object({
  id: z.string().optional().nullable(),
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  status: z.enum(["RASCUNHO", "FINALIZADO"]).default("RASCUNHO"),
  admissionReason: z.string().min(3, "Motivo da internação obrigatório"),
  hospitalizedLast6m: z.boolean().default(false),
  medicationsInUse: z.string().optional().nullable(),
  transfusionReaction: z.string().default("Nunca transfundiu"),
  knowsHealthCondition: z.boolean().default(true),
  currentHistory: z.string().optional().nullable(),
  pastHistory: z.string().optional().nullable(),
  familyHistory: z.string().optional().nullable(),
  neuroRegulation: z.string().min(2),
  camScore: z.string().default("Negativo para Delirium"),
  painPresent: z.boolean().default(false),
  painDetails: z.string().optional().nullable(),
  respiratoryExam: z.string().min(2),
  vitalSignsNotes: z.string().optional().nullable(),
  extremitiesPerfusion: z.string().min(2),
  bmiNutrition: z.string().optional().nullable(),
  oralCavity: z.string().min(2),
  skinIntegrity: z.string().min(2),
  pressureInjury: z.string().min(2),
  physicalMobility: z.string().min(2),
  fallRiskSak: z.string().min(2),
  eliminations: z.string().min(2),
  sleepAndRest: z.string().min(2),
  familyRelationship: z.string().min(2),
  vulnerabilitySituations: z.string().min(2),
  emotionalState: z.string().min(2),
  lifestyleAndWork: z.string().optional().nullable(),
  beliefsAndValues: z.string().min(2),
  selfCareCapacity: z.string().min(2),
  educationLimitations: z.string().min(2),
  smokingStatus: z.string().min(2),
  otherDrugsStatus: z.string().min(2),
  conductSummary: z.string().min(3, "Conduta de enfermagem obrigatória"),
  careLineHCPA: z.string().default("Prevenção de eventos adversos e segurança do paciente"),
  educationActions: z.array(z.string()).default(["Prevenção de quedas", "Identificação do paciente"]),
  freeTextSummary: z.string().optional().nullable(),
});

export const nursingProcessPlanSchema = z.object({
  id: z.string().optional().nullable(),
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  assessmentSummary: z.string().min(3, "Resumo da Avaliação de Enfermagem (Etapa 1) obrigatório"),
  nursingDiagnosisCode: z.string().min(2, "Código do Diagnóstico de Enfermagem obrigatório"),
  nursingDiagnosisTitle: z.string().min(3, "Título do Diagnóstico de Enfermagem (Etapa 2) obrigatório"),
  domainClass: z.string().min(3, "Domínio/Classe obrigatório"),
  relatedFactors: z.string().min(3, "Fatores relacionados obrigatórios"),
  definingCharacteristics: z.string().optional().nullable(),
  expectedOutcomes: z.string().min(3, "Planejamento / Resultados Esperados (Etapa 3) obrigatórios"),
  targetDeadline: z.string().default("24 horas"),
  priority: z.enum(["ALTA", "MEDIA", "BAIXA"]).default("ALTA"),
  interventions: z.string().min(3, "Implementação / Prescrição de Cuidados (Etapa 4) obrigatória"),
  scheduleFrequency: z.string().default("6/6 horas"),
  evaluationEvolution: z.string().optional().nullable(),
  outcomeStatus: z
    .enum(["MANTIDO", "MELHORADO", "RESOLVIDO", "PIORADO", "EM_ACOMPANHAMENTO"])
    .default("EM_ACOMPANHAMENTO"),
  status: z.enum(["RASCUNHO", "ATIVO", "ENCERRADO"]).default("ATIVO"),
});

export const vitalSignsCreateSchema = z.object({
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  systolicBP: z.number().int().min(30).max(300).optional().nullable(),
  diastolicBP: z.number().int().min(15).max(200).optional().nullable(),
  heartRate: z.number().int().min(20).max(260).optional().nullable(),
  respiratoryRate: z.number().int().min(4).max(80).optional().nullable(),
  temperature: z.number().min(30).max(44).optional().nullable(),
  spo2: z.number().int().min(40).max(100).optional().nullable(),
  painScore: z.number().int().min(0).max(10).optional().nullable(),
  capillaryGlucose: z.number().int().min(10).max(900).optional().nullable(),
  weightKg: z.number().min(0.5).max(400).optional().nullable(),
  bradenScore: z.number().int().min(6).max(23).optional().nullable(),
  sakFallScore: z.number().int().min(0).max(30).optional().nullable(),
  fluidIntakeMl: z.number().int().min(0).max(15000).optional().nullable(),
  fluidOutputMl: z.number().int().min(0).max(15000).optional().nullable(),
  fluidDescription: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const prescriptionCreateSchema = z.object({
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  type: z.enum(["MEDICA", "ENFERMAGEM"]),
  validUntilHours: z.number().min(6).max(168).default(24),
  generalNotes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        category: z.enum(["DIETA", "CUIDADO", "MEDICAMENTO"]),
        description: z.string().min(2, "Descrição do item obrigatória"),
        observation: z.string().optional().nullable(),
        dose: z.string().min(1, "Dose ou especificação obrigatória"),
        route: z.string().min(1, "Via obrigatória"),
        infusionRate: z.string().optional().nullable(),
        frequency: z.string().min(1, "Frequência obrigatória"),
        condition: z.enum(["FIXO", "SE_NECESSARIO"]).default("FIXO"),
        scheduledHours: z.array(z.string()).min(1, "Defina ao menos um horário ou SN"),
      })
    )
    .min(1, "Adicione ao menos um item na prescrição"),
});

export const medicationCheckSchema = z.object({
  prescriptionItemId: z.string().min(1, "Item prescrito obrigatório"),
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  scheduledTime: z.string().min(1, "Horário previsto obrigatório"),
  status: z.enum(["REALIZADO", "NAO_REALIZADO", "RECUSADO", "ADIADO"]),
  justification: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const examCreateSchema = z.object({
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  category: z.enum(["LABORATORIAL", "IMAGEM", "PROCEDIMENTO"]),
  code: z.string().min(2, "Código do exame/procedimento obrigatório"),
  name: z.string().min(3, "Nome do exame/procedimento obrigatório"),
  clinicalIndication: z.string().min(3, "Indicação clínica obrigatória"),
  priority: z.enum(["URGENTE", "ROTINA"]).default("ROTINA"),
  status: z.enum(["SOLICITADO", "COLETADO", "EM_ANALISE", "LAUDADO"]).default("SOLICITADO"),
  resultSummary: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
});

export const documentUploadSchema = z.object({
  encounterId: z.string().min(1, "Atendimento obrigatório"),
  title: z.string().min(3, "Título do documento obrigatório"),
  category: z.enum([
    "TERMO_CONSENTIMENTO",
    "LAUDO_EXTERNO",
    "IMAGEM_CLINICA",
    "ENCAMINHAMENTO",
    "PARECER",
  ]),
  fileName: z.string().min(3, "Nome do arquivo obrigatório"),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  fileSizeBytes: z.number().int().min(10).max(10 * 1024 * 1024, "Tamanho máximo permitido: 10 MB"),
  contentBase64: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

