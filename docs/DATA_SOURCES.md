# FONTES DE DADOS — substituindo estimativa por evidência

> Versão 0.1.0 · Levantamento feito em julho de 2026.
> **Objetivo:** trocar cada número inventado do [BUSINESS_PLAN.md](./BUSINESS_PLAN.md)
> e cada `TODO [CLINICAL]` de prevalência por fonte primária verificável.

---

## 0. Como ler este documento

Cada fonte está marcada com o que foi efetivamente verificado:

| Marca                 | Significado                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ✅ **Verificado**     | Fonte existe, é oficial e o caminho de acesso foi confirmado                                                        |
| ⚠️ **Indício**        | Apareceu em busca, mas o dado **não** foi lido na fonte primária — precisa de leitura antes de virar número oficial |
| 🔒 **Bloqueado aqui** | Fonte legítima, mas o ambiente desta sessão recebeu HTTP 403. Precisa de navegador                                  |

**Regra dura:** nenhum número marcado ⚠️ entra em documento de negócio, apresentação
ou material público antes de alguém abrir a fonte primária e conferir amostra,
método e ano.

---

## 1. O achado que muda o projeto

**PRO-AMITI e PRO-AMJO — Instituto de Psiquiatria do HC-FMUSP (USP)** ✅

O Programa Ambulatorial Integrado dos Transtornos do Impulso existe desde 2004,
dentro do IPq HC-FMUSP, e trata explicitamente dependência de internet e jogos
entre os transtornos do impulso. O PRO-AMJO é o programa irmão voltado a jogo de
azar. Ambos coordenados pelo psiquiatra **Hermano Tavares**, referência nacional em
dependências comportamentais.

**Por que isso é o achado mais importante desta pesquisa:** o backlog inteiro do
módulo de crise (E9) está bloqueado por "diretor clínico nomeado" e "revisão dos
critérios clínicos". Existe, em São Paulo, um serviço público universitário que faz
exatamente essa clínica há duas décadas, com produção científica publicada e com as
duas pernas do escopo — jogo eletrônico **e** jogo de azar.

**Ação recomendada, esta semana:** carta de apresentação ao PRO-AMITI propondo
parceria de pesquisa. Não é pedido de consultoria paga — é proposta de colaboração
com um serviço que já tem coorte, instrumento validado e comitê de ética. Isso
destrava simultaneamente: revisão clínica, instrumento de triagem, critérios de
detecção de risco, e credibilidade externa para o argumento B2B.

- https://www.proamiti.com.br/
- https://ipqhc.org.br/saude/ambulatorios-e-servicos/programas-e-grupos/
- https://www.fm.usp.br/ccex/aperfeicoamento/transtorno-do-controle-do-impulso-e-dependencias-comportamentais

---

## 2. Dados de saúde pública — governo

### 2.1 SINAN / DATASUS — violência autoprovocada ✅ 🔒

Tentativa de suicídio e lesão autoprovocada são de **notificação compulsória e
imediata** no Brasil (Portaria de Consolidação nº 4/2017). Os dados ficam no SINAN
e são consultáveis por TabNet, com recorte por ano, sexo, faixa etária, UF e
desfecho.

- Base: `http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sinannet/violencia/bases/violebrnet.def`
- Portal do agravo: https://portalsinan.saude.gov.br/violencia-interpessoal-autoprovocada
- Notas técnicas: http://sistemas.saude.rj.gov.br/tabnetbd/Sinan/Notas_Tecnicas_Violencia.pdf

**Responde:** dimensão real da janela crítica do `CRISIS_PROTOCOL.md` — incidência
de lesão autoprovocada por faixa etária e sexo, e sua tendência temporal.

**Limite honesto:** o SINAN **não** identifica jogo como causa. Ele dá o denominador
populacional e o perfil demográfico, não a atribuição causal. Quem quiser ligar as
duas coisas precisa de estudo próprio — o que é exatamente o valor de uma parceria
com o PRO-AMITI.

🔒 O TabNet devolveu 403 ao fetcher desta sessão. É ferramenta pública e conhecida —
precisa ser aberta em navegador para extração.

