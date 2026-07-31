# ESTRATÉGIA DE SETOR PÚBLICO

> Versão 0.1.0 · julho de 2026 · Escrito **depois** de descobrir que o Estado
> brasileiro já ocupa a camada base deste problema. Números e fontes em
> [DATA_SOURCES.md](./DATA_SOURCES.md).

---

## 1. A premissa que mudou

O plano de negócios original supunha um mercado desassistido. Não é o caso. Entre
dezembro de 2025 e julho de 2026 o governo federal entregou:

| Entrega                                     | Órgão       | O que faz                                                                        |
| ------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| **Plataforma Centralizada de Autoexclusão** | Fazenda/SPA | Bloqueia o CPF em **todas** as casas autorizadas. ~925 mil cadastros em jul/2026 |
| **Guia de Cuidado** para profissionais      | Saúde       | Orienta acolhimento e tratamento na rede pública                                 |
| **Mini-app no Meu SUS Digital**             | Saúde       | Autoavaliação + encaminhamento automático a teleatendimento                      |
| **Teleatendimento especializado**           | SUS         | Psicólogo e psiquiatra, gratuito, nacional                                       |
| **Campanha nacional de prevenção**          | Saúde       | Conscientização em massa                                                         |
| **Bloqueio de beneficiários**               | Fazenda     | 2,8 mi de beneficiários do Bolsa Família e BPC impedidos de apostar              |

**Conclusão estratégica:** a pergunta "o governo compraria a solução?" está mal
formulada. O governo **já é operador** neste espaço. A pergunta certa é: **onde
complementamos sem duplicar?**

---

## 2. O mapa de quem faz o quê

```
┌──────────────────────────────────────────────────────────────────┐
│  ESTADO — camada episódica, já construída                        │
│                                                                  │
│  campanha  →  autoexclusão  →  triagem  →  teleconsulta          │
│  (massa)      (acesso)         (mini-app)   (SUS)                │
└──────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ encaminha para
                                  │
┌──────────────────────────────────────────────────────────────────┐
│  LACUNA — camada contínua, entre as consultas                    │
│                                                                  │
│  rede de apoio verificada · botão de pânico · plano frio         │
│  telemetria · preparo do familiar · a madrugada do dia 3         │
│                                                                  │
│  ← é exatamente o que já está construído neste repositório       │
└──────────────────────────────────────────────────────────────────┘
```

**A autoexclusão resolve o acesso. Não resolve o dia 3 nem o dia 30.**

Quem bloqueia o CPF por tempo indeterminado — 69% dos cadastrados — passa a ter um
problema novo: os meses seguintes, sem o comportamento que organizava suas noites,
sem ninguém sabendo, e com uma consulta marcada daqui a algumas semanas. Esse
intervalo é o produto.

---

## 3. Os quatro caminhos, em ordem de retorno

### Caminho 1 — Parceria de pesquisa 🟢 comece por aqui

**Com quem:** PRO-AMITI / PRO-AMJO (IPq HC-FMUSP), grupos de pesquisa em saúde
mental digital, Fiocruz.

**O que se pede:** colaboração científica, não consultoria paga. Eles têm coorte,
instrumentos validados e comitê de ética; nós temos a camada de software que falta
entre as consultas deles.

**O que destrava:** o épico E9 inteiro (diretor clínico, critérios de detecção,
revisão dos textos), o instrumento de triagem, e credibilidade externa — que é o
único ativo que este produto não consegue comprar.

**Custo:** carta e reuniões. **Prazo:** semanas.

### Caminho 2 — Obrigação regulatória sobre as operadoras 🟢 maior potencial de receita

**Tese:** o governo não precisa comprar. Basta que a regulação exija das casas
autorizadas ferramenta **independente** de proteção do apostador, com desfecho
auditável. Aí o comprador é a operadora, que tem orçamento, prazo de conformidade e
risco de sanção.

**Por que é o wedge mais forte:** transforma o produto de "app de bem-estar"
(discricionário, difícil de vender) em **item de conformidade** (obrigatório,
orçado).

**Como avançar:** consulta pública da SPA/MF, contribuição técnica, aproximação com
a área de jogo responsável do regulador.

**A armadilha, registrada em letra grande:** vender para o setor que causa o dano
destrói a legitimidade se a estrutura não for independente. Exige auditoria clínica
externa, publicação de metodologia e compromisso explícito de nunca otimizar para
tempo de aposta. **Sem isso, recuse o contrato.**

### Caminho 3 — Financiamento pelo fundo setorial 🟡

A Lei nº 14.790/2023 destina parte da arrecadação das apostas de quota fixa a áreas
como saúde, educação, esporte e segurança. Além disso, o MPF já defende ampliar
recursos do SUS para tratamento de dependência de apostas.

