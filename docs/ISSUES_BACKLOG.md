# BACKLOG INICIAL — épicos, issues e sprints

> Lista acionável para abertura das issues no GitHub. Estimativas em pontos
> (1 ≈ meio dia de uma pessoa). Prioridade: **P0** bloqueia o MVP · P1 importante · P2 desejável.

---

## E1 — Persistência real (PostgreSQL + Prisma) · P0 · 21 pts

**Por quê:** hoje tudo vive em memória; um restart perde acionamentos e consentimentos.

- [ ] `chore(api)`: adicionar Prisma, `schema.prisma` e migração inicial — 5 pts
- [ ] `feat(api)`: implementar `UserRepository`, `ContactRepository`, `PanicRepository`
      sobre Postgres, mantendo as interfaces atuais — 8 pts
- [ ] `feat(api)`: tabela `audit_log` append-only (revogar UPDATE/DELETE por GRANT) + script
      de verificação em CI — 5 pts
- [ ] `test(api)`: suíte de integração com Postgres em container (Testcontainers) — 3 pts

**Aceite:** `docker compose up` sobe com Postgres; testes de integração verdes; script prova
que `UPDATE`/`DELETE` em `audit_log` falha.

---

## E2 — Autenticação completa · P0 · 18 pts

- [ ] `feat(api)`: cadastro com senha (Argon2id) e verificação de e-mail — 5 pts
- [ ] `feat(api)`: `POST /auth/login` e `POST /auth/refresh` com rotação de refresh token
      e revogação de família em caso de reuso — 5 pts
- [ ] `feat(api)`: bloqueio progressivo após tentativas malsucedidas — 3 pts
- [ ] `feat(api)`: `GET /me`, `PATCH /me` e registro de consentimento versionado — 3 pts
- [ ] `test(api)`: cobertura dos fluxos de token, incluindo reuso de refresh — 2 pts

**Aceite:** login ponta a ponta; token expirado rejeitado; reuso de refresh invalida a família.

---

## E3 — Endurecimento do botão de pânico · P0 · 21 pts

- [ ] `feat(api)`: fila em Redis/BullMQ substituindo a fila in-process, com DLQ — 8 pts
- [ ] `feat(api)`: reconciliação de notificações `queued` órfãs após restart — 3 pts
- [ ] `feat(api)`: circuit breaker por provedor + fallback de canal — 5 pts
- [ ] `feat(api)`: webhooks de status (Twilio/SendGrid) → `delivered`/`failed` reais — 3 pts
- [ ] `feat(api)`: normalização de telefone com `libphonenumber-js` por país do perfil — 2 pts

**Aceite:** matar o processo durante o fan-out não perde notificação; teste de carga com
Twilio indisponível ainda entrega por e-mail.

---

## E4 — App mobile: onboarding e botão de pânico · P0 · 34 pts

- [ ] `chore(mobile)`: inicializar React Native + TypeScript + navegação + CI — 5 pts
- [ ] `feat(mobile)`: cadastro, login e armazenamento seguro do token (Keychain/Keystore) — 5 pts
- [ ] `feat(mobile)`: **botão de pânico** com `hold` de 1,5 s, cancelamento de 5 s e háptico — 8 pts
- [ ] `feat(mobile)`: fila offline com `Idempotency-Key` e reenvio automático — 5 pts
- [ ] `feat(mobile)`: tela de acompanhamento com status por contato + respiração guiada — 5 pts
- [ ] `feat(mobile)`: gestão da rede de apoio (cadastro, verificação, remoção) — 5 pts
- [ ] `test(mobile)`: E2E Detox do fluxo completo de acionamento — 3 pts

**Aceite:** acionamento funciona em modo avião e sincroniza ao voltar a rede, sem duplicar envio.

---

## E5 — Monitoramento e triagem · P1 · 13 pts

- [ ] `feat(api)`: `POST /journal` e `GET /journal` (horas, humor, gatilho) — 5 pts
- [ ] `feat(api)`: `POST /screening` com devolutiva por faixa — 3 pts `TODO [CLINICAL]`
- [ ] `feat(mobile)`: registro diário e série de 14 dias — 5 pts

