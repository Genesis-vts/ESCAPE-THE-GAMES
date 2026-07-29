# PLANO DE NEGÓCIOS — ESCAPE-THE-GAMES

> Versão 0.1.0 · MVP · Mercado inicial: **Brasil**. Valores em BRL, estimativas de referência
> para planejamento — **não** são cotações fechadas. `TODO [LEGAL]` para claims de saúde.

---

## 1. Problema

O uso problemático de jogos eletrônicos foi reconhecido pela OMS na CID-11 (6C51, _gaming
disorder_). No Brasil, o cenário combina três fatores que agravam o quadro:

1. **Alta exposição** — o país é um dos maiores mercados de games do mundo, com forte
   penetração em mobile e em faixas etárias jovens.
2. **Baixa oferta de cuidado especializado** — poucos ambulatórios públicos com foco em
   dependências comportamentais; longas filas; concentração em capitais.
3. **Isolamento na crise** — o momento de recaída acontece de madrugada, sozinho, sem
   nenhum canal de contato imediato com a rede de apoio.

O paciente típico não precisa apenas de "menos tempo de tela": precisa de **um caminho de
saída no momento exato da fissura**, com alguém do outro lado.

---

## 2. Proposta de valor

> **"Um botão. Alguém do outro lado. Antes da recaída."**

| Para quem                   | Dor                                                  | Nossa entrega                                                                                 |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Pessoa com uso problemático | "Quando dá vontade, não tenho a quem recorrer"       | Botão de pânico que avisa contatos autorizados em segundos, + exercícios de manejo de fissura |
| Familiar / parceiro(a)      | "Descubro tarde demais"                              | Notificação verificada e consentida, com orientação do que fazer e do que **não** fazer       |
| Psicólogo(a) / psiquiatra   | "Só vejo o paciente 1x por semana, e ele não lembra" | Painel com histórico de acionamentos, tempo de uso e adesão às tarefas de TCC                 |
| Clínica / operadora         | "Não consigo medir desfecho"                         | Coorte, KPIs de adesão e redução de uso, relatórios agregados                                 |

**Diferenciais defensáveis:** (a) rede de apoio verificada com double opt-in — barreira de
confiança e antiabuso; (b) integração clínica desde o MVP, não como extensão futura;
(c) design de produto em PT-BR com vocabulário da comunidade gamer, não "linguagem de bula".

---

## 3. Mercado-alvo

### 3.1 Segmentação

- **B2C primário:** 16–34 anos, joga ≥ 4 h/dia, já teve prejuízo em sono, trabalho/estudo ou
  relacionamento. Perfil que busca ativamente ajuda ("como parar de jogar").
- **B2C secundário (comprador):** mães/pais e parceiros(as) que instalam e pagam pelo plano
  — historicamente a maior disposição a pagar em dependências.
- **B2B:** clínicas de dependência química/comportamental, consultórios de psicologia,
  operadoras de saúde e programas de bem-estar corporativo.
- **B2B2C (v2):** universidades e escolas técnicas com programa de saúde mental estudantil.

### 3.2 Dimensionamento (metodologia top-down + bottom-up)

| Nível          | Definição                                                                                                                   | Estimativa                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| TAM            | Jogadores brasileiros com sinais de uso problemático (faixa de prevalência de 1,5%–3% da população de jogadores frequentes) | ~1,5–3 milhões de pessoas                              |
| SAM            | Faixa 16–34 anos, smartphone, capitais e regiões metropolitanas, com disposição a buscar ajuda digital                      | ~400–700 mil pessoas                                   |
| SOM (36 meses) | Captura realista com investimento de aquisição moderado + 30 parcerias clínicas                                             | 25–40 mil usuários ativos; 4–6 mil assinantes pagantes |

> Faixas propostas para planejamento. **Antes do go-to-market**, validar com pesquisa primária
> (n≥300) e com dados de prevalência publicados. `TODO` — anexar fontes revisadas ao dossiê.

---

## 4. Modelo de receita

