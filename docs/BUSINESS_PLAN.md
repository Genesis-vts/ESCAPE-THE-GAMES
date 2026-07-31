# PLANO DE NEGÓCIOS — ESCAPE-THE-GAMES

> Versão **0.2.0** · julho de 2026 · Mercado: **Brasil**.
>
> Esta versão foi **reescrita** depois de descobrir que o Estado brasileiro já ocupa
> a camada base do problema (ver [PUBLIC_SECTOR_STRATEGY.md](./PUBLIC_SECTOR_STRATEGY.md)).
> A v0.1.0 supunha um mercado desassistido e estimava números por analogia — as duas
> premissas estavam erradas.
>
> **Procedência dos números:** cada valor abaixo é marcado como
> ✅ dado público verificável · ⚠️ indício a confirmar · 🔶 hipótese a medir.
> Fontes em [DATA_SOURCES.md](./DATA_SOURCES.md). **Nenhum 🔶 vai a investidor ou
> parceiro apresentado como fato.**

---

## 1. O problema, e o que já foi resolvido

Uso problemático de jogos e de apostas causa dano financeiro, sofrimento psíquico e,
na janela aguda pós-perda, risco à vida. No Brasil, entre o fim de 2025 e julho de
2026, o poder público passou a atuar de forma direta:

- Plataforma Centralizada de Autoexclusão — **~925 mil cadastros** em jul/2026 ⚠️
- Guia de Cuidado do Ministério da Saúde para a rede pública ✅
- Triagem e teleatendimento dentro do Meu SUS Digital ✅
- 2,8 milhões de beneficiários do Bolsa Família e BPC bloqueados de apostar ⚠️

**O que continua sem solução:** o intervalo entre a decisão de parar e a vida
seguinte. Quem se autoexclui por tempo indeterminado — 69% dos cadastrados ⚠️ —
enfrenta sozinho o dia 3, a madrugada do dia 12 e a recaída do dia 30, com uma
consulta marcada para dali a semanas.

> **É esse intervalo que o produto ocupa.** Não a conscientização, não o bloqueio de
> acesso, não a consulta. O meio.

---

## 2. Proposta de valor

> **"O bloqueio foi o primeiro passo. A gente segura os outros trezentos."**

| Para quem                  | Dor                                    | Entrega                                               |
| -------------------------- | -------------------------------------- | ----------------------------------------------------- |
| Quem já se autoexcluiu     | "Bloqueei. E agora?"                   | Rede de apoio verificada, plano frio, botão de pânico |
| Quem ainda não decidiu     | "Não consigo parar sozinho"            | Conduz à autoexclusão oficial e sustenta a decisão    |
| Familiar                   | "Descubro tarde e falo a coisa errada" | Alerta consentido + preparo de como responder         |
| Profissional do SUS        | "Só vejo o paciente de vez em quando"  | Visão longitudinal entre consultas                    |
| Operadora sob conformidade | "Preciso comprovar jogo responsável"   | Camada independente com desfecho auditável            |

**Diferencial defensável:** somos a única camada **contínua**. O Estado faz massa e
episódio; nós fazemos o dia a dia e a madrugada. Complementares, não concorrentes.

---

## 3. Mercado — o que dá para afirmar

### 3.1 A cabeça de ponte ✅⚠️

| Indicador                                              | Valor        | Tipo |
| ------------------------------------------------------ | ------------ | ---- |
| Cadastros na autoexclusão (jul/2026)                   | ~925 mil     | ⚠️   |
| Ritmo de crescimento recente                           | ~200 mil/mês | ⚠️   |
| Optaram por bloqueio indeterminado                     | 69%          | ⚠️   |
| Declararam perda de controle e impacto na saúde mental | 41%          | ⚠️   |

**41% de ~700 mil ≈ 287 mil pessoas** que declararam, em registro do governo
federal, ter perdido o controle. Isso não é prevalência estimada — é
**autodeclaração individual registrada**, e é o melhor insumo de dimensionamento
disponível no país.

