# ROADMAP E KPIs — ESCAPE-THE-GAMES

> Versão 0.1.0 · Marco zero = início do desenvolvimento. Sprints de 2 semanas.

---

## 1. Marcos

### M1 — MVP (mês 0–3)

**Objetivo:** provar que o botão de pânico funciona de ponta a ponta e que pessoas usam.

| Entrega              | Detalhe                                                               |
| -------------------- | --------------------------------------------------------------------- |
| Conta e autenticação | Cadastro, login, JWT + refresh, consentimento versionado              |
| Rede de apoio        | Cadastro + verificação de contatos (double opt-in), opt-out           |
| **Botão de pânico**  | `POST /panic`, fan-out SMS/e-mail/push, retry, tela de acompanhamento |
| Registro diário      | Horas, humor, gatilho; série de 14 dias                               |
| Triagem              | Questionário + devolutiva por faixa `TODO [CLINICAL]`                 |
| Infra                | docker-compose local, CI, deploy em dev/staging                       |
| Conformidade         | Termos, Política, DPIA iniciado, redaction de PII                     |

**Critério de saída:** 100 usuários em beta fechado; ≥ 200 acionamentos reais; taxa de
entrega de notificação ≥ 95%; nenhum incidente P1.

### M2 — Lançamento público (mês 4–6)

| Entrega           | Detalhe                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Painel clínico    | Vínculo por código, visão longitudinal, auditoria de acesso          |
| Exercícios de TCC | 6 exercícios de manejo de fissura e reestruturação `TODO [CLINICAL]` |
| Metas de tempo    | Meta diária/semanal, acompanhamento e acolhimento                    |
| Monetização       | Planos Pro e Família, paywall, faturamento                           |
| Confiabilidade    | Fila em Redis/BullMQ, circuit breaker, alertas P1                    |
| Conformidade      | DPIA concluído, DPAs assinados, pentest, fluxo de exclusão           |
| Publicação        | App Store e Google Play (com revisão de categoria de saúde)          |

**Critério de saída:** 3.000 usuários registrados; D30 ≥ 25%; NPS ≥ 40; disponibilidade 99,5%.

### M3 — Consolidação (mês 7–12)

| Entrega               | Detalhe                                                                       |
| --------------------- | ----------------------------------------------------------------------------- |
| B2B clínico           | Licença por profissional, múltiplos pacientes, relatórios exportáveis         |
| WhatsApp Business API | Envio automático com template aprovado (substitui o deep link) `TODO [LEGAL]` |
| Comunidade moderada   | Grupos temáticos com moderação profissional `TODO [CLINICAL]`                 |
| Integrações de uso    | Screen Time (iOS) / Digital Wellbeing (Android), opt-in                       |
| Estudo de desfecho    | Coorte com parceiro acadêmico sobre redução de horas e adesão                 |
| Segurança             | MFA no painel clínico, OIDC, SOC 2 Type I iniciado                            |
| Escala                | Multi-AZ, réplicas de leitura, teste de carga 10×                             |

**Critério de saída:** 15.000 usuários ativos; 2.500 pagantes; 30 clínicas parceiras;
LTV/CAC ≥ 3.

---

## 2. Sprints do MVP (12 semanas)

| Sprint | Semanas | Foco                                                    | Entregável verificável                                    |
| ------ | ------- | ------------------------------------------------------- | --------------------------------------------------------- |
| S0     | 1–2     | Fundação: monorepo, CI, docker-compose, ADRs            | `docker compose up` sobe API + Postgres; CI verde         |
| S1     | 3–4     | Auth + modelo de dados + auditoria WORM                 | Login/refresh funcionando; `audit_log` com hash encadeado |
| S2     | 5–6     | Contatos + verificação (double opt-in)                  | Contato verificado ponta a ponta com SMS real em staging  |
| S3     | 7–8     | **Botão de pânico** ponta a ponta                       | Acionamento no app dispara SMS/e-mail; tela de status     |
| S4     | 9–10    | Registro diário + triagem + onboarding                  | Fluxo completo do primeiro uso                            |
| S5     | 11–12   | Endurecimento: rate limit, retry, observabilidade, LGPD | Teste de carga, redaction, exportação/exclusão            |

---

## 3. KPIs

### 3.1 Produto e engajamento