**Racional político:** o dinheiro sai do setor que gera o dano, não do orçamento
apertado da saúde. É a narrativa mais fácil de defender publicamente.

**Prazo realista:** 12 a 24 meses. Emenda parlamentar, chamada pública ou convênio.
**Não planeje receita de curto prazo com isso.**

### Caminho 4 — Software público / código aberto 🟡 o mais alinhado à missão

**Tese:** em vez de vender licença, publicar o núcleo sob licença livre e deixar o
Estado adotar e distribuir. Monetiza-se serviço, integração, suporte e a camada B2B.

**Por que faz sentido aqui:** um produto cuja métrica-mãe é "o usuário abre o app
menos" e que se recusa a monetizar dado de saúde tem **defensabilidade comercial
fraca por construção**. Esse é exatamente o perfil do que deve ser infraestrutura
pública, não startup.

**Contorna** licitação inteiramente — não há compra, há adoção.

**Custo honesto:** limita o teto de valorização. É uma escolha de missão, e precisa
ser feita conscientemente pelos fundadores, não por acidente.

### O que NÃO fazer 🔴

**Venda direta ao governo federal como receita primária.** Lei nº 14.133/2021, ciclo
de 12–24 meses, produto não-único dificilmente justifica inexigibilidade, e virar
fornecedor único significa roadmap refém de mudança de gestão. Muitos produtos
públicos morreram assim. Pode acontecer — não pode ser o plano.

---

## 4. Integrações concretas com o que já existe

Ordenadas por viabilidade:

| #   | Integração                                     | Como                                                                                   | Bloqueio                              |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | **Conduzir à autoexclusão oficial**            | Link e orientação no momento certo (estado frio ou pós-crise). Zero integração técnica | Nenhum — fazer já                     |
| 2   | **Encaminhar ao teleatendimento do SUS**       | O degrau N4 da escada de crise passa a apontar para serviço gratuito e nacional        | Nenhum — só ajustar o protocolo       |
| 3   | **Alinhar critérios ao Guia de Cuidado do MS** | Adotar a referência oficial em vez de inventar                                         | Ler o Guia `TODO [CLINICAL]`          |
| 4   | **Login gov.br**                               | Identidade forte, reduz fricção e fraude                                               | Credenciamento                        |
| 5   | **Verificar adesão à autoexclusão**            | Confirmar se o usuário está autoexcluído                                               | Depende de via oficial `TODO [LEGAL]` |

Os três primeiros custam quase nada e melhoram o produto imediatamente. **O item 2
é o mais valioso:** hoje o protocolo de crise depende de "profissional vinculado",
que quase nenhum usuário terá. Apontar para o SUS resolve isso de graça e em escala
nacional.

---

## 5. O que isso faz com o plano de negócios

Três consequências duras:

**1. O B2C por assinatura enfraquece muito.** Competir com SUS gratuito na camada
clínica é perder. Pior: 2,8 milhões dos afetados são beneficiários de Bolsa Família
e BPC — cobrar assinatura exclui exatamente quem mais precisa.

**2. O comprador provável muda.** Deixa de ser a pessoa em sofrimento e passa a ser
quem tem obrigação ou orçamento: **operadora sob conformidade**, família, e
instituição (universidade, empresa).

**3. O produto encolhe e melhora.** Some o disjuntor financeiro (o Estado fez),
some parte da triagem (o Estado fez), some a campanha de conscientização (o Estado
fez). Sobra o núcleo denso: **rede de apoio verificada, botão de pânico, plano frio,
preparo do familiar, telemetria.** Menos escopo, mais foco.

---

## 6. As três primeiras ações

| #   | Ação                                                           | Prazo       | Por quê                                                        |
| --- | -------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| 1   | **Carta ao PRO-AMITI / IPq-USP**                               | Esta semana | Destrava o E9, dá credibilidade, custo zero                    |
| 2   | **Pedido via LAI à SPA/MF**                                    | Esta semana | Transforma notícia em dado oficial; traz o recorte demográfico |
| 3   | **Ler o Guia de Cuidado do MS e alinhar o protocolo de crise** | 2 semanas   | Substitui critérios inventados por referência oficial          |

Nenhuma custa dinheiro. Todas destravam bloqueios que hoje param o roadmap.

---

## 7. O risco que eu vigiaria

**Captura por dependência de um único canal.** Se a receita vier majoritariamente de
operadoras de aposta, o produto vira departamento de conformidade delas. Se vier
majoritariamente do governo, vira refém de ciclo eleitoral.

Mitigação: nenhuma fonte acima de metade da receita, auditoria clínica externa
permanente, e a metodologia de medição de desfecho publicada — para que qualquer
pessoa possa verificar se o produto realmente reduz dano ou apenas parece reduzir.