Ressalvas obrigatórias: o motivo é campo opcional; autoexclusão é intenção, não
demanda por produto; cobre só casas autorizadas; não cobre jogo eletrônico sem
aposta.

### 3.2 O que ainda falta medir

| Pergunta                                        | Como responder                       | Prazo       |
| ----------------------------------------------- | ------------------------------------ | ----------- |
| Prevalência real de transtorno de jogo          | Literatura brasileira revisada (E12) | 3 dias      |
| Perfil demográfico dos autoexcluídos            | **Pedido via LAI à SPA/MF**          | Prazo legal |
| Tamanho do público não-aposta (jogo eletrônico) | PGB + literatura                     | 1 semana    |
| Disposição a pagar                              | Só experimento                       | 90 dias     |

**Removi o TAM/SAM/SOM da versão anterior.** Eram estimativas por analogia
apresentadas como dimensionamento. Voltam quando o E12 estiver concluído.

---

## 4. Modelo de receita — reformulado

A v0.1.0 apostava em assinatura B2C como linha principal. **Isso está errado por
dois motivos:**

1. Competir com SUS gratuito na camada clínica é perder.
2. 2,8 milhões dos afetados são beneficiários de Bolsa Família e BPC ⚠️ — cobrar
   assinatura **exclui exatamente quem mais precisa**.

### Linhas, em ordem de probabilidade

| #   | Linha                                 | Comprador                                 | Racional                                                                    | Confiança               |
| --- | ------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- | ----------------------- |
| 1   | **Conformidade B2B**                  | Operadora autorizada                      | Dever regulatório de jogo responsável; orçamento existente; risco de sanção | 🔶 alta                 |
| 2   | **Plano Família**                     | Familiar (mãe, parceiro)                  | Historicamente o comprador real em dependências                             | 🔶 média-alta           |
| 3   | **Institucional**                     | Universidade, empresa, operadora de saúde | Desfecho mensurável (evasão, absenteísmo)                                   | 🔶 média                |
| 4   | **Fundo setorial / convênio público** | Fundo da Lei 14.790, emenda, chamada      | Dinheiro sai do setor que causa o dano                                      | 🔶 baixa no curto prazo |
| 5   | **Gratuito para o usuário final**     | —                                         | **Decisão de missão, não falha de monetização**                             | —                       |

> **Princípio inegociável:** a pessoa em sofrimento **nunca paga pela proteção**.
> Quem paga é quem tem obrigação (operadora), quem tem capacidade (família,
> instituição) ou o fundo público. Isso não é caridade — é a única configuração em
> que o produto alcança quem mais precisa.

**Preços:** removidos desta versão. Os valores da v0.1.0 eram ancoragem sem
pesquisa. Voltam após entrevistas de disposição a pagar com os três compradores
acima.

---

## 5. Custos

### 5.1 Variável por usuário ativo/mês 🔶

| Item           | Estimativa | Status                                                   |
| -------------- | ---------- | -------------------------------------------------------- |
| SMS            | —          | **Cotar com Twilio, Zenvia e Infobip** (2 h de trabalho) |
| E-mail         | baixo      | Cotar                                                    |
| Push           | ~zero      | ✅                                                       |
| Infra          | rateio     | Medir em piloto                                          |
| Suporte humano | —          | Depende do modelo de plantão do E9                       |

A v0.1.0 trazia R$ 4,80/usuário/mês com componentes inventados. **Removido.** SMS é
o maior custo variável e uma cotação real leva duas horas — não há desculpa para
estimar.

### 5.2 Fixo — fase de validação

O plano anterior previa R$ 650 mil e 6 meses **antes** de qualquer validação. A
estratégia atual inverte: **três experimentos de ~R$ 30 mil em 90 dias** respondem
as perguntas que determinam se o produto funciona.

