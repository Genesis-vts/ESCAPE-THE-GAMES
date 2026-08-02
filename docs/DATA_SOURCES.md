# FONTES DE DADOS — substituindo estimativa por evidência

> Versão 0.1.0 · Levantamento feito em julho de 2026.
> **Objetivo:** trocar cada número inventado do [BUSINESS_PLAN.md](./BUSINESS_PLAN.md)
> e cada `TODO [CLINICAL]` de prevalência por fonte primária verificável.

---

## 0. Como ler este documento

Cada fonte está marcada com o que foi efetivamente verificado:

| Marca                 | Significado                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ✅ **Verificado**     | Fonte existe, é oficial e o caminho de acesso foi confirmado                                                                                                       |
| ⚠️ **Indício**        | Apareceu em busca, mas o dado **não** foi lido na fonte primária — precisa de leitura antes de virar número oficial                                                |
| 🔒 **Bloqueado aqui** | Fonte pública e acessível, recusada pela **política de egresso** desta sessão. Abre normalmente em navegador ([§7](#7-fontes-que-não-consegui-abrir-desta-sessão)) |

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

## 3.2 Plataforma Centralizada de Autoexclusão — o primeiro dado de mercado real ⚠️✅

Balanços divulgados pelo Ministério da Fazenda e noticiados por veículos de imprensa
e pela Rádio Senado. **A fonte primária (páginas do gov.br) é inalcançável desta
sessão pela política de egresso** — os números abaixo vêm de cobertura secundária e
precisam ser confirmados em navegador antes de virar dado oficial nosso.

### Série de adesão

| Data                  | Cadastros   | Fonte                                                                                                                                                                                                                                                                                                      |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (início, fim de 2025) | 217 mil     | [Gazeta do Povo](https://www.gazetadopovo.com.br/economia/plataforma-autoexclusao-contas-bets-217-mil-brasileiros-cadastros/)                                                                                                                                                                              |
| Maio/2026             | 570 mil     | [Rádio Senado](https://www12.senado.leg.br/radio/1/noticia/2026/05/28/plataforma-de-autoexclusao-de-bets-ja-soma-570-mil-cadastros-de-brasileiros)                                                                                                                                                         |
| Junho/2026            | ~700 mil    | Balanço MF, via imprensa                                                                                                                                                                                                                                                                                   |
| **Julho/2026**        | **925 mil** | [Metrópoles](https://www.metropoles.com/brasil/bets-925-mil-de-pessoas-usaram-ferramenta-de-autoexclusao) · [BNLData](https://bnldata.com.br/autoexclusao-de-apostas-alcanca-925-mil-usuarios-no-brasil/) · [FocusGN](https://focusgn.com/brasil/autoexclusao-nas-bets-alcanca-925-mil-usuarios-no-brasil) |

Ritmo recente da ordem de **+200 mil cadastros por mês**. A plataforma existe desde
o fim de 2025 — ou seja, quase um milhão de pessoas em cerca de sete meses.

> 🔴 **O número de julho está sob contestação.** Em 27/07/2026, Hermano Tavares
> (coordenador do Ambulatório do Jogo Patológico do IPq HC-FMUSP) falou em **"quase
> 800 mil"** no Roda Viva — dez dias depois da imprensa noticiar 925 mil. Pode ser
> defasagem da fala, pode ser métrica diferente: as manchetes dizem "**usaram** a
> ferramenta", que não é sinônimo de "concluíram o cadastro". Enquanto não houver
> fonte primária, **use a faixa de 800–925 mil**, nunca o número cravado. Detalhe em
> [§3.3](#33-roda-viva-com-hermano-tavares--27072026-).

### O dado que vale mais que o total

Do balanço de junho (~700 mil cadastros):

| Indicador                                                               | Valor   | Leitura                                               |
| ----------------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| Optaram por bloqueio **por tempo indeterminado**                        | **69%** | Não é curiosidade nem teste: é decisão de longo prazo |
| Declararam **perda de controle sobre o jogo e impacto na saúde mental** | **41%** | Autoidentificação explícita de sofrimento             |

**41% de ~700 mil ≈ 287 mil pessoas** que, num registro do governo federal,
declararam por conta própria ter perdido o controle e sofrer impacto na saúde
mental. Não é estimativa de prevalência derivada de amostra — é **declaração
espontânea, individual e registrada**.

Para dimensionamento de mercado isto vale mais do que qualquer número de prevalência
que possamos estimar: é a população que **já se identificou**, já agiu, e cujo
tamanho o próprio Estado publica e atualiza mensalmente.

**Ressalvas honestas, que precisam acompanhar o número em qualquer uso:**

1. O motivo declarado é **pergunta opcional** — os 41% são sobre quem respondeu, não
   necessariamente sobre o total. A base do percentual precisa ser confirmada.
2. Autoexcluir-se **não** significa querer ou precisar de um app. É intenção, não
   demanda por produto.
3. Cobre apenas casas **autorizadas**. Quem joga em site irregular não aparece.
4. Não cobre jogo eletrônico sem aposta — o escopo original do produto.

### ⚠️ Contradição encontrada nas fontes — resolver antes de citar

Sobre a reversão do bloqueio por prazo indeterminado, as fontes divergem:

- Uma cobertura afirma **mínimo de 12 meses** para pedir reversão.
- Outra afirma que o pedido **pode ser cancelado em até 30 dias**.

São coisas muito diferentes, e a diferença importa para o argumento de desenho do
[FINANCIAL_CIRCUIT_BREAKER.md](./FINANCIAL_CIRCUIT_BREAKER.md) §1.1. **Confirmar na
página oficial da SPA/MF antes de usar em qualquer material.**

### Dado adjacente de altíssimo valor social

O Ministério da Fazenda impediu **2,8 milhões de beneficiários do Bolsa Família e do
BPC** de apostar em casas regulamentadas
([O Tempo](https://www.otempo.com.br/economia/2026/7/11/fazenda-impediu-2-8-milhoes-de-beneficiarios-do-bolsa-familia-e-do-bpc-de-apostarem-em-bets) ·
[CNN Brasil](https://www.cnnbrasil.com.br/politica/governo-bloqueia-acesso-a-bets-de-28-mi-que-recebem-bolsa-familia-ou-bpc/)).

Isso diz algo duro sobre o perfil socioeconômico do dano — e reforça um
anti-padrão já registrado: **nunca cobrar do usuário pela proteção, nunca oferecer
crédito.** Uma parcela relevante da população afetada é beneficiária de programa de
transferência de renda. Qualquer modelo B2C de assinatura exclui exatamente quem
mais precisa.

### Onde acessar a fonte primária 🔒

- Serviço: https://www.gov.br/pt-br/servicos/plataforma-centralizada-de-autoexclusao-apostas
- Página da SPA/MF: https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/autoexclusao
- Nota de julho/2026: https://www.gov.br/fazenda/pt-br/assuntos/noticias/2026/julho/plataforma-centralizada-de-autoexclusao-permite-bloquear-sites-de-apostas-autorizados-de-uma-so-vez
- Plataforma: `autoexclusaoapostas.fazenda.gov.br` (requer conta gov.br)

**Ação recomendada:** pedido via **Lei de Acesso à Informação (LAI)** à SPA/MF
solicitando a série histórica de cadastros, a distribuição por prazo escolhido, os
motivos declarados com a base de cada percentual, e o perfil demográfico agregado.
É gratuito, tem prazo legal de resposta e transforma cobertura de imprensa em dado
oficial citável. **É a ação de maior retorno por esforço de todo este documento.**

---

## 3.3 Roda Viva com Hermano Tavares — 27/07/2026 ⚠️

**Origem:** post no LinkedIn de 28/07/2026 (data extraída do próprio identificador do
post, `7487878264473116672`). **O post não pôde ser lido** — o LinkedIn responde 403 a
qualquer acesso não autenticado. O que está abaixo veio de cobertura secundária sobre
o programa a que o post quase certamente se refere, exibido na véspera.

**Quem é:** psiquiatra, livre-docente da USP, pós-doutorado em jogo patológico pela
Universidade de Calgary, fundador e coordenador do **Ambulatório do Jogo Patológico
(PRO-AMJO) do IPq HC-FMUSP** desde os anos 1990. É o interlocutor nomeado no
[PUBLIC_SECTOR_STRATEGY.md](./PUBLIC_SECTOR_STRATEGY.md) §3, Caminho 1.

**Programa:** Roda Viva, TV Cultura, segunda-feira **27/07/2026**, 22 h
([vídeo](https://www.youtube.com/live/6QyBVMzWd-g)).

### O que a cobertura atribui a ele

| #   | Afirmação                                                                                                                                            | Confiança                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Classifica o fenômeno como **"tsunami"**, mas reconhece avanços concretos na regulação                                                               | ⚠️ duas fontes independentes   |
| 2   | **A SPA/MF procurou o setor de saúde** para construir soluções em conjunto — segundo ele, a primeira vez que o regulador toma essa iniciativa        | ⚠️ duas fontes                 |
| 3   | Existe um **questionário de autoavaliação de 3 perguntas** embutido no ambiente digital, derivado de pesquisa populacional feita **com a Caixa**     | 🔶 uma fonte só                |
| 4   | Autoexclusão: **"quase 800 mil"** brasileiros                                                                                                        | 🔶 conflita com §3.2           |
| 5   | O que mudou não foi o cérebro, foi o acesso: o cassino passou a caber no bolso, a "dois cliques" — mecanismo cerebral comparável a álcool e nicotina | ⚠️ várias fontes               |
| 6   | Atendimentos por vício em apostas **triplicaram em três anos** em SP; o PRO-AMJO iniciou tratamento de **66 pacientes em 2023**; há fila de espera   | ⚠️ Metrópoles, não o Roda Viva |

### A bancada

Mara Luquet (MyNews), Gabriela Caseff (Folha de S.Paulo), Fabiana Cambricoli
(Estadão) e Thiago Domenici (Agência Pública). ⚠️

### O item 3 tem fonte primária localizada ✅ rastreado

O rastreio de 3 perguntas **deixou de ser boato**: a origem provável é a dissertação
de mestrado de Juan David Tovar Velásquez (FMUSP, 2021), orientada pelo próprio
Hermano Tavares, com PDF público. Detalhamento em [§4.0.1](#401-o-instrumento-de-triagem--encontrado-).

### O que o item 2 muda na estratégia

### O que o item 2 muda na estratégia

O `PUBLIC_SECTOR_STRATEGY.md` supunha que aproximar regulador e saúde seria trabalho
nosso. Se o regulador já fez isso por conta própria, a **janela do Caminho 2**
(obrigação regulatória sobre as operadoras) está aberta agora, não daqui a dois anos.
Aumenta o retorno de participar de consulta pública da SPA/MF — e aumenta a urgência,
porque essa janela fecha quando a regra é publicada.

### O que **não** foi possível apurar 🔒

- O texto do post no LinkedIn.
- A transcrição do programa — a política de egresso desta sessão recusa YouTube,
  TV Cultura, IPq, BNLData, Folha de Londrina, Locomotiva Social e Observatório 3º
  Setor. **Nenhum deles está bloqueando leitores; veja [§7](#7-fontes-que-não-consegui-abrir-desta-sessão).**
- Se o post é de fato sobre o Roda Viva. A data (véspera) e o texto do slug
  (`o-prof-dr-hermano-tavares-do-departamento…`) apontam para sim, mas é **inferência**.
- Qualquer número de prevalência que ele tenha citado no programa.

**Ação:** assistir ao vídeo em navegador e transcrever as passagens dos itens 3 e 4.
São ~90 minutos e resolvem tanto o bloqueio clínico quanto a contradição do §3.2.

---

## 4. Prevalência de transtorno de jogo — literatura brasileira

### 4.0 LENAD III — a fonte que fecha a maior lacuna do plano ⚠️ **prioridade máxima de leitura**

**Levantamento Nacional de Álcool e Drogas, 3ª edição** — Unifesp/UNIAD, divulgado
pelo **OBID / Ministério da Justiça**. Inquérito epidemiológico domiciliar com
**16,6 mil participantes de 14 anos ou mais**, em todas as regiões, com campo entre
**2023 e 2024**. Resultados sobre jogo apresentados em **abril de 2025** em evento na
Unifesp.

| Indicador                                     | Valor            | % da população 14+ |
| --------------------------------------------- | ---------------- | ------------------ |
| **Jogadores de risco**                        | **10,9 milhões** | **6,8%**           |
| **Transtorno do jogo** (critério diagnóstico) | **1,4 milhão**   | **0,8%**           |
| Proporção de jogadores de risco que adoecem   | ~1 em cada 8     | —                  |

"Jogador de risco" é definido como quem joga de modo a **criar problemas emocionais,
familiares, econômicos ou de trabalho para si**.

**Por que isto muda o `BUSINESS_PLAN.md`:** a §3.2 lista "prevalência real de
transtorno de jogo" como pergunta em aberto, a ser respondida em 3 dias de leitura.
A resposta existe, é nacional, é domiciliar, é recente e é do governo. Substitui
qualquer TAM estimado por analogia.

**Leitura cruzada com a autoexclusão, e ela é dura:** 1,4 milhão de pessoas com
transtorno do jogo contra 800–925 mil autoexcluídos. Se as duas ordens de grandeza se
confirmarem, **a maior parte de quem preenche critério diagnóstico já levantou a
mão** — o funil de captação é muito mais curto do que o plano supõe, e o gargalo real
é o que acontece _depois_ do bloqueio. É exatamente a tese do produto, agora com
número em cima.

**Ressalvas:** é jogo em geral (LENAD cobre álcool, drogas e jogo), **não** é recorte
de apostas online; e "jogador de risco" não é diagnóstico. Os valores vieram de
resumo de busca — **nenhum foi lido na fonte primária** (ver §7).

- Cobertura: [Terra](https://www.terra.com.br/vida-e-estilo/saude/pesquisa-mostra-que-11-milhoes-de-brasileiros-fazem-uso-arriscado-de-apostas,8437f9e94ab1f8cc64baa18c1d01c604i2wcyzuz.html) ·
  [APM](https://www.apm.org.br/pesquisa-mostra-que-11-milhoes-de-brasileiros-fazem-uso-arriscado-de-apostas/) ·
  [Revista Metropolitana](https://revistametropolitana.com.br/noticia/54034/1-4-milhao-de-brasileiros-tem-transtorno-de-jogo-aponta-estudo-inedito)
- Reportagem de fundo: [Pesquisa FAPESP nº 351, "Como joga o brasileiro"](https://revistapesquisa.fapesp.br/wp-content/uploads/2025/04/044-047_jogo_351.pdf)

### 4.0.1 O instrumento de triagem — ✅ LIDO NA ÍNTEGRA E IMPLEMENTADO

> **Tovar Velásquez, Juan David.** _Transtorno do jogo e jogo problemático nas
> loterias brasileiras: construindo uma amostra nacional representativa dos
> apostadores de loteria e validação de um instrumento de triagem._
> Dissertação de Mestrado, Faculdade de Medicina da USP, 2021.
> **Orientador: Prof. Dr. Hermano Tavares.**
>
> - Registro: https://repositorio.usp.br/item/003071791
> - PDF integral: https://teses.usp.br/teses/disponiveis/5/5142/tde-29032022-125916/

**Status:** dissertação lida por completo. Implementada em
`services/api/src/modules/screening/nods3.ts`, com testes que travam os enunciados e
o ponto de corte.

#### Desenho e amostra ✅

23.123 abordados · 7.226 elegíveis · **5.407 entrevistas completas** · **494
unidades lotéricas** (de 500 planejadas) em todo o país · recusa 25,2%. Padrão-ouro:
NODS completa com critérios DSM-5.

Apostador médio: **homem (83,9%), 50,2 anos**, casado, ensino médio completo,
empregado ou autônomo.

#### Os três itens (NODS #4, #8, #10) ✅

| # NODS | Construto            | Enunciado                                                                                                                              |
| ------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **4**  | Perda de controle    | "Você já tentou parar, reduzir, ou controlar as suas apostas?"                                                                         |
| **8**  | Escapismo            | "Você já apostou como uma forma de escapar dos seus problemas pessoais?"                                                               |
| **10** | Jogar para recuperar | "Já houve um período em que quando você perdia dinheiro numa aposta você voltava um outro dia para tentar recuperar (e ficar quites)?" |

**Ponto de corte: uma resposta positiva basta** (regra da metodologia NODS-CLiP,
seguida pela dissertação).

#### Acurácia na amostra de validação ✅ (Tabela 3)

| Período          | Desfecho           | Sensibilidade | Especificidade | Youden |
| ---------------- | ------------------ | ------------- | -------------- | ------ |
| Últimos 12 meses | Transtorno do jogo | **100%**      | 72,9%          | 0,73   |
| Últimos 12 meses | Jogo problema      | 96,5%         | 73,9%          | 0,70   |
| Ao longo da vida | Transtorno do jogo | **100%**      | 66,1%          | 0,66   |
| Ao longo da vida | Jogo problema      | 95,2%         | 70,5%          | 0,66   |

Supera a NODS-CLiP original (itens #1, #4, #11), que ficou em 97,3% / 70,6% para TJ
no último ano.

⚠️ **Nuance que a dissertação não esconde e nós também não devemos:** a combinação de
**4 itens** (#5, #7, #9, #10) tem Youden bem melhor para TJ (0,89, com
especificidade 88,9%). O autor recomenda a de 3 itens porque ela tem a maior
sensibilidade para **jogo problema** — o estrato mais amplo. Para triagem que
encaminha a apoio, priorizar sensibilidade é a escolha certa; mas a especificidade
de ~73% significa que **cerca de 1 em cada 4 rastreios positivos não é caso**. Isso
proíbe usar o resultado para qualquer coisa intrusiva.

#### 🛑 O limite de generalização — declarado pelos autores (§6.1)

> "os itens foram derivados de jogadores de loteria legais, a sensibilidade e
> especificidade desses itens para classificar TJ **não podem ser generalizados para
> jogadores não lotéricos no Brasil**."

**O público deste produto não é a população de validação.** Apostas online e jogo
eletrônico não são loteria, e o apostador do estudo tem 50 anos. O instrumento é o
**melhor ponto de partida com validação brasileira** — não é um rastreio validado
para os nossos usuários. `TODO [CLINICAL]`: validar nesta população antes de usar o
resultado em qualquer decisão automatizada de maior consequência. É exatamente o tipo
de estudo que a parceria com o PRO-AMITI ([§1](#1-o-achado-que-muda-o-projeto)) torna
possível.

#### Prevalência entre apostadores de loteria ✅ (Tabela 1, últimos 12 meses)

| Categoria          | Últimos 12 meses | Ao longo da vida |
| ------------------ | ---------------- | ---------------- |
| Jogador em risco   | 17,7%            | 19,4%            |
| Jogo problema      | 10,7%            | 13,1%            |
| Transtorno do jogo | **4,1%**         | 6,8%             |

Muito acima da prevalência populacional (a dissertação cita ~1% no Brasil) — o que
sustenta a conclusão do autor de que a lotérica é ponto estratégico de rastreio.

#### ✅ Inferência resolvida: os "3 Cs" são este instrumento

A inferência que estava aberta aqui — se o rastreio de 3 perguntas citado
publicamente por Hermano Tavares era este — **está confirmada**. Em entrevista à
revista **Radis (Fiocruz), 20/08/2025**, ele enuncia os sinais de alerta assim:

> "São o que chamamos de **3 Cs**: **controle** ou perda de controle (a pessoa gasta
> mais dinheiro ou mais tempo do que pretendia); **confronto** (a pessoa usa o jogo
> para 'confrontar' ou lidar com suas emoções negativas, isto é, aposta mais quando
> está triste, angustiado ou entediado); e **caça** (a pessoa persegue, 'caça' um
> resultado) […] **Qualquer um desses três sinais, mesmo que isoladamente**, é um
> sinal preocupante."

Mapeamento exato, na ordem, incluindo o ponto de corte:

| "C" de Tavares | Item NODS | Construto na dissertação |
| -------------- | --------- | ------------------------ |
| **Controle**   | #4        | Perda de controle        |
| **Confronto**  | #8        | Escapismo                |
| **Caça**       | #10       | Jogar para recuperar     |

**Consequência prática:** "os 3 Cs" é a formulação pública da mesma triagem, dita
pela maior referência clínica do país em linguagem que qualquer pessoa entende. É a
linguagem que deve aparecer na interface — não o jargão. Já refletido em
`modules/screening/nods3.ts`.

---

### 4.1 Demais estudos brasileiros

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

### 4.1.1 Quatro fontes clínicas lidas na íntegra ✅

| Fonte                                                                                                                                                 | O que é                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Radis nº ... (Fiocruz), 20/08/2025** — "As bets colocaram um cassino em cada bolso". Entrevista com Hermano Tavares, por Jesuan Xavier              | Entrevista, formulação dos **3 Cs**         |
| **BBC News Brasil** — "Bets e transtorno do jogo: o que acontece no cérebro de pessoas viciadas em apostas"                                           | Reportagem com Tavares, Spanemberg, Andrade |
| **Psicologia USP, 2022, v.33, e210007** — doi 10.1590/0103-6564e210007                                                                                | Artigo revisado por pares sobre o PRO-AMJO  |
| **Spritzer DT, Picon FA, Breda VCT** — "Dependência de jogos eletrônicos em crianças e adolescentes", cap. em _Clínica da Impulsividade_ (GEAT/UFRGS) | Capítulo de livro sobre **IGD em menores**  |

#### 🛑 O achado que contraria o desenho atual do produto

O capítulo do GEAT afirma, sobre **jogo eletrônico** (não apostas):

> "Ao contrário do tratamento de dependências de álcool e outras substâncias, o
> tratamento da dependência de jogos eletrônicos na maioria das vezes **não tem como
> objetivo a abstinência completa** […] busca-se a **moderação** do comportamento."

E, sobre tempo de jogo:

> "Apesar de o tempo de jogo estar associado com o desenvolvimento de problemas, ele
> acaba sendo um **marcador indireto** deste transtorno, pois existe uma significativa
> parcela de jogadores com uso bastante intenso que **não apresenta necessariamente
> prejuízo**."

Duas consequências desconfortáveis para este repositório:

1. **A métrica-mãe está mal formulada para jogo eletrônico.** "Horas de jogo evitadas"
   mede o marcador indireto, não o prejuízo. Para apostas ela se sustenta (abstinência
   é meta de primeira fase); para games, penaliza quem joga muito sem sofrer dano.
2. **O produto inteiro é abstinência-forma.** Autoexclusão, disjuntor, botão de pânico
   — tudo desenhado para _parar_. É o modelo certo para apostas e o modelo errado, por
   padrão, para jogo eletrônico.

Isso não é ajuste de texto: é a **decisão de escopo do [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) §10
item 1** ganhando evidência clínica. Apostas e jogo eletrônico pedem produtos com meta
terapêutica diferente. Tentar servir aos dois com um só desenho serve mal aos dois.

#### O gargalo, em números ✅

Tavares à BBC, sobre o serviço público de referência do país:

> "Com a nossa estrutura atual, conseguimos atender **80 casos novos por ano**, além de
> acompanhar outros **160 pacientes** […] Mas diante de um fenômeno como esse que
> vivemos agora, ficamos com o **triplo de pacientes na fila de espera**."

**80 casos novos por ano contra 1,4 milhão de pessoas com transtorno do jogo**
([§4.0](#40-lenad-iii--a-fonte-que-fecha-a-maior-lacuna-do-plano-️-prioridade-máxima-de-leitura)).
É o argumento mais forte que este projeto tem para a camada contínua: não existe
capacidade clínica para atender essa população por consulta, e não vai existir.

#### Demais achados aproveitáveis

| Achado                                                                                                                       | Fonte     | Onde muda algo                                 |
| ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------- |
| Perfil vulnerável: **mais jovens, desempregados, escolaridade incompleta, solteiros ou solitários**                          | Radis     | Confirma "nunca cobrar de quem sofre"          |
| Histórico familiar de dependência e transtorno mental prévio elevam o risco                                                  | Radis     | Rastreio de comorbidade no onboarding          |
| **Comorbidade é a regra**; tratar depressão de base reduz o comportamento de jogo                                            | BBC/cap.  | Sobe prioridade do rastreio de depressão       |
| **Regularização do ciclo sono-vigília** é objetivo explícito de tratamento                                                   | Capítulo  | Confirma o "Fisiologista" do AI_COACHING       |
| Terapia **familiar** é indicada quando o paciente não reconhece o problema                                                   | Capítulo  | Confirma a aposta no preparo do familiar       |
| **84%** dos jovens com IGD mantinham o diagnóstico após 2 anos                                                               | Capítulo  | Não é fase passageira — justifica o contínuo   |
| Prevalência de IGD em adolescentes varia **0,3% a 38%** conforme o instrumento                                               | Capítulo  | Cuidado com qualquer número de IGD             |
| Transtorno do jogo atinge **0,4–0,6%** da população (revisão Nature Reviews, 2019)                                           | BBC       | Referência internacional vs. LENAD (0,8%)      |
| Tavares: **12–15%** dos brasileiros apostam regularmente; **~15% desses** desenvolvem dificuldade                            | BBC       | Ordem de grandeza alternativa                  |
| Fases de Custer: **vitória → perda → desespero**                                                                             | Psic.USP  | Modelo de estágio para a jornada               |
| Exposição **antes dos 18 anos** é fator de vulnerabilidade relevante; adolescentes expostos aumentaram muito pós-legalização | BBC/Radis | Reforça o bloqueio de lançamento sobre menores |
| Não há medicação comprovada para IGD; antagonistas opioides ajudam no transtorno do jogo                                     | cap./BBC  | Fora do nosso escopo — não sugerir nada        |

### 4.1.2 Gênero — o efeito telescópio ⚠️ **muda um parâmetro do produto**

> **Martins, Silvia Saboia.** _Jogo patológico no gênero feminino: características
> clínicas e de personalidade._ Faculdade de Medicina da USP.
> https://teses.usp.br/teses/disponiveis/5/5142/tde-05042007-110036/
> Revisão relacionada: [Pathological gambling in women: a review](https://www.scielo.br/j/rhc/a/GMc5BwRSnRVfvF3ZJmZMJfG/?lang=en) (SciELO)

🔒 **Não foi possível ler a fonte primária** — `teses.usp.br` e o espelho
`jogoremoto.pt` estão fora da allowlist de egresso desta sessão. O que segue vem de
resumo de busca e é **⚠️, não ✅**.

**Desenho:** 78 mulheres e 78 homens com jogo patológico. Instrumentos: SOGS e
critérios DSM-IV (diagnóstico), SCAN (comorbidade), Inventário de Temperamento e
Caráter e Escala de Impulsividade de Barratt (personalidade).

| Achado                                                                                              | Implicação                                     |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Efeito telescópio:** ~**14 anos** de envolvimento até o quadro em homens, ~**4 anos** em mulheres | A janela de intervenção é ~3,5× mais curta     |
| Maior comorbidade com **depressão** em mulheres                                                     | O módulo de crise pesa mais para elas          |
| Jogo como **válvula de escape** para tensões e crises depressivas                                   | É o "C" de **Confronto** (item #8) em destaque |
| Preferência por **jogos eletrônicos** — possível explicação da progressão rápida                    | Ver a ressalva de leitura abaixo               |

#### Por que isto não é ajuste de persona

O `MVP_SPEC.md` foi desenhado sobre "Rafael, 22, homem". Se a progressão de jogo
social a patológico leva ~4 anos em mulheres contra ~14 em homens, então **o tempo
disponível para toda a estratégia de pré-compromisso em estado frio é
substancialmente menor para metade da população**. Isso não é um detalhe de
representatividade — é um **parâmetro temporal** do produto, e ele está calibrado
hoje para o caso mais lento.

Some-se: mulheres teriam mais comorbidade depressiva, e o `CRISIS_PROTOCOL.md` existe
justamente para a janela depressiva. O produto tem persona masculina e um módulo de
crise cuja população mais exposta pode ser feminina.

#### ⚠️ Ressalva de leitura que pode inverter a conclusão

Na literatura de jogo de azar, **"jogos eletrônicos" costuma significar máquinas
eletrônicas de jogo** (caça-níqueis, bingo eletrônico) — **não** videogame. Se for
esse o sentido aqui, o achado **não** diz nada sobre a decisão de escopo
"apostas × jogo eletrônico" do [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) §10. Ler a
fonte antes de usar em qualquer argumento sobre videogames.

#### Ressalva de época — a mais importante

A tese é **anterior à aposta online**. Retrata a era do bingo e do caça-níquel, com
amostra **clínica** (quem procurou tratamento), não populacional. Duas consequências:

1. O efeito telescópio pode estar **subestimado** hoje: se o cassino cabe no bolso,
   a progressão tende a encurtar para todos os gêneros.
2. Amostra de quem busca tratamento tem viés próprio — homens e mulheres não
   procuram ajuda no mesmo momento da doença.

**Ação:** ler a fonte primária e checar se há replicação pós-2020. É a pergunta de
pesquisa mais atraente para levar ao PRO-AMITI, porque une o dado deles com o
fenômeno novo.

### 4.2 O achado que valida a estratégia ⚠️

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

**Correção de diagnóstico.** Uma versão anterior desta seção dizia que o 403 vinha
dos sites, que estariam barrando acesso automatizado. Está errado. O proxy de saída
desta sessão registra a recusa explicitamente:

```
{ "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)" }
```

É **política de egresso do ambiente**, com allowlist estreita — a conexão nem chega
ao site. A distinção importa: **nenhuma destas fontes está defendida contra leitores.
Todas abrem normalmente em um navegador comum.** Não há obstáculo real a apurá-las;
só não dá para fazer isso a partir daqui.

Hosts recusados até agora: `cultura.uol.com.br`, `repositorio.usp.br`,
`teses.usp.br`, `revistapesquisa.fapesp.br`, `apm.org.br`, `grea.org.br`,
`linkedin.com`, `youtube.com`, TabNet/DATASUS, SciELO, `jornal.usp.br`,
`gov.br`, `bnldata.com.br`, `ipqhc.org.br`, `folhadelondrina.com.br`.

**Consequência prática:** tudo neste documento marcado ⚠️ ou 🔶 veio de resumo de
mecanismo de busca, não de leitura de fonte. Duas horas de navegador convertem a
maior parte disso em ✅. Não afirmei nada com base no que não li.

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
