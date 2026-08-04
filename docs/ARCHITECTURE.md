# ARQUITETURA — ESCAPE-THE-GAMES

> Documento de arquitetura do MVP. Idioma: PT-BR. Versão: 0.1.0 (fase de scaffold).
> Todos os itens que dependem de parecer jurídico ou clínico estão marcados com `TODO [LEGAL]` / `TODO [CLINICAL]`.

---

## 1. Visão geral do produto

ESCAPE-THE-GAMES é um produto de saúde comportamental voltado a pessoas que sofrem com uso
problemático de jogos eletrônicos (gaming disorder, CID-11 6C51). O produto combina:

- **Autoconhecimento**: triagem inicial e acompanhamento de sintomas.
- **Autorregulação**: metas de tempo, registros de gatilhos, exercícios baseados em TCC
  (Terapia Cognitivo-Comportamental).
- **Rede de apoio**: um **botão de pânico** que aciona contatos previamente autorizados
  por SMS, e-mail e push quando o usuário sente que vai recair ou entra em crise.
- **Painel clínico**: visão longitudinal para o profissional de saúde que acompanha o caso.

O botão de pânico é o núcleo diferenciador e também o componente de maior risco
(privacidade, latência, falso positivo, responsabilidade). Toda a arquitetura foi desenhada
em torno de sua confiabilidade.

### 1.1 Princípios arquiteturais

| #   | Princípio                                           | Consequência prática                                                                                   |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| P1  | **O acionamento nunca pode falhar silenciosamente** | Persistência do evento antes do envio; fila com retry e DLQ; status por destinatário.                  |
| P2  | **Consentimento é dado de primeira classe**         | Contato só recebe notificação após verificação por código (double opt-in) e mantém opt-out permanente. |
| P3  | **Minimização de dados**                            | Geolocalização é opcional e por evento; conteúdo clínico não trafega para provedores de notificação.   |
| P4  | **Auditabilidade WORM**                             | Log de auditoria append-only, sem UPDATE/DELETE, com hash encadeado.                                   |
| P5  | **Sem promessa de emergência**                      | O produto **não** substitui serviços de emergência; todo canal exibe disclaimer. `TODO [LEGAL]`        |
| P6  | **Provider-agnóstico**                              | Twilio/SendGrid/FCM atrás de interfaces (`SmsProvider`, `EmailProvider`, `PushProvider`).              |

---

## 2. Componentes

```
                          ┌───────────────────────────────┐
                          │        Usuários finais        │
                          └───────────────────────────────┘
                              │                    │
                   ┌──────────▼─────────┐  ┌───────▼──────────┐
                   │  apps/mobile       │  │  apps/web        │
                   │  React Native      │  │  Next.js         │
                   │  (iOS/Android)     │  │  (painel clínico │
                   │  Botão de pânico   │  │   + landing)     │
                   └──────────┬─────────┘  └───────┬──────────┘
                              │  HTTPS/TLS 1.2+    │
                              └─────────┬──────────┘
                                        │
                             ┌──────────▼───────────┐
                             │   API Gateway / WAF  │
                             │  (rate limit L7,     │
                             │   TLS termination)   │
                             └──────────┬───────────┘
                                        │
                     ┌──────────────────▼────────────────────┐
                     │        services/api (Node + TS)       │
                     │  ┌──────────┬───────────┬───────────┐ │
                     │  │  auth    │  panic    │ contacts  │ │
                     │  │  (JWT)   │  module   │  module   │ │
                     │  └──────────┴─────┬─────┴───────────┘ │
                     │  ┌────────────────▼──────────────────┐│
                     │  │ NotificationQueue (fan-out+retry) ││
                     │  └────────────────┬──────────────────┘│
                     └───────────────────┼───────────────────┘
                                         │
        ┌────────────────┬───────────────┼───────────────┬────────────────┐
        │                │               │               │                │
┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
│ PostgreSQL   │ │ Redis        │ │ Twilio      │ │ SendGrid    │ │ FCM / APNs   │
│ (dados +     │ │ (rate limit, │ │ (SMS)       │ │ (e-mail)    │ │ (push)       │
│  audit WORM) │ │  fila, cache)│ │             │ │             │ │              │
└──────────────┘ └──────────────┘ └─────────────┘ └─────────────┘ └──────────────┘
                                         │
                                 ┌───────▼────────┐
                                 │ Observabilidade │
                                 │ Sentry + OTel   │
                                 └────────────────┘
```

