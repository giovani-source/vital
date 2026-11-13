export type UserRole =
  | "ADMIN"
  | "MEDICO"
  | "ENFERMEIRO"
  | "TECNICO_ENFERMAGEM"
  | "FISIOTERAPEUTA"
  | "OUTRO_ASSISTENCIAL";

export interface RoleCapabilities {
  label: string;
  badgeColor: string;
  canViewClinicalPEP: boolean; // Admin NÃO possui autorização automática para ver dados clínicos sigilosos
  canManageUsersAndUnits: boolean;
  canRegisterPatient: boolean;
  canWriteMedicalEvolution: boolean;
  canWriteNursingEvolution: boolean;
  canWriteTechNursingNote: boolean;
  canWriteMultiprofessionalEvolution: boolean;
  canPerformNursingAssessment: boolean; // Etapa 1 - Avaliação de Enfermagem
  canPrescribeNursingDiagnosisAndPlan: boolean; // Etapas 2, 3, 4 e 5 privativas do Enfermeiro (COFEN 736/2024)
  canPrescribeMedications: boolean; // Privativo do Médico
  canPrescribeNursingCare: boolean; // Privativo do Enfermeiro / Médico
  canCheckMedicationsAndCare: boolean; // Enfermeiro e Técnico de Enfermagem
  canRecordVitalSigns: boolean;
  canRecordMedicalDiagnosis: boolean; // Privativo do Médico
  canRecordAllergies: boolean;
  canRequestExams: boolean;
  canUploadDocuments: boolean;
  canExportPDF: boolean;
}

