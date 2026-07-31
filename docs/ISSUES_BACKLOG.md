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

## E9 — Protocolo de crise e segurança do usuário · P0 · **bloqueado por governança**

**Por quê:** o produto já detecta sinal de risco (`riskFlag`) mas não tem protocolo,
dono clínico nem escada de escalonamento. Detectar risco sem responder é a pior
combinação possível. Especificação: [CRISIS_PROTOCOL.md](./CRISIS_PROTOCOL.md).

- [ ] `gov`: nomear diretor clínico responsável e obter assinatura do protocolo — **bloqueante**
- [ ] `gov`: definir plantão humano e tempo de resposta — **bloqueante**
- [ ] `docs`: decidir escopo (tempo vs. dinheiro) e refletir nos demais documentos `TODO [LEGAL]`
- [ ] `feat(api)`: plano de segurança — escrito no estado frio, recuperado no pico — 8 pts
- [ ] `feat(api)`: escada de escalonamento N1–N5 com auditoria de cada degrau — 8 pts
- [ ] `feat(api)`: acompanhamento em 24 h após evento de risco — 3 pts
- [ ] `feat(api)`: apoio ao contato que socorreu — 3 pts
- [ ] `clinical`: critérios de detecção, calibragem e revisão dos textos `TODO [CLINICAL]`
- [ ] `clinical`: painel adversarial do conteúdo de crise

**Aceite:** checklist §11 do protocolo integralmente fechado.
**Nada deste épico sobe com qualquer item de governança em aberto.**

---

## E10 — Disjuntor financeiro · P0 (se o escopo incluir dinheiro) · 21 pts

**Por quê:** atua ao mesmo tempo na recaída e na segurança — a maior relação
impacto/esforço do roadmap. Especificação:
[FINANCIAL_CIRCUIT_BREAKER.md](./FINANCIAL_CIRCUIT_BREAKER.md).

- [ ] `research`: experimento manual com 30 pessoas antes de codar — **primeiro** — 3 pts
- [ ] `feat(api)`: limites com assimetria (apertar imediato, afrouxar com resfriamento) — 8 pts
- [ ] `feat(api)`: cossignatário reaproveitando a rede de apoio verificada — 5 pts
- [ ] `feat(api)`: `LIMIT_BREACHED` alimentando a detecção de risco do E9 — 2 pts
- [ ] `feat(api)`: eventos de auditoria financeiros — 3 pts
- [ ] `legal`: parecer sobre atividade financeira regulada e controle coercitivo `TODO [LEGAL]`

**Aceite:** checklist §10 da especificação fechado; nenhum anti-padrão da §5 presente.

---

## E11 — Equipe técnica de IA · P1 · 26 pts

**Por quê:** multiplica a capacidade humana no estado frio e na rede de apoio.
Especificação: [AI_COACHING_TEAM.md](./AI_COACHING_TEAM.md).

- [ ] `feat`: **Tradutor da torcida** — ensaia com o familiar o que dizer — 5 pts — _primeiro_
- [ ] `feat`: **Preparador** — plano semanal em "se-então" — 8 pts
- [ ] `feat`: **Analista de desempenho** — depende de telemetria (E3/E5) — 5 pts
- [ ] `feat`: **Fisiologista** — sono e respiração — 3 pts
- [ ] `feat`: **Psicólogo da equipe** — roteiros com revisão clínica pesada — 5 pts `TODO [CLINICAL]`
- [ ] `feat`: **Chefe de equipe** — **bloqueado pelo E9** — 0 pts até desbloqueio
- [ ] `test`: conjunto de casos difíceis versionado e rodando no CI
- [ ] `feat`: métrica anti-engajamento instrumentada antes do lançamento

**Aceite:** núcleo (pânico, plano de segurança, 188) comprovadamente funcional com o
provedor de IA fora do ar; painel adversarial fechado.

---

## E12 — Substituir estimativa por evidência · P0 · ~2 semanas de 1 pessoa

**Por quê:** o plano de negócios inteiro roda sobre números inventados por analogia.
Fontes públicas brasileiras cobrem quase todos, de graça.
Mapa completo: [DATA_SOURCES.md](./DATA_SOURCES.md).

- [ ] `partnership`: contato com **PRO-AMITI / IPq HC-FMUSP** — destrava o E9 inteiro — **primeiro**
- [ ] `research`: ler fontes primárias de prevalência e fechar os números marcados ⚠️ — 3 dias
- [ ] `research`: extrair SINAN/TabNet (violência autoprovocada) por faixa etária e tendência — 2 dias
- [ ] `research`: consultar PNS via Base dos Dados (SQL) para SAM/SOM — 2 dias
- [ ] `research`: **pedido via LAI à SPA/MF** — série histórica de autoexclusão, prazos, motivos declarados e perfil demográfico — **maior retorno por esforço**
- [ ] `research`: confirmar na página oficial a regra de reversão do bloqueio indeterminado (fontes divergem: 30 dias vs. 12 meses)
- [ ] `research`: cotar SMS com três provedores (Twilio, Zenvia, Infobip) — 2 h
- [ ] `research`: mapear obrigações de jogo responsável da SPA/MF — 1 semana
- [ ] `research`: obter relatório PGB completo — corrige TAM e persona
- [ ] `docs`: reescrever `BUSINESS_PLAN.md` com fonte ao lado de cada número

**Aceite:** nenhum número sem fonte citada no plano de negócios.
**Achado que já reordena o roadmap:** literatura brasileira associa o transtorno a
sintomas depressivos e má qualidade do sono — sobe a prioridade do membro
"Fisiologista" (E11) e do rastreio de sintomas depressivos.

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
| **Diretor clínico nomeado para o protocolo de crise** `TODO [CLINICAL]`       | Empresa             | **E9 inteiro** |
| **Plantão humano de crise definido**                                          | Operação            | **E9 inteiro** |
| Escopo tempo vs. dinheiro `TODO [LEGAL]`                                      | Produto/Jurídico    | E9, E10        |
| Parecer sobre dever de cuidado ao detectar risco `TODO [LEGAL]`               | Jurídico            | E9             |
| Parecer sobre atividade financeira regulada `TODO [LEGAL]`                    | Jurídico            | E10            |
| DPA do provedor de modelo de IA `TODO [LEGAL]`                                | Jurídico            | E11            |
| Parceria com serviço clínico universitário (PRO-AMITI/IPq-USP)                | Fundadores          | E9, E12        |