| KPI                  | Definição                                    | Alvo M1 | Alvo M2 | Alvo M3 |
| -------------------- | -------------------------------------------- | ------- | ------- | ------- |
| **Ativação**         | % que verifica ≥ 1 contato em 48 h           | 45%     | 60%     | 70%     |
| **D1**               | % que retorna no dia seguinte                | 40%     | 50%     | 55%     |
| **D7**               | % ativo 7 dias após o cadastro               | 22%     | 32%     | 38%     |
| **D30**              | % ativo 30 dias após o cadastro              | 12%     | 25%     | 30%     |
| Registros/semana     | Média de registros diários por usuário ativo | 3,0     | 4,0     | 4,5     |
| Acionamentos/usuário | Média mensal (monitorar, não maximizar)      | —       | —       | —       |

### 3.2 Botão de pânico (confiabilidade)

| KPI                                     | Alvo M1  | Alvo M2  | Alvo M3  |
| --------------------------------------- | -------- | -------- | -------- |
| Latência p95 do `POST /panic`           | < 800 ms | < 400 ms | < 300 ms |
| Tempo até 1ª notificação entregue (p95) | < 90 s   | < 60 s   | < 45 s   |
| Taxa de entrega SMS                     | ≥ 92%    | ≥ 95%    | ≥ 97%    |
| Taxa de entrega e-mail                  | ≥ 96%    | ≥ 98%    | ≥ 99%    |
| Taxa de resposta do contato em 30 min   | —        | ≥ 60%    | ≥ 70%    |
| Eventos resolvidos ("já estou bem")     | ≥ 55%    | ≥ 70%    | ≥ 75%    |

### 3.3 Desfecho clínico `TODO [CLINICAL]`

| KPI                         | Definição                                                    | Alvo M2 | Alvo M3 |
| --------------------------- | ------------------------------------------------------------ | ------- | ------- |
| **Redução de tempo de uso** | Δ% de horas/dia entre a linha de base e o dia 30, por coorte | −15%    | −25%    |
| Redução sustentada          | Manutenção da redução no dia 90                              | —       | −20%    |
| **Adesão a TCC**            | % de exercícios propostos concluídos em 30 dias              | 40%     | 55%     |
| Melhora na triagem          | % que reduz faixa de sintomas em 90 dias                     | —       | 30%     |
| Encaminhamento clínico      | % em faixa intensa que reporta busca por profissional        | 20%     | 35%     |

> Métricas de desfecho são **autorreportadas** no MVP e não constituem evidência clínica.
> Estudo controlado previsto em M3 com parceiro acadêmico. `TODO [CLINICAL]`

### 3.4 Negócio

| KPI                     | Alvo M2   | Alvo M3   |
| ----------------------- | --------- | --------- |
| Conversão free → pago   | 3%        | 6%        |
| Churn mensal (pagantes) | ≤ 10%     | ≤ 7%      |
| CAC blended             | ≤ R$ 130  | ≤ R$ 90   |
| ARPU (pagantes)         | R$ 25     | R$ 27     |
| LTV/CAC                 | ≥ 2       | ≥ 3       |
| MRR                     | R$ 15 mil | R$ 65 mil |

### 3.5 Operação e conformidade

| KPI                                        | Alvo            |
| ------------------------------------------ | --------------- |
| Disponibilidade mensal da API              | ≥ 99,5%         |
| Incidentes P1                              | 0 por trimestre |
| MTTR (P1)                                  | ≤ 60 min        |
| Vulnerabilidades críticas abertas > SLA    | 0               |
| Solicitações de titular atendidas no prazo | 100%            |
| Cobertura de testes (`panic`, `contacts`)  | ≥ 70%           |

---

## 4. Riscos por marco

| Marco | Risco principal                      | Sinal de alerta               | Plano B                                                  |
| ----- | ------------------------------------ | ----------------------------- | -------------------------------------------------------- |
| M1    | Entregabilidade de SMS no Brasil     | Taxa de entrega < 90%         | Segundo provedor de SMS; priorizar push/e-mail           |
| M1    | Revisão clínica atrasar o conteúdo   | Textos sem aprovação na S8    | Lançar beta sem triagem, apenas com botão e diário       |
| M2    | Rejeição nas lojas (categoria saúde) | Revisão recusada 2×           | Ajustar claims; publicar como bem-estar `TODO [LEGAL]`   |
| M2    | Baixa conversão B2C                  | Conversão < 1,5%              | Acelerar B2B clínico e plano Família                     |
| M3    | Aprovação de template WhatsApp       | Recusa da Meta                | Manter deep link como canal oficial                      |
| M3    | Custo de SMS na escala               | Custo variável > R$ 8/usuário | Teto por usuário; push obrigatório para contatos com app |