### 2.2 SIM / SIH — mortalidade e internações ✅

Também no DATASUS. SIM para óbitos por causas externas (CID X60–X84); SIH para
internações. Úteis para custo social e para o argumento de política pública.

### 2.3 PNS — Pesquisa Nacional de Saúde (IBGE + Ministério da Saúde) ✅

Inquérito domiciliar nacional, edições de 2013 e 2019, com módulo de saúde mental
(depressão diagnosticada, percepção de saúde, acesso a serviço).

- IBGE: https://www.ibge.gov.br/estatisticas/sociais/justica-e-seguranca/9160-pesquisa-nacional-de-saude.html
- Portal PNS/Fiocruz: https://www.pns.icict.fiocruz.br/
- **Microdados tratados e consultáveis por SQL/Python/R:**
  https://basedosdados.org/dataset/86bac6cc-575f-4289-a857-13f3f52c9a1d

**Por que a Base dos Dados importa:** ela entrega a PNS já tratada e consultável
programaticamente. Dá para responder SAM/SOM com consulta, não com chute — em
horas, não semanas.

**Responde:** prevalência de depressão por faixa etária e região; acesso a serviço
de saúde mental; tamanho da população-alvo com sofrimento não atendido.

---

## 3. Regulação e mercado de apostas

### 3.1 Secretaria de Prêmios e Apostas — SPA/MF ✅

Órgão do Ministério da Fazenda criado pelo Decreto nº 11.907/2024 para implementar
a Lei nº 14.790/2023, que regulamentou apostas de quota fixa. Regula, autoriza,
monitora e fiscaliza — e tem mandato **explícito de jogo responsável e prevenção à
ludopatia**.

- https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas
- https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apostas-de-quota-fixa
- Diretrizes de jogo responsável: https://www.gov.br/fazenda/pt-br/assuntos/noticias/2026/secretaria-de-premios-e-apostas-apresenta-diretrizes-de-jogo-responsavel-em-palestra-para-setor-de-atendimento-ao-consumidor

**Implicação estratégica dupla:**

1. **Canal B2B com orçamento e obrigação.** Operadoras autorizadas têm dever de jogo
   responsável. Ferramenta auditável de proteção do apostador deixa de ser "produto
   de bem-estar" e vira **item de conformidade**. É o comprador com a maior
   disposição a pagar do plano de negócios — e o mais rápido de acessar.
2. **Risco de captura, exatamente como avisei em `STRATEGY`.** Vender para o setor
   que causa o dano exige estrutura independente e auditoria externa, ou a
   legitimidade do produto evapora.

⚠️ **Indício não verificado:** o volume mensal do setor (levantamento do Banco
Central citado em fontes secundárias) e o número de operadoras autorizadas
apareceram em busca, **não** foram lidos na fonte oficial. Antes de usar, buscar na
SPA/Sigap e no BCB.

---

## 4. Prevalência de transtorno de jogo — literatura brasileira

Existem estudos brasileiros publicados e revisados por pares. É de longe a lacuna
mais grave do `BUSINESS_PLAN.md` atual, e ela é preenchível.

- SciELO / Braz J Psychiatry: https://www.scielo.br/j/jbpsiq/a/bySvTrn6pXj8MVYqLnqG8Pb/abstract/?lang=pt 🔒
- Debates em Psiquiatria (ABP): https://revistardp.org.br/revista/article/view/462 — DOI 10.1590/1516-4446-2019-0760
- Jornal da USP, divulgação: https://jornal.usp.br/ciencias/uso-problematico-de-video-games-entre-jovens-do-brasil-e-maior-que-a-media-de-outros-paises/ 🔒
- Revisão em RBP: https://www.scielo.br/j/rbp/a/T8y3pYpXy7wWj9v6DRdRxfR/?format=pdf&lang=pt

⚠️ **Números que apareceram em resumo de busca e que NÃO devem ser usados sem
leitura da fonte:** faixas de prevalência entre estudantes e entre jogadores
adultos, e a afirmação de que o uso problemático no Brasil supera a média
internacional. São **pistas fortes**, não dados confirmados. As amostras variam
muito (estudantes de uma instituição vs. população geral) e isso muda tudo no
dimensionamento.

