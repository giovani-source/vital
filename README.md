# HospVita PEP — Sistema Web de Prontuário Eletrônico do Paciente

Sistema web completo de **Prontuário Eletrônico do Paciente (PEP)** hospitalar, inspirado na organização operacional e ergonômica do AGHUse, com identidade visual moderna e original em português do Brasil.

> **AVISO IMPORTANTE DE SEGURANÇA E CONFORMIDADE REGULATÓRIA:**
> Este sistema foi desenvolvido para fins de engenharia de software, pesquisa, ensino e validação funcional em saúde, operando exclusivamente com **dados 100% fictícios**. O funcionamento técnico da aplicação **não equivale a certificação SBIS/CFM, homologação clínica ou acreditação hospitalar**. Veja a seção **8. Segurança, LGPD e Requisitos Pendentes de Homologação** abaixo.

---

## 1. Tecnologias Utilizadas

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Estilização & Ícones**: Tailwind CSS v4, componentes modulares estilo shadcn/ui, `lucide-react`.
- **Backend**: Route Handlers server-side em TypeScript (`/api/...`), validação com `zod`.
- **Banco de Dados & ORM**:
  - **Prisma ORM** com 22 entidades relacionais.
  - Suporte pronto para **PostgreSQL 16** via `docker-compose.yml` (`prisma/schema.postgresql.prisma`) e banco relacional SQLite persistente (`prisma/schema.prisma`) para execução local imediata sem dependência de daemon Docker.
- **Segurança**: Hash de senhas `PBKDF2-SHA512` com salt único por usuário, sessões assinadas (`HttpOnly`), bloqueio automático contra força bruta (5 tentativas), RBAC validado obrigatoriamente no backend e assinatura de integridade `SHA-256` em registros finalizados e documentos anexados.

---

## 2. Módulos Implementados

1. **Módulo 1 — Login e Controle de Acesso (`/login`)**:
   - Autenticação por identificador ou e-mail institucional + senha.
   - 6 perfis configurados com permissões distintas verificadas no backend:
     - `enf.giovani` (`Hosp@2026`) — **Enfermeiro(a)** (`COREN-RS 218490`): Acesso completo ao PEP, Avaliação de Enfermagem Horta (`*ID`, `*HD`, `*NPB`, `*NPS`, `*NPE`, `*EPS`, `*CON`), 5 etapas do Processo de Enfermagem (COFEN nº 736/2024), prescrição de cuidados e checagem beira-leito.
     - `med.helena` (`Hosp@2026`) — **Médico(a)** (`CRM-RS 45892`): Evolução médica SOAP, prescrição medicamentosa, diagnósticos CID-10, solicitação de exames e adendos.
     - `tec.marcos` (`Hosp@2026`) — **Técnico(a) de Enfermagem** (`COREN-TE 612904`): Anotações de enfermagem, controles/sinais vitais, balanço hídrico e checagem beira-leito (bloqueado no backend de registrar diagnósticos ou prescrições privativas do Enfermeiro/Médico).
     - `fisio.camila` (`Hosp@2026`) — **Fisioterapeuta** (`CREFITO-5 198432-F`): Evolução fisioterapêutica e avaliação funcional/respiratória.
     - `farm.rafael` (`Hosp@2026`) — **Farmacêutico(a) Clínico** (`CRF-RS 14820`): Evolução multiprofissional e revisão de prescrições.
     - `admin` (`Hosp@2026`) — **Administrador de TI**: Gerencia usuários, unidades e leitos em `/admin`, sendo **bloqueado automaticamente no backend** de visualizar dados clínicos sigilosos do prontuário.
   - Recuperação de acesso e desbloqueio de conta.
2. **Módulo 2 — Dashboard Hospitalar e Lista de Pacientes de Enfermagem (`/dashboard`)**:
   - Indicadores em tempo real do banco: pacientes internados, atendimentos ativos, leitos ocupados/livres, rascunhos pendentes, checagens pendentes e alertas clínicos.
   - Tabela principal fiel à ergonomia hospitalar (`Local/Leito`, `Condições/Riscos`, `Nome`, `Data Nasc.`, `Idade`, `Prontuário`, `Admissão`, `Anamnese`, `Evolução`, `Prescrição`, `Controles`, `Permanência`, `Situação` e `Ações`) + barra lateral direita de ações rápidas contextuais.
3. **Módulo 3 — Cadastro Longitudinal de Pacientes e Internações (`/pacientes`)**:
   - Cadastro completo validado com Zod, separando **Paciente** (identificador e prontuário únicos) de **Atendimento / Internação** (histórico longitudinal de múltiplas internações ao longo do tempo).