### 2.1 Descrição por componente

| Componente      | Tecnologia                                | Responsabilidade                                                    | Estado no MVP                           |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `apps/mobile`   | React Native 0.74+, TypeScript            | Onboarding, diário, metas, **botão de pânico**, push token          | Scaffold + README                       |
| `apps/web`      | Next.js 14 (App Router)                   | Landing, painel clínico, aceite de convite de contato               | Scaffold + README                       |
| `services/api`  | Node 20 + TypeScript + Express            | Regras de negócio, autenticação, fan-out de notificações, auditoria | **Funcional (mock providers)**          |
| Banco           | PostgreSQL 16                             | Dados relacionais + tabela WORM de auditoria                        | docker-compose                          |
| Cache/Fila      | Redis 7                                   | Rate limit distribuído, fila de notificações (BullMQ na v1)         | docker-compose; MVP usa fila in-process |
| SMS             | Twilio Programmable Messaging             | Envio de SMS aos contatos                                           | Adaptador com stub                      |
| E-mail          | SendGrid                                  | Envio de e-mail transacional                                        | Adaptador com stub                      |
| Push            | FCM (Android/iOS) + APNs                  | Push ao próprio usuário e a contatos com o app                      | Adaptador stub                          |
| WhatsApp        | **Somente deep link** `https://wa.me/...` | Fallback manual — sem envio automático no MVP                       | Deep link gerado pela API               |
| Observabilidade | Sentry + OpenTelemetry                    | Erros, traces, métricas de latência do `/panic`                     | DSN via ENV                             |

> **Restrição de produto:** o envio automático por WhatsApp exige WhatsApp Business API com
> templates aprovados (HSM) e opt-in registrado. No MVP entregamos apenas _deep link_
> gerado no cliente/no painel, acionado manualmente pelo usuário. `TODO [LEGAL]`

---

## 3. Fluxos principais

### 3.1 Fluxo do botão de pânico (caminho crítico)

```
Usuário                Mobile                 API                    Fila            Providers
  │                      │                     │                       │                 │
  │ pressiona 1.5s ─────►│                     │                       │                 │
  │                      │ POST /api/v1/panic  │                       │                 │
  │                      │ Bearer JWT          │                       │                 │
  │                      ├────────────────────►│                       │                 │
  │                      │                     │ 1. authn/authz        │                 │
  │                      │                     │ 2. rate limit         │                 │
  │                      │                     │ 3. valida payload     │                 │
  │                      │                     │ 4. PERSISTE evento    │                 │
  │                      │                     │    (status=queued)    │                 │
  │                      │                     │ 5. audit log (WORM)   │                 │
  │                      │                     │ 6. seleciona contatos │                 │
  │                      │                     │    verificados+ativos │                 │
  │                      │  200 {eventId,      │                       │                 │
  │◄─────────────────────┤   recipients[]}     │                       │                 │
  │  feedback háptico    │◄────────────────────┤ 7. enfileira ─────────►│                 │
  │  + tela de apoio     │                     │                       │ 8. despacha ───►│
  │                      │                     │                       │◄─ ack/erro ─────┤
  │                      │                     │◄─ atualiza status ────┤                 │
  │                      │ GET /panic/:id  ────►│                       │                 │
  │◄─ "2 de 3 avisados" ─┤◄────────────────────┤                       │                 │
```

**Garantias:**

- A resposta HTTP **não** espera os provedores (p95 alvo < 400 ms). O envio é assíncrono.
- O evento é persistido **antes** do enfileiramento (write-ahead): nenhum acionamento se perde.
- Retentativas: 3 tentativas com backoff exponencial (2s, 8s, 30s) por destinatário; após isso
  o destinatário fica `failed` e o usuário vê essa informação na tela de acompanhamento.
- Idempotência: header opcional `Idempotency-Key`; acionamentos duplicados em janela de 60 s
  retornam o mesmo `eventId`.

### 3.2 Fluxo de cadastro e verificação de contato (double opt-in)

```
Usuário adiciona contato ──► POST /api/v1/contacts (status=pending)
        │
        ├─► API gera código de 6 dígitos (TTL 15 min, hash armazenado)
        │   e envia ao CONTATO pelo canal declarado, com texto de consentimento
        │
        ├─► Contato informa o código ao usuário (ou via link web)
        │
        └─► POST /api/v1/contacts/:id/verify {code}
                 └─► status=verified, consentAt=now, consentVersion=v1
                     audit: CONTACT_VERIFIED
```