### 4.1 O achado que valida a estratégia ⚠️

A literatura brasileira associa transtorno de jogo pela internet a **sexo
masculino, sintomas depressivos graves, má qualidade do sono e tempo de jogo**.

Se confirmado na leitura primária, isso sustenta empiricamente duas apostas que eu
havia feito por raciocínio mecanicista:

| Aposta da estratégia                                             | Status                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Sono como alavanca primária**, talvez superior a meta de horas | Ganha suporte — má qualidade de sono aparece como fator associado |
| **A janela depressiva é central**, não periférica (sua intuição) | Ganha suporte — sintomas depressivos graves entre os associados   |

Isso reordena o roadmap: o **Fisiologista** (sono) sobe de prioridade no
`AI_COACHING_TEAM.md`, e o rastreio de sintomas depressivos deixa de ser
"desejável" e vira parte do núcleo.

---

## 5. Mercado e dimensionamento

### 5.1 Pesquisa Game Brasil (PGB) ✅

13ª edição em 2026, mais de 7 mil respondentes de 16 a 55 anos. É o principal
estudo de consumo de jogos do país.

- https://www.pesquisagamebrasil.com.br/

⚠️ Dados que apareceram em cobertura de imprensa e precisam de confirmação no
relatório oficial:

| Dado                                                 | Implicação se confirmado                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Queda de jogadores de 82,8% (2025) para 75,3% (2026) | O TAM **encolheu**; o plano de negócios atual não considera isso                                                            |
| 44,1% jogam principalmente no **celular**            | **Reforça a tese de telemetria**: Screen Time e Digital Wellbeing cobrem o maior segmento sem depender de API de plataforma |
| Geração Z = 36,5%, e 52,8% mulheres                  | O perfil "Rafael, 22, homem" do MVP_SPEC pode estar enviesado                                                               |

**A terceira linha é desconfortável e importante:** o produto foi desenhado em cima
de uma persona masculina. Se metade dos jogadores são mulheres, e se a literatura
associa IGD a sexo masculino, existe uma tensão real entre "quem joga" e "quem
adoece" que precisa ser resolvida com dado, não com suposição.

**Limite:** PGB é pesquisa de mercado comercial e autorrelatada. Serve para
dimensionar mercado; **não** serve como base clínica.

---

## 6. O que cada fonte substitui no plano de negócios

| Número hoje inventado em `BUSINESS_PLAN.md` | Fonte que o substitui                                               | Esforço |
| ------------------------------------------- | ------------------------------------------------------------------- | ------- |
| TAM (1,5–3 mi de pessoas)                   | PGB (base de jogadores) × prevalência da literatura brasileira      | 1 dia   |
| SAM/SOM                                     | PNS via Base dos Dados (recorte etário, regional, acesso a serviço) | 2 dias  |
| Prevalência de uso problemático             | Literatura revisada + PRO-AMITI                                     | 3 dias  |
| Dimensão da janela de crise                 | SINAN/TabNet + SIM                                                  | 2 dias  |
| Mercado de apostas e regulação              | SPA/MF + BCB                                                        | 1 dia   |
| Custo de SMS (R$ 0,45)                      | Cotação direta com Twilio/Zenvia/Infobip                            | 2 horas |
| CAC, LTV, churn                             | **Nenhuma fonte externa resolve** — só experimento próprio          | 90 dias |

A última linha é a mais honesta do documento: métricas de negócio não se pesquisam,
se medem. Nenhum dado público vai dizer qual é o seu CAC.

---

## 7. Fontes que não consegui abrir desta sessão

O ambiente recebeu HTTP 403 em: TabNet/DATASUS, SciELO e Jornal da USP. São fontes
legítimas e públicas — o bloqueio é do fetcher automatizado, não das fontes.
**Precisam ser abertas em navegador.** Não afirmei nada com base no que não li.

---

## 8. Plano de ação, em ordem de retorno

