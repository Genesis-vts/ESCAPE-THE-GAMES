# ESCAPE-THE-GAMES

Aplicação para ajudar pessoas com problemas com jogos a deixarem o vício de forma orgânica
e pragmática, construída em torno de um **botão de pânico** que aciona contatos previamente
autorizados por SMS, e-mail e push — com consentimento verificado, privacidade por padrão e
trilha de auditoria.

> ⚠️ **Este aplicativo não é serviço de emergência.** Ele não aciona socorro nem substitui
> atendimento profissional. Em risco imediato à vida, ligue **192** (SAMU).
> Apoio emocional gratuito e sigiloso 24 h: **188** (CVV).

---

## Começando em um comando

```bash
docker compose -f infra/docker-compose.yml up --build
```

Sobe API (`:3000`), PostgreSQL (`:5432`), Redis (`:6379`) e Mailpit (`:8025`).
Sem credenciais de provedor, as mensagens são impressas no log em vez de enviadas —
o fluxo funciona ponta a ponta sem nenhuma chave.

### Alternativa sem Docker

```bash
npm install
cp .env.example .env                       # ajuste se quiser; funciona com os padrões
npm run dev                                # API em http://localhost:3000
npm run token:dev --workspace services/api # gera um JWT de desenvolvimento
```

---

## Experimente o botão de pânico

```bash
# 1. Gere um token de desenvolvimento e exporte-o
npm run token:dev --workspace services/api
export JWT="<token impresso acima>"

# 2. Cadastre um contato de apoio (fica "pending")
curl -s -X POST "http://localhost:3000/api/v1/contacts" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Cláudia","relationship":"mãe","channel":"sms","destination":"+5511999998888","priority":1}'
```

```json
{
  "contact": {
    "id": "ct_ae945f4a-…",
    "displayName": "Cláudia",
    "channel": "sms",
    "destinationMasked": "+5511*****8888",
    "status": "pending",
    "priority": 1
  },
  "verification": {
    "verificationToken": "<token-opaco-de-verificacao>",
    "expiresAt": "2026-07-29T18:31:34.279Z",
    "channel": "sms",
    "devCode": "117391"
  }
}
```

> `devCode` só existe fora de produção. Em produção o código vai **apenas** para o contato.

```bash
# 3. Verifique o contato (double opt-in)
curl -s -X POST "http://localhost:3000/api/v1/contacts/<contactId>/verify" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"verificationToken":"<verificationToken>","code":"<devCode>"}'

# 4. Acione o botão de pânico
curl -s -X POST "http://localhost:3000/api/v1/panic" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Preciso de ajuda","location":{"lat":-23.55052,"lon":-46.633308},"triggerType":"hold"}'
```

```json
{
  "eventId": "pe_d0dada9f-…",
  "status": "queued",
  "createdAt": "2026-07-29T18:16:34.459Z",
  "recipients": [
    { "contactId": "ct_ae945f4a-…", "displayName": "Cláudia", "channel": "sms", "status": "queued" }
  ],
  "warnings": [],
  "disclaimer": "O ESCAPE-THE-GAMES não é serviço de emergência e não aciona socorro. …",
  "supportChannels": [
    { "label": "CVV — apoio emocional 24h", "phone": "188" },
    { "label": "SAMU — emergência médica", "phone": "192" }
  ]
}
```

```bash
# 5. Acompanhe a entrega por destinatário
curl -s "http://localhost:3000/api/v1/panic/<eventId>" -H "Authorization: Bearer ${JWT}"
```

O SMS gerado (impresso no log em desenvolvimento):

```
[ESCAPE-THE-GAMES] Rafael acionou o botao de apoio em 29/07, 15:16.
Mensagem: "Preciso de ajuda"
Fale com Rafael: +5511988887777
Local: https://maps.google.com/?q=-23.55052,-46.633308
Este app nao e servico de emergencia. Em risco imediato ligue 192.
Responda SAIR para nao receber mais.
```

---

## Endpoints do MVP

| Método   | Rota                             | Descrição                                                     | Limite                   |
| -------- | -------------------------------- | ------------------------------------------------------------- | ------------------------ |
| GET      | `/health`                        | Liveness/readiness                                            | 100/min por IP           |
| POST     | `/api/v1/panic`                  | Aciona o botão de pânico                                      | 5/h e 10/dia por usuário |
| GET      | `/api/v1/panic/:eventId`         | Status por destinatário                                       | —                        |
| POST     | `/api/v1/panic/:eventId/resolve` | Marca "já estou bem"                                          | —                        |
| POST     | `/api/v1/contacts`               | Cadastra contato (fica `pending`)                             | 10/h por usuário         |
| GET      | `/api/v1/contacts`               | Lista contatos                                                | —                        |
| POST     | `/api/v1/contacts/:id/verify`    | Verifica com código de 6 dígitos                              | 5/15 min                 |
| POST     | `/api/v1/contacts/:id/resend`    | Reenvia o código                                              | 3/h                      |
| DELETE   | `/api/v1/contacts/:id`           | Revoga contato                                                | —                        |
| GET/POST | `/api/v1/opt-out`                | **Público.** Descadastro do contato pelo link assinado        | 30/min por IP            |
| POST     | `/api/v1/webhooks/sms/inbound`   | **Público.** Resposta "SAIR" do contato (assinatura validada) | 30/min por IP            |