| Linha             | Descrição                                                              | Preço-alvo                     | Margem bruta                    |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------ | ------------------------------- |
| **Free**          | Diário, metas de tempo, 1 contato de apoio, conteúdo educativo         | R$ 0                           | — (custo de aquisição/retenção) |
| **Pro (B2C)**     | Contatos ilimitados, histórico completo, exercícios de TCC, relatórios | **R$ 29,90/mês** ou R$ 249/ano | ~78%                            |
| **Família**       | Até 4 perfis + painel do responsável                                   | R$ 49,90/mês                   | ~75%                            |
| **Clínico (B2B)** | Licença por profissional, painel multi-paciente, exportação            | R$ 149/prof./mês               | ~85%                            |
| **Enterprise**    | Operadora/empresa, contrato anual, SSO, relatórios agregados           | R$ 15–25 por vida/ano          | ~70%                            |

**Racional de preço:** ancorado abaixo de uma sessão de terapia (R$ 120–250) e na faixa de
apps de saúde mental já aceita no Brasil. O plano Família captura o comprador real (familiar).

**Não monetizamos:** venda de dados, publicidade comportamental, ou qualquer forma de
monetização de dados de saúde. Compromisso público na política de privacidade. `TODO [LEGAL]`

---

## 5. Estrutura de custos

### 5.1 Custo variável por usuário ativo/mês (estimativa)

| Item                     | Premissa                                   | Custo         |
| ------------------------ | ------------------------------------------ | ------------- |
| SMS (Twilio, BR)         | 6 SMS/mês/usuário ativo × ~R$ 0,45         | R$ 2,70       |
| E-mail (SendGrid)        | 40 e-mails/mês, plano Essentials           | ~R$ 0,08      |
| Push (FCM/APNs)          | ilimitado                                  | R$ 0,00       |
| Infra (compute+db+redis) | rateio                                     | R$ 0,90       |
| Suporte                  | 4% dos usuários abrem ticket, 8 min/ticket | R$ 1,10       |
| **Total variável**       |                                            | **≈ R$ 4,80** |

> Sensibilidade: SMS é o maior custo variável e escala com o **número de contatos por
> acionamento**. Mitigação: priorizar push para contatos que têm o app; teto diário de
> acionamentos por usuário (ver rate limits em PANIC_BUTTON_DESIGN.md).

### 5.2 Custo fixo mensal — fase MVP (6 meses)

| Item                                                            | Mensal              |
| --------------------------------------------------------------- | ------------------- |
| Time: 1 tech lead, 2 devs full-stack, 1 designer (PJ/CLT médio) | R$ 78.000           |
| Consultoria clínica (psicólogo especialista, 20 h/mês)          | R$ 6.000            |
| Assessoria jurídica (LGPD, DPO fracionado)                      | R$ 5.000            |
| Infra (dev+staging+prod baixa escala)                           | R$ 2.500            |
| Ferramentas (Sentry, CI, design, gestão)                        | R$ 1.800            |
| **Total fixo**                                                  | **≈ R$ 93.300/mês** |

**Investimento MVP (6 meses):** ≈ R$ 560 mil + R$ 90 mil de marketing de validação ≈ **R$ 650 mil**.

### 5.3 Unit economics alvo (mês 12)

| Métrica                | Alvo                         |
| ---------------------- | ---------------------------- |
| CAC (blended)          | ≤ R$ 90                      |
| ARPU pagante           | R$ 27                        |
| Margem de contribuição | R$ 22/mês                    |
| Payback                | ≤ 4,5 meses                  |
| Churn mensal           | ≤ 7%                         |
| LTV                    | ≈ R$ 310 · **LTV/CAC ≈ 3,4** |

---

## 6. Go-to-market

### Fase 0 — Validação (mês 0–3, pré-lançamento)

- 30 entrevistas em profundidade (15 usuários, 10 familiares, 5 clínicos).
- Landing com lista de espera; meta 1.500 e-mails.
- Beta fechado com 100 usuários recrutados em comunidades (Discord, subreddits BR, grupos de
  apoio). Consentimento de pesquisa explícito. `TODO [LEGAL]`