**Aceite:** série de 14 dias renderizada; devolutiva com aviso de "não é diagnóstico".
**Bloqueio:** instrumento e pontos de corte dependem da consultoria clínica.

---

## E6 — Painel clínico (web) · P1 · 21 pts

- [ ] `chore(web)`: inicializar Next.js + Tailwind + autenticação — 5 pts
- [ ] `feat(api)`: vínculo paciente↔profissional por código, com escopo e revogação — 5 pts
- [ ] `feat(web)`: lista de pacientes e visão longitudinal (triagem, séries, acionamentos) — 8 pts
- [ ] `feat(api)`: auditoria de todo acesso do profissional a dado de paciente — 3 pts

**Aceite:** profissional sem vínculo ativo recebe 403; todo acesso aparece na auditoria.

---

## E7 — Conformidade LGPD e direitos do titular · P0 · 18 pts

- [ ] `feat(api)`: exportação de dados (JSON+CSV) com prazo e registro — 5 pts
- [ ] `feat(api)`: exclusão de conta com anonimização em ≤ 30 dias — 5 pts
- [ ] `feat(api)`: criptografia por coluna (envelope encryption via KMS) para PII/dado de saúde — 5 pts
- [ ] `feat(web)`: página de opt-out em um clique, sem login — 3 pts
- [ ] `docs`: RIPD/DPIA, ROPA e nomeação do DPO — `TODO [LEGAL]`

**Aceite:** exportação e exclusão funcionam ponta a ponta; colunas sensíveis ilegíveis no dump
do banco.
**Bloqueante de lançamento:** tratamento de usuários menores de 18 anos. `TODO [LEGAL]`

---

## E8 — Infra, CI/CD e observabilidade · P1 · 21 pts

- [ ] `feat(infra)`: módulos Terraform (network, database, cache, api, edge, secrets) — 13 pts
- [ ] `ci`: pipeline de deploy dev → staging → prod com aprovação manual em prod — 3 pts
- [ ] `feat(api)`: Sentry com scrubbing de PII + OpenTelemetry — 3 pts
- [ ] `feat(infra)`: alarmes P1/P2 e runbook de plantão — 2 pts

**Aceite:** ambiente reconstruível do zero via Terraform; alarme de falha de notificação
dispara em teste de caos.

---

## Distribuição por sprint (12 semanas)

| Sprint | Semanas | Épicos                             | Pontos |
| ------ | ------- | ---------------------------------- | ------ |
| S0     | 1–2     | E1 (início), E8 (CI e docker)      | 18     |
| S1     | 3–4     | E1 (fim), E2                       | 26     |
| S2     | 5–6     | E3, E4 (início)                    | 26     |
| S3     | 7–8     | E4 (botão de pânico ponta a ponta) | 26     |
| S4     | 9–10    | E5, E6                             | 26     |
| S5     | 11–12   | E7, E8 (fim), endurecimento        | 28     |

---

## Pendências externas ao time de engenharia

| Item                                                                          | Responsável         | Bloqueia       |
| ----------------------------------------------------------------------------- | ------------------- | -------------- |
| Instrumento de triagem e pontos de corte `TODO [CLINICAL]`                    | Consultoria clínica | E5             |
| Revisão dos textos ao contato de apoio `TODO [CLINICAL]`                      | Consultoria clínica | Lançamento     |
| Critérios de detecção de risco e protocolo de escalonamento `TODO [CLINICAL]` | Consultoria clínica | Lançamento     |
| Termos de Uso e Política de Privacidade `TODO [LEGAL]`                        | Jurídico            | Lançamento     |
| Tratamento de menores de 18 anos `TODO [LEGAL]`                               | Jurídico/DPO        | **Lançamento** |
| DPIA/RIPD e nomeação do DPO `TODO [LEGAL]`                                    | DPO                 | Lançamento     |
| DPAs (Twilio, SendGrid, cloud, Sentry) `TODO [LEGAL]`                         | Jurídico            | Produção       |
| Aprovação de template WhatsApp Business                                       | Produto             | M3             |