export const ROLE_MATRIX: Record<UserRole, RoleCapabilities> = {
  ADMIN: {
    label: "Administrador Hospitalar",
    badgeColor: "bg-slate-700 text-white",
    canViewClinicalPEP: false, // Regra regulatória explícita: Admin gerencia usuários/instituições sem ver dados clínicos sigilosos
    canManageUsersAndUnits: true,
    canRegisterPatient: true,
    canWriteMedicalEvolution: false,
    canWriteNursingEvolution: false,
    canWriteTechNursingNote: false,
    canWriteMultiprofessionalEvolution: false,
    canPerformNursingAssessment: false,
    canPrescribeNursingDiagnosisAndPlan: false,
    canPrescribeMedications: false,
    canPrescribeNursingCare: false,
    canCheckMedicationsAndCare: false,
    canRecordVitalSigns: false,
    canRecordMedicalDiagnosis: false,
    canRecordAllergies: false,
    canRequestExams: false,
    canUploadDocuments: false,
    canExportPDF: false,
  },
  MEDICO: {
    label: "Médico(a)",
    badgeColor: "bg-blue-700 text-white",
    canViewClinicalPEP: true,
    canManageUsersAndUnits: false,
    canRegisterPatient: true,
    canWriteMedicalEvolution: true,
    canWriteNursingEvolution: false,
    canWriteTechNursingNote: false,
    canWriteMultiprofessionalEvolution: false,
    canPerformNursingAssessment: false,
    canPrescribeNursingDiagnosisAndPlan: false,
    canPrescribeMedications: true,
    canPrescribeNursingCare: true,
    canCheckMedicationsAndCare: true,
    canRecordVitalSigns: true,
    canRecordMedicalDiagnosis: true,
    canRecordAllergies: true,
    canRequestExams: true,
    canUploadDocuments: true,
    canExportPDF: true,
  },
  ENFERMEIRO: {
    label: "Enfermeiro(a)",
    badgeColor: "bg-emerald-700 text-white",
    canViewClinicalPEP: true,
    canManageUsersAndUnits: false,
    canRegisterPatient: true,
    canWriteMedicalEvolution: false,
    canWriteNursingEvolution: true,
    canWriteTechNursingNote: true,
    canWriteMultiprofessionalEvolution: false,
    canPerformNursingAssessment: true,
    canPrescribeNursingDiagnosisAndPlan: true, // Privativo do Enfermeiro (Lei 7.498/86 e COFEN 736/2024)
    canPrescribeMedications: false,
    canPrescribeNursingCare: true,
    canCheckMedicationsAndCare: true,
    canRecordVitalSigns: true,
    canRecordMedicalDiagnosis: false,
    canRecordAllergies: true,
    canRequestExams: false,
    canUploadDocuments: true,
    canExportPDF: true,
  },
  TECNICO_ENFERMAGEM: {
    label: "Técnico(a) de Enfermagem",
    badgeColor: "bg-teal-600 text-white",
    canViewClinicalPEP: true,
    canManageUsersAndUnits: false,
    canRegisterPatient: false,
    canWriteMedicalEvolution: false,
    canWriteNursingEvolution: false, // Privativo do Enfermeiro
    canWriteTechNursingNote: true, // Anotação de Enfermagem autorizada
    canWriteMultiprofessionalEvolution: false,
    canPerformNursingAssessment: false,
    canPrescribeNursingDiagnosisAndPlan: false, // Bloqueado: privativo do Enfermeiro
    canPrescribeMedications: false, // Bloqueado
    canPrescribeNursingCare: false, // Bloqueado: privativo do Enfermeiro
    canCheckMedicationsAndCare: true, // Autorizado para checagem beira-leito
    canRecordVitalSigns: true, // Autorizado para controles e balanço hídrico
    canRecordMedicalDiagnosis: false,
    canRecordAllergies: true,
    canRequestExams: false,
    canUploadDocuments: false,
    canExportPDF: false,
  },
  FISIOTERAPEUTA: {
    label: "Fisioterapeuta",
    badgeColor: "bg-indigo-600 text-white",
    canViewClinicalPEP: true,
    canManageUsersAndUnits: false,
    canRegisterPatient: false,
    canWriteMedicalEvolution: false,
    canWriteNursingEvolution: false,
    canWriteTechNursingNote: false,
    canWriteMultiprofessionalEvolution: true,
    canPerformNursingAssessment: false,
    canPrescribeNursingDiagnosisAndPlan: false,
    canPrescribeMedications: false,
    canPrescribeNursingCare: false,
    canCheckMedicationsAndCare: true,
    canRecordVitalSigns: true,
    canRecordMedicalDiagnosis: false,
    canRecordAllergies: true,
    canRequestExams: false,
    canUploadDocuments: true,
    canExportPDF: true,
  },
  OUTRO_ASSISTENCIAL: {
    label: "Farmacêutico(a) / Nutricionista Clínico",
    badgeColor: "bg-purple-700 text-white",
    canViewClinicalPEP: true,
    canManageUsersAndUnits: false,
    canRegisterPatient: false,
    canWriteMedicalEvolution: false,
    canWriteNursingEvolution: false,
    canWriteTechNursingNote: false,
    canWriteMultiprofessionalEvolution: true,
    canPerformNursingAssessment: false,
    canPrescribeNursingDiagnosisAndPlan: false,
    canPrescribeMedications: false,
    canPrescribeNursingCare: false,
    canCheckMedicationsAndCare: false,
    canRecordVitalSigns: false,
    canRecordMedicalDiagnosis: false,
    canRecordAllergies: true,
    canRequestExams: false,
    canUploadDocuments: true,
    canExportPDF: true,
  },
};

export function getRoleCapabilities(role: string): RoleCapabilities {
  return ROLE_MATRIX[(role as UserRole) || "OUTRO_ASSISTENCIAL"] ?? ROLE_MATRIX.OUTRO_ASSISTENCIAL;
}

export function canWriteEvolutionCategory(role: string, category: string): boolean {
  const cap = getRoleCapabilities(role);
  switch (category) {
    case "EVOLUCAO_MEDICA":
      return cap.canWriteMedicalEvolution;
    case "EVOLUCAO_ENFERMAGEM":
      return cap.canWriteNursingEvolution;
    case "ANOTACAO_TECNICO_ENF":
      return cap.canWriteTechNursingNote;
    case "EVOLUCAO_FISIOTERAPIA":
    case "EVOLUCAO_MULTIPROFISSIONAL":
      return cap.canWriteMultiprofessionalEvolution;
    default:
      return false;
  }
}