| #   | Ação                                                          | Prazo       | Retorno                                                      |
| --- | ------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| 1   | **Contato com PRO-AMITI / IPq HC-FMUSP**                      | Esta semana | Destrava E9 inteiro, dá credibilidade e possivelmente coorte |
| 2   | Ler as fontes primárias de prevalência e fechar os números ⚠️ | 3 dias      | Plano de negócios deixa de ser ficção                        |
| 3   | Extrair SINAN por faixa etária e tendência                    | 2 dias      | Dimensiona a janela crítica                                  |
| 4   | Consultar PNS na Base dos Dados (SQL)                         | 2 dias      | SAM/SOM defensáveis                                          |
| 5   | Cotar SMS com três provedores                                 | 2 horas     | Corrige o maior custo variável                               |
| 6   | Mapear obrigações de jogo responsável da SPA                  | 1 semana    | Define se existe wedge B2B regulatório                       |
| 7   | Comprar/obter o relatório PGB completo                        | —           | Corrige o TAM e a persona                                    |

**Custo total: praticamente zero em dinheiro, cerca de duas semanas de trabalho de
uma pessoa.** Contra R$ 650 mil de MVP construído sobre números inventados, é o
melhor retorno disponível no projeto inteiro.

---

## 9. Princípio para manter

> Todo número em documento público deste projeto carrega a fonte ao lado. Número
> sem fonte é hipótese e vem rotulado como tal.

Isso vale especialmente aqui: um produto de saúde que apresenta estimativa como
evidência perde a confiança clínica antes de conquistar o primeiro usuário — e
confiança clínica é o único ativo que este produto não consegue comprar.

---

## Fontes

- [PRO-AMITI — HC-FMUSP](https://www.proamiti.com.br/)
- [IPq HC-FMUSP — Programas e Grupos](https://ipqhc.org.br/saude/ambulatorios-e-servicos/programas-e-grupos/)
- [FMUSP — Transtorno do Controle do Impulso e Dependências Comportamentais](https://www.fm.usp.br/ccex/aperfeicoamento/transtorno-do-controle-do-impulso-e-dependencias-comportamentais)
- [SINAN — Violência Interpessoal/Autoprovocada](https://portalsinan.saude.gov.br/violencia-interpessoal-autoprovocada)
- [Notas técnicas SINAN Violência](http://sistemas.saude.rj.gov.br/tabnetbd/Sinan/Notas_Tecnicas_Violencia.pdf)
- [IBGE — Pesquisa Nacional de Saúde](https://www.ibge.gov.br/estatisticas/sociais/justica-e-seguranca/9160-pesquisa-nacional-de-saude.html)
- [PNS — Fiocruz/Icict](https://www.pns.icict.fiocruz.br/)
- [Base dos Dados — PNS tratada](https://basedosdados.org/dataset/86bac6cc-575f-4289-a857-13f3f52c9a1d)
- [Secretaria de Prêmios e Apostas — Ministério da Fazenda](https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas)
- [SPA/MF — Apostas de Quota Fixa](https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apostas-de-quota-fixa)
- [SPA/MF — Diretrizes de jogo responsável](https://www.gov.br/fazenda/pt-br/assuntos/noticias/2026/secretaria-de-premios-e-apostas-apresenta-diretrizes-de-jogo-responsavel-em-palestra-para-setor-de-atendimento-ao-consumidor)
- [Debates em Psiquiatria — Prevalência e fatores de risco de transtorno do jogo pela Internet](https://revistardp.org.br/revista/article/view/462)
- [Braz J Psychiatry — Prevalence of internet gaming disorder and its psychological correlates](https://www.scielo.br/j/jbpsiq/a/bySvTrn6pXj8MVYqLnqG8Pb/abstract/?lang=pt)
- [RBP — Dependência de Internet e de jogos eletrônicos: uma revisão](https://www.scielo.br/j/rbp/a/T8y3pYpXy7wWj9v6DRdRxfR/?format=pdf&lang=pt)
- [Jornal da USP — Uso problemático de videogames entre jovens do Brasil](https://jornal.usp.br/ciencias/uso-problematico-de-video-games-entre-jovens-do-brasil-e-maior-que-a-media-de-outros-paises/)
- [Pesquisa Game Brasil](https://www.pesquisagamebrasil.com.br/)