Todas as rotas `/api/v1/**` exigem `Authorization: Bearer <jwt>`, exceto as marcadas como
públicas — quem quer parar de receber mensagens que nunca pediu não deve precisar de conta.
Erros seguem o formato `{ "error": { "code", "message", "details?" } }`.

---

## Estrutura do repositório

```
ESCAPE-THE-GAMES/
├── docs/                  # documentação de produto, arquitetura e conformidade
├── services/api/          # API Node.js + TypeScript (funcional)
│   └── src/
│       ├── modules/       # panic, contacts, health
│       ├── notifications/ # templates PT-BR, fila com retry, adaptadores de provedor
│       ├── middleware/    # auth (JWT), rate limit, erros, contexto de requisição
│       ├── audit/         # log WORM com hash encadeado
│       └── repositories/  # persistência (in-memory no MVP; Postgres na sequência)
├── apps/mobile/           # React Native (scaffold documental)
├── apps/web/              # Next.js — painel clínico (scaffold documental)
├── infra/                 # docker-compose e esboço Terraform
└── .github/workflows/     # CI: lint, typecheck, testes, build, segurança
```

## Documentação

| Documento                                                              | Conteúdo                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                           | Componentes, fluxos, infraestrutura, backup/DR, ADRs                      |
| [docs/BUSINESS_PLAN.md](docs/BUSINESS_PLAN.md)                         | Proposta de valor, mercado, receita, custos, go-to-market                 |
| [docs/MVP_SPEC.md](docs/MVP_SPEC.md)                                   | Histórias de usuário, critérios de aceitação, wireframes, APIs            |
| [docs/PANIC_BUTTON_DESIGN.md](docs/PANIC_BUTTON_DESIGN.md)             | UX do botão, templates PT-BR, consentimento, limites                      |
| [docs/SECURITY_AND_COMPLIANCE.md](docs/SECURITY_AND_COMPLIANCE.md)     | **LGPD/GDPR/HIPAA**, chaves, retenção, incidentes                         |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                     | Marcos 3/6/12 meses e KPIs                                                |
| [docs/ISSUES_BACKLOG.md](docs/ISSUES_BACKLOG.md)                       | Épicos e sprints acionáveis                                               |
| [docs/CRISIS_PROTOCOL.md](docs/CRISIS_PROTOCOL.md)                     | **Protocolo de crise** — escalonamento, limites duros, governança clínica |
| [docs/FINANCIAL_CIRCUIT_BREAKER.md](docs/FINANCIAL_CIRCUIT_BREAKER.md) | Disjuntor financeiro — restrição de meios como proteção                   |
| [docs/AI_COACHING_TEAM.md](docs/AI_COACHING_TEAM.md)                   | Equipe técnica de IA — papéis, limites e anti-engajamento                 |

**Documentos legais e de conformidade** ficam em `docs/SECURITY_AND_COMPLIANCE.md`
(checklists LGPD/GDPR/HIPAA, retenção, resposta a incidentes). Termos de Uso e Política
de Privacidade voltados ao usuário final serão publicados em `apps/web/src/app/(public)/`
— ainda pendentes de revisão jurídica (`TODO [LEGAL]`).

---

## Desenvolvimento

```bash
npm run dev                                  # API em watch mode
npm test                                     # 64 testes (Jest + Supertest)
npm run test:coverage --workspace services/api
npm run lint                                 # ESLint
npm run typecheck --workspace services/api   # tsc --noEmit
npm run format                               # Prettier
```

### Convenção de commits

```
feat(docs): add ARCHITECTURE.md
feat(api): add /panic endpoint skeleton
test(api): add jest tests for panic
```

Escopos: `docs`, `api`, `mobile`, `web`, `infra`, `ci`.

### Segredos

Nenhum segredo entra no repositório. Copie `.env.example` para `.env` (ignorado pelo git)
em desenvolvimento; em qualquer outro ambiente, use o cofre de segredos da nuvem.
O CI roda `gitleaks` a cada push.

---

## Estado atual

| Área                                                                 | Estado                                     |
| -------------------------------------------------------------------- | ------------------------------------------ |
| Documentação (arquitetura, negócio, MVP, pânico, segurança, roadmap) | ✅ completa                                |
| API: `/panic`, `/contacts`, `/health`, auditoria, fila com retry     | ✅ funcional com provedores mock           |
| Adaptadores Twilio / SendGrid / FCM                                  | ✅ implementados; exigem SDK + credenciais |
| Persistência PostgreSQL (Prisma)                                     | ⬜ backlog — hoje é in-memory              |
| Autenticação completa (login, refresh, MFA)                          | ⬜ backlog — hoje só verificação de JWT    |
| App mobile e painel web                                              | ⬜ scaffold documental                     |

## Licença

MIT — ver [LICENSE](LICENSE).