### Fase 1 — Lançamento assistido (mês 4–6)

- **Canal 1 — Conteúdo/SEO:** artigos para intenção de busca ("como parar de jogar",
  "vício em jogos tratamento"). Custo baixo, intenção altíssima.
- **Canal 2 — Creators:** parceria com 5–8 streamers/criadores que já falam abertamente sobre
  burnout e uso excessivo. Autenticidade > alcance.
- **Canal 3 — Clínico:** 10 clínicas parceiras piloto; profissional indica o app ao paciente
  (canal de maior conversão e menor churn).
- **Canal 4 — Familiares:** campanhas segmentadas para o comprador (plano Família).

### Fase 2 — Escala (mês 7–12)

- Paid social com criativos testados na fase 1; meta CAC ≤ R$ 90.
- Programa de indicação (usuário → contato de apoio vira usuário).
- Primeiros contratos B2B (2 operadoras/programas corporativos).

### Parceiros clínicos e institucionais (lista-alvo)

- Ambulatórios universitários de dependências comportamentais (parceria de pesquisa).
- Conselhos e associações de psicologia — validação de conteúdo de TCC. `TODO [CLINICAL]`
- CVV (Centro de Valorização da Vida) — **encaminhamento**, sem integração automatizada.
- Clínicas privadas de dependência química com braço comportamental.

> Toda parceria clínica exige protocolo de encaminhamento assinado antes do go-live.
> O produto **não** presta atendimento de emergência. `TODO [LEGAL]` `TODO [CLINICAL]`

---

## 7. Concorrência

| Concorrente                                             | Foco                     | Nossa diferença                                                            |
| ------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| Apps de tempo de tela (Digital Wellbeing, Opal, Forest) | bloqueio/limite genérico | Rede de apoio verificada + acompanhamento clínico                          |
| Apps de meditação (Calm, Zen)                           | bem-estar amplo          | Especialização em gaming disorder e no momento da fissura                  |
| Terapia digital (Zenklub, Vittude)                      | sessões com profissional | Complementar, não substituto: integramos o profissional em vez de competir |
| Grupos de apoio (fóruns, Discord)                       | comunidade               | Estruturado, privado, com consentimento e histórico clínico                |

**Risco competitivo:** plataformas de jogos lançarem ferramentas próprias de bem-estar.
Mitigação: posicionamento independente e clínico — não temos conflito de interesse com o
tempo de jogo do usuário.

---

## 8. Métricas de negócio acompanhadas

Ativação (contato de apoio verificado em 48 h), D7/D30, acionamentos por usuário ativo,
taxa de resposta do contato, conversão free→pago, churn, NPS, CAC e LTV.
Definições e alvos em [ROADMAP.md](./ROADMAP.md).

---

## 9. Riscos de negócio

| Risco                                                           | Prob. | Impacto     | Mitigação                                                                                                        |
| --------------------------------------------------------------- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Enquadramento regulatório como dispositivo médico (SaMD/ANVISA) | Média | Alto        | Posicionar como ferramenta de bem-estar e apoio; parecer regulatório antes de claims terapêuticos `TODO [LEGAL]` |
| Incidente de privacidade                                        | Baixa | **Crítico** | Programa de segurança (ver SECURITY_AND_COMPLIANCE.md), pentest anual, seguro cibernético                        |
| Uso indevido do botão (assédio a terceiros)                     | Média | Alto        | Double opt-in, opt-out permanente, rate limit, canal de denúncia                                                 |
| Evento adverso grave associado ao app                           | Baixa | **Crítico** | Disclaimers, protocolo de escalonamento clínico, comitê de revisão `TODO [CLINICAL]`                             |
| Baixa disposição a pagar B2C                                    | Alta  | Médio       | Peso maior em B2B/clínico e no plano Família                                                                     |
| Custo de SMS acima do previsto                                  | Média | Médio       | Priorização de push, teto por usuário, renegociação de volume                                                    |