- Contato não verificado **nunca** recebe notificação de pânico.
- Todo SMS/e-mail enviado ao contato traz instrução de opt-out (`SAIR` / link de descadastro).
- O opt-out é permanente por (canal, destino) e sobrepõe qualquer novo cadastro. `TODO [LEGAL]`

### 3.3 Fluxo de autenticação

- **MVP:** JWT (HS256) emitido pelo serviço de auth próprio, TTL de 15 min + refresh token
  rotativo de 30 dias (armazenado com hash, revogável).
- **v1:** migração para OAuth2/OIDC (Auth0 ou Keycloak), RS256 com JWKS, permitindo SSO para
  clínicas parceiras.
- Claims mínimas: `sub` (userId), `roles` (`user` | `clinician` | `admin`), `iat`, `exp`, `jti`.
- Todo endpoint `/api/v1/**` (exceto `/health` e `/auth/**`) exige `Authorization: Bearer`.

---

## 4. Modelo de dados (lógico)

```
users
  id (uuid, pk) · displayName · email (cripto) · phone (cripto) · locale · timezone
  createdAt · deletedAt (soft delete) · consentVersion · riskFlags (jsonb)

contacts
  id (uuid, pk) · userId (fk) · displayName · relationship
  channel (enum: sms|email|push|whatsapp_deeplink)
  destination (cripto: telefone E.164 ou e-mail) · destinationHash (busca/opt-out)
  status (enum: pending|verified|revoked) · verificationCodeHash · verificationExpiresAt
  consentAt · consentVersion · priority (int) · createdAt · revokedAt

panic_events
  id (uuid, pk) · userId (fk) · triggerType (enum: tap|hold)
  message (cripto, opcional) · lat · lon · locationAccuracy (opcional)
  status (enum: queued|dispatching|partial|delivered|failed)
  idempotencyKey · createdAt · resolvedAt · clientRequestId

panic_notifications
  id (uuid, pk) · panicEventId (fk) · contactId (fk) · channel
  status (enum: queued|sent|delivered|failed|skipped) · providerMessageId
  attempts (int) · lastError · sentAt · deliveredAt

audit_log  (WORM — append-only)
  id (bigserial, pk) · occurredAt · actorId · actorType · action · entityType · entityId
  metadata (jsonb, sem PII) · prevHash · hash (SHA-256 encadeado)

sessions / refresh_tokens · consents · clinician_links · usage_goals · journal_entries
```

**Criptografia em repouso:** colunas com PII sensível (`email`, `phone`, `destination`,
`message`) usam envelope encryption — chave de dados por registro, cifrada por uma KEK no
KMS (AWS KMS / GCP KMS). Detalhes em [SECURITY_AND_COMPLIANCE.md](./SECURITY_AND_COMPLIANCE.md).

---

## 5. Camadas do `services/api`

```
src/
  app.ts                  → composição do Express (middlewares, rotas, error handler)
  index.ts                → bootstrap HTTP + graceful shutdown
  config/env.ts           → leitura e validação das variáveis de ambiente (zod)
  middleware/
    requestContext.ts     → requestId + logger por requisição
    auth.ts               → verificação do JWT, injeta req.auth
    rateLimit.ts          → limitador por chave (memória no MVP, Redis na v1)
    errorHandler.ts       → tratamento centralizado de erros
  modules/
    panic/                → rotas, schema (zod), service, controller
    contacts/             → rotas, schema, service, controller
    health/
  notifications/
    templates.ts          → templates PT-BR de SMS/e-mail/push
    queue.ts              → fila in-process com retry/backoff (BullMQ na v1)
    providers/            → SmsProvider | EmailProvider | PushProvider + implementações
  repositories/inMemory.ts→ persistência de MVP (trocar por Prisma/Postgres)
  audit/auditLog.ts       → registro WORM com hash encadeado
  errors/AppError.ts      → erros de domínio tipados
  utils/                  → logger, crypto, id
```

**Regra de dependência:** `controller → service → repository/provider`. Controllers não
conhecem SDKs; services não conhecem Express. Isso permite testar `/panic` com providers
falsos (ver `src/__tests__`).

---