4. **Módulo 4 & 5 — Prontuário Eletrônico do Paciente (`/prontuario/[id]`)**:
   - Cabeçalho fixo com identificação completa, alertas de alergias (com **Modal de Registro de Alergia** dividido em `Medicamentos` e `Outras`) e botão de **Exportação/Impressão em PDF** auditada.
   - **10 Abas Clínicas**:
     - `1. Visão Geral`
     - `2. Histórico Clínico`
     - `3. Evoluções e Anotações` (Editor SOAP `S/O/I/C` e `Livre` com **Autosave de Rascunho**, recuperação de rascunho, **Finalização Imutável** com hash SHA-256 e **Retificação / Adendo** auditável mantendo o histórico anterior)
     - `4. Processo de Enfermagem` (As 5 etapas da Resolução COFEN nº 736/2024 + Anamnese estruturada nas abas `*ID`, `*HD`, `*NPB`, `*NPS`, `*NPE`, `*EPS`, `*CON`)
     - `5. Sinais Vitais / BH` (Sub-abas `Monitorização`, `Controle Hídrico / Balanço Hídrico` e `Gráficos de Evolução`)
     - `6. Prescrições` (Cuidados, Dieta e Medicamentos com dose, via, velocidade de infusão, frequência, condição Fixo/SN e horários)
     - `7. Checagem Beira-Leito` (Grade interativa de horários aprazados com registro de `REALIZADO`, `NAO_REALIZADO`, `RECUSADO` ou `ADIADO` e justificativa obrigatória para não realização)
     - `8. Exames e Procedimentos`
     - `9. Documentos e Anexos` (Validação de PDF/Imagem e hash SHA-256)
     - `10. Linha do Tempo` (Ordem cronológica unificada de todos os eventos do atendimento)
5. **Auditoria LGPD e Arquitetura de Expansão (`/auditoria`)**:
   - Trilha de auditoria de leituras, criações, edições, finalizações, retificações, checagens, exportações PDF e bloqueios RBAC.
   - Endpoint REST autenticado `/api/v1/integration/transport-context` preparado para futura integração com o aplicativo de **Transporte Interno de Pacientes**.

---

## 3. Como Executar Localmente

```bash
cd /Volumes/PortableSSD/PEP_Hospitalar_AGHUse

# 1. Instalar dependências (usando cache no SSD Externo)
npm install --no-bin-links --cache /Volumes/PortableSSD/.devtools/cache

# 2. Gerar cliente Prisma, sincronizar schema e popular dados fictícios de demonstração
npm run db:setup

# 3. Executar suíte de testes automatizados
npm test

# 4. Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev
```

### Execução Opcional com PostgreSQL via Docker Compose

```bash
docker compose up -d
# Altere DATABASE_URL no .env para a string PostgreSQL e execute:
npx prisma db push --schema=prisma/schema.postgresql.prisma
npm run db:seed
```

---

## 4. Segurança, LGPD e Requisitos Pendentes de Homologação

### Implementado nesta versão:
- Controle de acesso baseado em perfil (RBAC) validado em todas as rotas de API.
- Bloqueio de acesso administrativo (`ADMIN`) a informações clínicas sigilosas do PEP.
- Distinção legal entre atos privativos do Enfermeiro e atividades do Técnico de Enfermagem (Lei 7.498/86 e Resolução COFEN nº 736/2024).
- Imutabilidade de registros clínicos finalizados e suporte a adendos/retificações rastreáveis (Resolução COFEN nº 754/2024 e normas CFM/SBIS).
- Trilha de auditoria persistida em banco (`AuditLog`).

### Pendente para homologação e uso clínico real em produção:
1. **Certificação Digital ICP-Brasil**: Integração com infraestrutura de chaves públicas oficial (certificado A1/A3 ou nuvem homologada ICP-Brasil) para assinatura eletrônica qualificada conforme NGS2 SBIS/CFM.
2. **Homologação e Auditoria Externa SBIS/CFM**: Processo formal de auditoria de conformidade dos requisitos obrigatórios da Sociedade Brasileira de Informática em Saúde.
3. **Criptografia de Disco/Banco em Repouso (KMS/HSM) e Plano de Recuperação de Desastres (DRP)**: Configuração de backups automatizados criptografados com teste periódico de restauração e segregação física de rede hospitalar.
4. **Integração HL7 FHIR / PACS / LIS**: Integração bidirecional com equipamentos laboratoriais e servidores de imagem DICOM.

