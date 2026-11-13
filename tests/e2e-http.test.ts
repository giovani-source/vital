import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3000";

function extractCookie(res: Response): string {
  const setCookie = res.headers.get("set-cookie") || "";
  const match = setCookie.match(/pep_session_token=[^;]+/);
  return match ? match[0] : "";
}

describe("Fluxo Principal Ponta a Ponta (13 Etapas da Seção 11 via Servidor HTTP Real)", () => {
  it("Executa os 13 passos completos com persistência real, troca de sessão, RBAC e auditoria", async () => {
    // Passo 1: Acessa a página web de login
    const loginPageRes = await fetch(`${BASE_URL}/login`);
    expect(loginPageRes.status).toBe(200);
    const loginHtml = await loginPageRes.text();
    expect(loginHtml).toContain("HospVita PEP");

    // Passo 2: Realiza login como Enfermeiro (enf.giovani)
    const loginEnfRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "enf.giovani", password: "Hosp@2026" }),
    });
    expect(loginEnfRes.status).toBe(200);
    const enfCookie = extractCookie(loginEnfRes);
    expect(enfCookie).toContain("pep_session_token=");

    // Passo 3: Visualiza o dashboard hospitalar
    const dashRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { Cookie: enfCookie },
    });
    expect(dashRes.status).toBe(200);
    const dashData = await dashRes.json();
    expect(dashData.kpis.admittedPatients).toBeGreaterThanOrEqual(7);

    // Passo 4: Pesquisa ou seleciona o paciente JOSE LUIS RIBEIRO RODRIGUES (7834153)
    const searchRes = await fetch(`${BASE_URL}/api/patients?q=7834153`, {
      headers: { Cookie: enfCookie },
    });
    expect(searchRes.status).toBe(200);
    const searchData = await searchRes.json();
    expect(searchData.patients.length).toBe(1);
    const patientId = searchData.patients[0].id;

    // Passo 5 e 6: Abre o prontuário e consulta o histórico clínico e o atendimento ativo
    const pepRes = await fetch(`${BASE_URL}/api/pep/7834153`, {
      headers: { Cookie: enfCookie },
    });
    expect(pepRes.status).toBe(200);
    const pepData = await pepRes.json();
    expect(pepData.patient.chartNumber).toBe("7834153");
    expect(pepData.activeEncounter).not.toBeNull();
    expect(pepData.patient.encounters.length).toBeGreaterThanOrEqual(2);
    const encounterId = pepData.activeEncounter.id;

    // Passo 7, 8 e 9: Seleciona Evolução de Enfermagem, preenche informações e salva um rascunho
    const uniqueMarker = `EVOLUCAO-E2E-${Date.now()}`;
    const draftRes = await fetch(`${BASE_URL}/api/pep/${patientId}/evolutions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: enfCookie,
      },
      body: JSON.stringify({
        encounterId,
        category: "EVOLUCAO_ENFERMAGEM",
        format: "SOAP",
        title: `Evolução de Enfermagem E2E (${uniqueMarker})`,
        subjective: "Paciente tranquilo no leito 0551A, nega dor ou náusea.",
        objective: "Afebril, normotenso, cateter central pérvio com infusão regular.",
        impression: "Estabilidade clínica mantida durante protocolo.",
        conduct: "Mantida vigilância de enfermagem e balanço hídrico 6/6h.",
        finalize: false,
      }),
    });
    expect(draftRes.status).toBe(200);
    const draftJson = await draftRes.json();
    expect(draftJson.evolution.status).toBe("RASCUNHO");
    const createdEvolutionId = draftJson.evolution.id;

    // Passo 10: Finaliza o registro clínico
    const finalizeRes = await fetch(`${BASE_URL}/api/pep/${patientId}/evolutions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: enfCookie,
      },
      body: JSON.stringify({
        id: createdEvolutionId,
        encounterId,
        category: "EVOLUCAO_ENFERMAGEM",
        format: "SOAP",
        title: `Evolução de Enfermagem E2E (${uniqueMarker})`,
        subjective: "Paciente tranquilo no leito 0551A, nega dor ou náusea.",
        objective: "Afebril, normotenso, cateter central pérvio com infusão regular.",
        impression: "Estabilidade clínica mantida durante protocolo.",
        conduct: "Mantida vigilância de enfermagem e balanço hídrico 6/6h.",
        finalize: true,
      }),
    });
    expect(finalizeRes.status).toBe(200);
    const finalizeJson = await finalizeRes.json();
    expect(finalizeJson.evolution.status).toBe("FINALIZADO");
    expect(finalizeJson.evolution.signatureHash).toBeTruthy();

    // Passo 11: Verifica se o documento passou a integrar a Linha do Tempo
    const pepAfterRes = await fetch(`${BASE_URL}/api/pep/7834153?silent=1`, {
      headers: { Cookie: enfCookie },
    });
    const pepAfterData = await pepAfterRes.json();
    const inTimeline = pepAfterData.timeline.some((ev: { title: string }) =>
      ev.title.includes(uniqueMarker)
    );
    expect(inTimeline).toBe(true);

    // Encerra a sessão do Enfermeiro
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: enfCookie },
    });

    // Passo 12: Outro profissional autorizado (Médica Dra. Helena) efetua login e consulta o registro salvo
    const loginMedRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "med.helena", password: "Hosp@2026" }),
    });
    expect(loginMedRes.status).toBe(200);
    const medCookie = extractCookie(loginMedRes);

    const medPepRes = await fetch(`${BASE_URL}/api/pep/7834153`, {
      headers: { Cookie: medCookie },
    });
    expect(medPepRes.status).toBe(200);
    const medPepData = await medPepRes.json();
    const visibleToDoctor = medPepData.patient.evolutions.some(
      (e: { id: string; status: string }) =>
        e.id === createdEvolutionId && e.status === "FINALIZADO"
    );
    expect(visibleToDoctor).toBe(true);

    // Verifica também que Técnico de Enfermagem é bloqueado no backend se tentar criar Diagnóstico de Enfermagem (COFEN 736/2024)
    const loginTecRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "tec.marcos", password: "Hosp@2026" }),
    });
    const tecCookie = extractCookie(loginTecRes);
    const forbiddenNursingRes = await fetch(
      `${BASE_URL}/api/pep/${patientId}/nursing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: tecCookie,
        },
        body: JSON.stringify({
          recordType: "PROCESS_PLAN",
          encounterId,
          assessmentSummary: "Tentativa não autorizada",
          nursingDiagnosisCode: "00004",
          nursingDiagnosisTitle: "Risco de Infecção",
          domainClass: "Segurança",
          relatedFactors: "Invasivo",
          expectedOutcomes: "Meta",
          interventions: "Cuidado",
        }),
      }
    );
    expect(forbiddenNursingRes.status).toBe(403);

    // Verifica que Administrador é bloqueado no backend se tentar visualizar o PEP sigiloso
    const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "admin", password: "Hosp@2026" }),
    });
    const adminCookie = extractCookie(loginAdminRes);
    const forbiddenAdminPepRes = await fetch(`${BASE_URL}/api/pep/7834153`, {
      headers: { Cookie: adminCookie },
    });
    expect(forbiddenAdminPepRes.status).toBe(403);

    // Passo 13: Verifica que a Auditoria registrou os acessos, criações, finalizações e bloqueios
    const auditRes = await fetch(`${BASE_URL}/api/audit`, {
      headers: { Cookie: medCookie },
    });
    expect(auditRes.status).toBe(200);
    const auditData = await auditRes.json();
    expect(
      auditData.logs.some((l: { action: string }) => l.action === "CREATE_DRAFT")
    ).toBe(true);
    expect(
      auditData.logs.some((l: { action: string }) => l.action === "FINALIZE_RECORD")
    ).toBe(true);
    expect(
      auditData.logs.some((l: { action: string }) => l.action === "ACCESS_DENIED")
    ).toBe(true);
  });
});