## 6. Infraestrutura

### 6.1 Ambientes

| Ambiente  | Uso                                               | Dados                            |
| --------- | ------------------------------------------------- | -------------------------------- |
| `local`   | docker-compose (API + Postgres + Redis + Mailpit) | sintéticos                       |
| `dev`     | integração contínua, deploy a cada merge          | sintéticos                       |
| `staging` | homologação clínica e testes de carga             | sintéticos/anonimizados          |
| `prod`    | produção                                          | reais — acesso mínimo e auditado |

> **Proibido** copiar dados de produção para ambientes inferiores. `TODO [LEGAL]`

### 6.2 Topologia alvo (nuvem — região `sa-east-1`, São Paulo)

- **Compute:** containers da API em ECS Fargate (ou Cloud Run), mínimo 2 tarefas, autoscaling
  por CPU e por profundidade da fila.
- **Banco:** RDS PostgreSQL Multi-AZ, storage criptografado (KMS), backups automáticos.
- **Cache/Fila:** ElastiCache Redis (Multi-AZ) — filas BullMQ para notificações.
- **Segredos:** AWS Secrets Manager / SSM Parameter Store. **Nenhum segredo em repositório.**
- **Rede:** API em subnets privadas; ALB público com WAF (regras OWASP + rate limit L7).
- **Residência de dados:** dados pessoais permanecem em região brasileira. Transferência
  internacional só para subprocessadores com cláusulas contratuais adequadas. `TODO [LEGAL]`

### 6.3 Escalabilidade

| Dimensão             | Estratégia                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| API stateless        | escala horizontal; nenhuma sessão em memória                                      |
| Picos de acionamento | fila absorve rajadas; a API só grava e enfileira                                  |
| Rate limit           | Redis (token bucket) compartilhado entre instâncias                               |
| Banco                | réplicas de leitura para o painel clínico; particionamento de `audit_log` por mês |
| Provedores           | limites de taxa por provedor + circuit breaker + fallback de canal                |

**Alvos de desempenho (MVP):** `POST /panic` p95 < 400 ms; primeira notificação despachada em
< 5 s p95; disponibilidade mensal alvo 99,5%.

### 6.4 Backup e DR

| Item        | RPO   | RTO    | Método                                                                           |
| ----------- | ----- | ------ | -------------------------------------------------------------------------------- |
| PostgreSQL  | 5 min | 1 h    | Backup automático + PITR (WAL); snapshot diário retido 35 dias                   |
| `audit_log` | 5 min | 4 h    | Export diário para bucket com Object Lock (WORM), retenção 5 anos `TODO [LEGAL]` |
| Redis       | 1 h   | 15 min | Dados efêmeros; recriável — fila re-hidratada a partir de `panic_notifications`  |
| Segredos    | —     | 1 h    | Versionamento no Secrets Manager                                                 |
| IaC         | —     | 2 h    | Terraform versionado; ambiente reconstruível do zero                             |

Teste de restauração: trimestral, com registro em ata. Simulação de falha de provedor
(Twilio fora) exercitada em staging a cada release maior.

---

## 7. Observabilidade

- **Logs estruturados** (JSON) com `requestId`, `userId` pseudonimizado, sem conteúdo de
  mensagem. Retenção 90 dias; auditoria 5 anos.
- **Métricas-chave:** `panic_events_total`, `panic_dispatch_latency_seconds`,
  `notification_failures_total{provider}`, `contacts_verified_ratio`.
- **Alertas (PagerDuty/Opsgenie):**
  - taxa de falha de notificação de pânico > 5% em 5 min → **P1**;
  - p95 de `/panic` > 1 s por 10 min → P2;
  - fila com profundidade > 500 → P2.
- **Sentry** para exceções (scrubbing de PII habilitado — `beforeSend` remove `message`,
  `destination`, `lat`, `lon`).

---

## 8. Decisões arquiteturais (ADR resumido)