| Experimento                                         | Custo      | O que mata a tese                                              |
| --------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| Concierge manual com 30 pessoas recém-autoexcluídas | ~R$ 15 mil | Se ninguém quer acompanhamento após o bloqueio, não há produto |
| Sono como meta primária vs. meta de horas           | ~R$ 5 mil  | Se sono resolve igual, o produto simplifica muito              |
| Preparo do familiar isolado                         | ~R$ 5 mil  | Se só isso já melhora retenção, a rede **é** o produto         |

Só depois disso faz sentido falar em time e em captação.

---

## 6. Go-to-market

### Canal 1 — O "e agora?" da autoexclusão 🟢 prioritário

Quase um milhão de pessoas já agiram. A plataforma oficial resolve o acesso e
aponta para o SUS — mas ninguém acompanha o depois.

Onde estar: conteúdo de busca para "me autoexcluí das bets e agora", comunidades de
recuperação, e — idealmente — como recurso citado pelo próprio ecossistema público.

### Canal 2 — Clínico

PRO-AMITI/IPq-USP, CAPS, profissionais do teleatendimento do SUS. Indicação
profissional tem a maior conversão e o menor churn em dependências.

### Canal 3 — Familiar

O comprador real. Campanhas dirigidas a quem convive, não a quem sofre.

### Canal 4 — Conformidade

Aproximação com a SPA/MF e com operadoras, via consulta pública e contribuição
técnica. Ciclo longo, receita maior.

---

## 7. Concorrência — reposicionada

| Ator                                     | Camada             | Relação                                                                 |
| ---------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| **Plataforma de Autoexclusão (Fazenda)** | Acesso             | **Complementar** — conduzimos a ela                                     |
| **Meu SUS Digital / teleatendimento**    | Triagem e consulta | **Complementar** — encaminhamos para lá                                 |
| Apps de tempo de tela                    | Limite genérico    | Substituível: sem rede e sem clínica                                    |
| Terapia digital privada                  | Consulta           | Complementar                                                            |
| Ferramentas próprias das operadoras      | Conformidade       | **Concorrente direto** no canal 4 — nosso diferencial é a independência |

**Risco competitivo real:** o Estado ampliar o escopo e ocupar também a camada
contínua. Mitigação: ser o parceiro que entrega essa camada, não o concorrente que
disputa com ela.

---

## 8. Métrica-mãe

> **Horas de jogo ou aposta evitadas, verificadas, sustentadas em 90 dias — por
> minuto de uso do nosso app.**

Sucesso é o usuário precisar menos de nós. Isso é hostil ao growth clássico e
afasta um tipo de investidor — o que funciona como filtro de quem embarca.

---

## 9. Riscos

| Risco                                 | Impacto     | Mitigação                                                                                                    |
| ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| **Estado ocupar a camada contínua**   | Alto        | Ser parceiro, não concorrente; buscar integração cedo                                                        |
| **Captura pelas operadoras**          | **Crítico** | Nenhuma fonte acima de 50% da receita; auditoria clínica externa; metodologia pública                        |
| Incidente de privacidade              | **Crítico** | Programa de segurança já especificado; pentest; seguro                                                       |
| Uso indevido do botão (assédio)       | Alto        | Double opt-in e opt-out permanente já implementados                                                          |
| Evento adverso grave                  | **Crítico** | `CRISIS_PROTOCOL.md` e seus sete portões de governança                                                       |
| Enquadramento como dispositivo médico | Alto        | Parecer regulatório antes de qualquer claim terapêutico `TODO [LEGAL]`                                       |
| Modelo sem defensabilidade comercial  | Médio       | Reconhecido: pode ser caso de **infraestrutura pública**, não de startup — decisão consciente dos fundadores |

---

## 10. O que decidir antes de escrever a v0.3.0

1. **Escopo:** jogo eletrônico, apostas, ou os dois? Muda regulação, clínica e público.
2. **Natureza:** empresa com investidor, negócio de impacto, ou bem público digital?
3. **Fonte de receita primária:** conformidade, família ou fundo público?

As três são decisões dos fundadores, não de análise. Enquanto estiverem abertas,
qualquer projeção financeira é ficção — e este documento evita fazê-las de propósito.