| ID      | Decisão                                                | Alternativas             | Justificativa                                                                                  |
| ------- | ------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------- |
| ADR-001 | Monorepo único (npm workspaces)                        | polirepo                 | Time pequeno; contratos compartilhados; PRs atômicos                                           |
| ADR-002 | Express + TypeScript no MVP                            | NestJS, Fastify          | Menor tempo até o primeiro endpoint; migração a NestJS prevista na v1 quando houver ≥3 módulos |
| ADR-003 | Fila in-process no MVP, BullMQ/Redis na v1             | SQS desde o início       | Evita infra externa para rodar local; interface `NotificationQueue` isola a troca              |
| ADR-004 | PostgreSQL como banco único                            | Mongo, DynamoDB          | Relacionamentos fortes (usuário↔contatos↔eventos) e necessidade de auditoria transacional      |
| ADR-005 | Double opt-in obrigatório para contatos                | opt-in simples           | Base legal e antiabuso: impede uso do app para spam/assédio                                    |
| ADR-006 | WhatsApp apenas por deep link                          | Business API no MVP      | Aprovação de template e opt-in demandam prazo; risco de bloqueio                               |
| ADR-007 | Providers atrás de interface                           | SDK direto no controller | Testabilidade, troca de fornecedor, custo                                                      |
| ADR-008 | Auditoria WORM com hash encadeado                      | log comum                | Prova de integridade em investigação/incidente                                                 |
| ADR-009 | Workbench de pesquisa **adiado**, com gatilho definido | adotar agora             | Ver detalhamento abaixo                                                                        |
| ADR-010 | **Verticalizar** em jogo e aposta; não generalizar     | plataforma horizontal    | Ver detalhamento abaixo                                                                        |

### ADR-009 — Ferramenta de análise de pesquisa: adiar, com gatilho

**Contexto.** Avaliamos o **Claude Science** (workbench de pesquisa da Anthropic, beta,
executa localmente em macOS/Linux; execução de Python/R/shell, conectores, ~60 skills
curadas, artefatos reprodutíveis e um agente revisor que sinaliza números sem
procedência rastreável).

**Decisão: não adotar agora.**

Para o **produto**, não se aplica — não roda em produção e não serve nenhum endpoint.
A camada de IA do [AI_COACHING_TEAM.md](./AI_COACHING_TEAM.md) depende da **API do
Claude**, não de um workbench; e continua bloqueada pelos portões de governança do E9,
que são decisão de gestão clínica, não escolha de ferramenta.

Para o **braço de pesquisa** o encaixe é real — o agente revisor automatiza a
disciplina de procedência ✅/⚠️/🔶/🔒 do [DATA_SOURCES.md](./DATA_SOURCES.md), o
artefato carrega o código e o ambiente que o geraram (formato que comitê de ética e
publicação exigem), e a execução local mantém microdado de saúde dentro da instituição.
**Mas as três ações que mais destravam o projeto hoje não são análise:** o pedido via
LAI à SPA/MF, a carta ao PRO-AMITI, e a nomeação de diretor clínico. Nenhum workbench
resolve nenhuma delas. Adotar ferramenta antes de ter dado e parceria repete o erro do
plano de R$ 650 mil já corrigido no [BUSINESS_PLAN.md](./BUSINESS_PLAN.md).

**Gatilho para reavaliar — qualquer um dos dois:**

1. A parceria com o IPq HC-FMUSP sair e existir **coorte para analisar** (é o caso da
   validação do NODS-3-BR na nossa população, épico E12).
2. A resposta da **LAI** chegar com série histórica e recorte demográfico.

**Ressalvas registradas:** as skills curadas são de genômica, proteômica, biologia
estrutural e química — o nosso domínio é **epidemiologia e psicometria**, então a maior
parte não se aplica; serve o substrato genérico (execução local, conectores de
literatura, reprodutibilidade, revisor). E a descrição do produto veio de **cobertura
secundária** — `anthropic.com` e `claude.com` estão fora da allowlist de egresso desta
sessão ([DATA_SOURCES.md §7](./DATA_SOURCES.md)). Confirmar na fonte antes de comprar.

### ADR-010 — Verticalizar em jogo e aposta; a plataforma emerge depois

**Contexto.** Boa parte do que foi construído não é específica de jogo. Separando por
transferibilidade, são três camadas bem distintas:

| Camada                                  | O que é                                                                                             | Transferível?                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1. Infraestrutura genérica              | Fila com retry, adaptadores de provedor, rate limit, JWT, envelope de erro                          | Sim, mas vale pouco — existe pronto |
| 2. Primitivas de consentimento e trilha | Duplo opt-in, opt-out por token HMAC, blocklist permanente, WORM encadeado, status por destinatário | **Sim — é o ativo reaproveitável**  |
| 3. Semântica clínica                    | NODS-3-BR, OGD-Q, escada de crise, _chasing_, moderação × abstinência                               | **Não** — muda por transtorno       |

A camada 2 resolve um problema genérico e difícil: notificar terceiros a respeito de uma
pessoa, com consentimento verificado, saída real garantida e registro inviolável. Serve a
qualquer domínio que toque rede de apoio. E a ideia mais portátil do projeto não é código
nenhum — é a tese da **camada contínua entre atendimentos episódicos**, que descreve uma
lacuna existente em toda condição crônica, não só em jogo.

**Decisão: verticalizar.** Aprofundar o domínio de jogo e aposta até ter validação
clínica, e só então considerar extensão. A plataforma, se vier, vem como subproduto
validado — não como ponto de partida.

**Justificativa.** O ativo mais escasso deste projeto é credibilidade clínica, que é a
única coisa que ele não consegue comprar. Anunciar plataforma horizontal antes de ter uma
vertical validada converte o projeto, aos olhos de um grupo de pesquisa, de parceiro
científico em fornecedor de tecnologia — e é o caminho mais curto para perder a parceria
que hoje destrava o instrumento, o comitê de ética e a coorte.

**A disciplina que preserva a opção.** Manter as primitivas da camada 2 **sem acoplamento
com semântica de jogo**, para que uma extração futura seja refatoração e não reescrita.

**Verificação do estado atual (feita, não presumida).** `audit/`, `modules/optout/` e
`modules/contacts/` não importam nada de `panic`, `screening`, `journal` ou `goals`. A
dependência existente é a esperada e no sentido correto: opt-out revoga contato.

A **única exceção** é `AuditAction`, em `audit/auditLog.ts`: união fechada que enumera
ações do domínio (`PANIC_TRIGGERED`, `SCREENING_COMPLETED`, `JOURNAL_ENTRY_CREATED`,
`GOAL_LAPSE_REGISTERED`). O núcleo de auditoria conhece, portanto, o vocabulário deste
produto.

**Decisão sobre a exceção: não corrigir agora.** Generalizar esse tipo hoje seria
construir para um reúso que acabamos de adiar — exatamente o erro que este ADR evita. O
acoplamento é de **um tipo, em um arquivo**, e a união fechada tem valor real enquanto o
produto é um só: o compilador recusa ação de auditoria inventada. Fica registrado como
dívida deliberada, com custo de desfazer conhecido e baixo.

**Gatilho para reavaliar:** um segundo transtorno entrar em escopo com meta terapêutica
própria, ou um parceiro institucional pedir a camada de consentimento e trilha sem a
semântica de jogo. Antes disso, discussão de plataforma é prematura por um motivo
concreto: persistência e fila ainda são em memória (E1 e E3), e é justamente a parte que
precisaria ser sólida para sustentar reúso.

---

## 9. Riscos técnicos abertos

| Risco                                                  | Impacto     | Mitigação                                                                                           |
| ------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------- |
| Entregabilidade de SMS no Brasil (filtro de operadora) | Alto        | Remetente registrado, template estável, fallback e-mail/push, monitorar taxa de entrega             |
| Falso positivo do botão (acionamento acidental)        | Médio       | `hold` de 1,5 s como padrão; janela de cancelamento de 5 s antes do despacho                        |
| Latência de push em Android com bateria otimizada      | Médio       | SMS/e-mail como canais primários; push é complementar                                               |
| Custo de SMS em escala                                 | Médio       | Priorizar push para contatos com app; limite diário por usuário                                     |
| Mensagem com risco de autoagressão                     | **Crítico** | Fluxo de triagem + disclaimer + orientação para CVV 188 / SAMU 192 `TODO [CLINICAL]` `TODO [LEGAL]` |
| Vazamento de PII em logs                               | Alto        | Scrubbing central, revisão de PR obrigatória, teste automatizado de redaction                       |

---

## 10. Referências internas

- [MVP_SPEC.md](./MVP_SPEC.md) — histórias e critérios de aceitação
- [PANIC_BUTTON_DESIGN.md](./PANIC_BUTTON_DESIGN.md) — UX e templates
- [SECURITY_AND_COMPLIANCE.md](./SECURITY_AND_COMPLIANCE.md) — LGPD/GDPR/HIPAA
- [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) — modelo de negócio
- [ROADMAP.md](./ROADMAP.md) — marcos e KPIs
