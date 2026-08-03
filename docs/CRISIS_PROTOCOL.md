# PROTOCOLO DE CRISE — ESCAPE-THE-GAMES

> Versão 0.1.0 · **ESPECIFICAÇÃO PARA REVISÃO.** Nenhuma linha deste módulo deve
> ser implementada antes de ter um responsável clínico nomeado que assine este
> documento. Todo o conteúdo abaixo é `TODO [CLINICAL]` até revisão profissional.

---

## 0. O que este documento é e o que não é

**É:** a especificação de como o produto se comporta quando detecta sinais de
sofrimento agudo ou risco de autoagressão, e de quem responde por isso.

**Não é:** um protocolo de atendimento clínico, nem substituto de treinamento em
manejo de risco suicida, nem parecer jurídico.

**Regra que governa todo o resto:**

> Em crise aguda, o software **detecta, sustenta por poucos minutos e entrega a um
> humano**. Ele não conduz, não avalia risco sozinho para decidir conduta, e nunca
> é a única coisa entre a pessoa e o dano.

---

## 1. A janela crítica

O quadro que este protocolo endereça não é a fissura por jogar. É o **desabamento
após a perda** — em especial perda financeira, e mais ainda quando o dinheiro era
de terceiros ou da família.

```
perda  →  vergonha e desespero  →  impulso de recuperar  →  perda maior
                                          ↓
                            colapso agudo (minutos a horas)
                                          ↓
                     risco de autoagressão / ideação suicida
```

Três propriedades que definem o desenho:

| Propriedade                                                  | Consequência de produto                                                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Início abrupto** — a virada emocional acontece em segundos | O sistema precisa reagir em segundos, não em ciclos de análise                                                                                  |
| **Capacidade cognitiva mínima**                              | Frases curtas, uma voz, nenhuma escolha complexa                                                                                                |
| **Componente financeiro no meio letal**                      | Restringir acesso a dinheiro é intervenção de segurança, não só de recaída — ver [FINANCIAL_CIRCUIT_BREAKER.md](./FINANCIAL_CIRCUIT_BREAKER.md) |

> `TODO [CLINICAL]` — a consultoria clínica deve levantar e citar a literatura de
> prevalência e risco desta população (uso problemático de jogo **com** perda
> financeira / jogo de azar). **Não** publique número que não venha dessa revisão.

---

## 2. Mudança de escopo que este protocolo implica

O produto foi especificado para **uso problemático de jogos** (tempo). Ao endereçar
perda financeira, ele encosta em **dano por jogo de azar** — caixas de recompensa,
compras dentro do jogo, apostas.

Isso muda: enquadramento regulatório, competência clínica exigida e perfil de risco.

**Decisão pendente de produto e jurídico** — `TODO [LEGAL]`:

- [ ] O escopo inclui perda financeira? (se sim, revisar todo o `SECURITY_AND_COMPLIANCE.md`)
- [ ] O produto se posiciona em jogo de azar regulado? Quais obrigações decorrem?
- [ ] O disclaimer atual ("não é serviço de emergência") é suficiente neste escopo?

---

## 3. Sinais de detecção

Três fontes, combinadas. Nenhuma isolada dispara o nível mais alto.

| Fonte              | Exemplos                                                                                                                 | Confiança                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Declarado**      | Texto do usuário na mensagem de acionamento; resposta a instrumento de triagem                                           | Alta                          |
| **Comportamental** | Sequência de sessões longas madrugada adentro; múltiplos acionamentos em janela curta; gasto atípico seguido de silêncio | Média                         |
| **Contextual**     | Rompimento de limite financeiro; horário; privação de sono acumulada                                                     | Baixa isolada, útil combinada |

**O que existe hoje no código:** `detectarSinalDeRisco()` em
`services/api/src/modules/panic/panic.service.ts` — lista de termos, marcada como
marcador de escopo, **não** instrumento validado.

**O que precisa ser definido antes de produção** — `TODO [CLINICAL]`:

- [ ] Critérios de detecção e seus pontos de corte
- [ ] Taxa de falso negativo aceitável (o erro que importa aqui)
- [ ] Taxa de falso positivo tolerável antes de gerar fadiga e desconfiança
- [ ] Se um modelo de linguagem participa da classificação, com qual supervisão

**Princípio de calibragem:** neste módulo, falso positivo custa incômodo; falso
negativo pode custar uma vida. A calibragem é assimétrica **por decisão explícita**,
registrada aqui, com o custo de fadiga assumido e monitorado.

---

## 4. A escada de escalonamento

```
        sinal detectado
              │
   ┌──────────▼──────────────────────────────────────────┐
   │ N1 · SUSTENTAR                            segundos  │
   │  · UMA voz, calma, frases curtas                    │
   │  · plano de segurança DELE na tela, com as palavras │
   │    que ele mesmo escreveu no estado frio            │
   │  · nenhuma persuasão, nenhuma barganha              │
   └──────────┬──────────────────────────────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │ N2 · CANAL HUMANO PÚBLICO                 imediato  │
   │  · CVV 188 em um toque, sempre visível              │
   │  · SAMU 192 quando houver risco à vida              │
   └──────────┬──────────────────────────────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │ N3 · REDE DE APOIO                          < 1 min │
   │  · contato pré-autorizado e verificado              │
   │  · o usuário é informado de que foi acionado        │
   │  · o contato recebe orientação do que dizer         │
   └──────────┬──────────────────────────────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │ N4 · CUIDADO PROFISSIONAL          conforme protocolo│
   │  · SUS: teleatendimento pelo Meu SUS Digital        │
   │    gratuito, nacional, psicólogo e psiquiatra       │
   │  · profissional vinculado, SE houver — com          │
   │    consentimento prévio e escopo aceito             │
   │  · nunca apresentado como plantão                   │
   └──────────┬──────────────────────────────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │ N5 · EMERGÊNCIA                                      │
   │  · SEMPRE por decisão de uma pessoa                  │
   │  · o sistema NUNCA aciona serviço público sozinho    │
   └─────────────────────────────────────────────────────┘
```

**Por que N5 nunca é automático:** acionamento involuntário de emergência tem
potencial de dano real (constrangimento, exposição, intervenção policial indevida) e
destrói a confiança que faz a pessoa voltar a pedir ajuda. A decisão é humana,
sempre. `TODO [LEGAL]` — validar essa posição com o jurídico.

### 4.1 Por que o N4 aponta primeiro para o SUS

Este degrau dependia exclusivamente de "profissional vinculado" — condição que
**quase nenhum usuário do MVP terá**. Um degrau que a maioria não pode subir não é
degrau; é buraco na escada, exatamente onde a pessoa mais precisa de apoio.

O Estado já opera a alternativa: o **Meu SUS Digital** oferece triagem e
teleatendimento com psicólogo e psiquiatra, gratuito e de alcance nacional
([PUBLIC_SECTOR_STRATEGY.md](./PUBLIC_SECTOR_STRATEGY.md) §4, integração nº 2).
Apontar para lá resolve o degrau de graça e em escala.

**A ressalva que precisa acompanhar o encaminhamento:** teleatendimento não é
plantão. Tem fila, horário e capacidade. O N4 nunca deve ser apresentado como resposta
imediata — quem precisa de imediato está no N2 (CVV 188) ou no N5.

E o tamanho do gargalo é conhecido: o serviço público de referência do país atende
**80 casos novos por ano** contra **1,4 milhão** de pessoas com transtorno do jogo
([DATA_SOURCES.md §4.1.1](./DATA_SOURCES.md)), e apenas **7 a 12%** das pessoas com o
transtorno chegam a procurar tratamento ou grupo de apoio (NIDA). Encaminhar é
necessário e insuficiente — é precisamente por isso que a camada contínua existe.

---

## 5. Limites duros do sistema

Estes itens não são configuráveis e não têm exceção de produto:

1. **A IA nunca se apresenta como pessoa.** Sobretudo em crise. Identificação
   explícita a cada sessão de crise.
2. **Nenhuma técnica de persuasão em crise.** Sem "gatilho mental", sem urgência
   fabricada, sem prova social, sem barganha emocional ("não faz isso comigo").
   Aplicar persuasão a pessoa em sofrimento agudo é manipulação de vulnerável.
3. **Nenhuma promessa que o sistema não cumpre.** Nunca "vai ficar tudo bem",
   nunca "estou aqui com você" no sentido de presença humana.
4. **Nenhuma janela de crise termina sem oferecer caminho humano.**
5. **Sem discurso motivacional no pico.** Reestruturação cognitiva e encorajamento
   pertencem ao estado frio — ver [AI_COACHING_TEAM.md](./AI_COACHING_TEAM.md) §3.
6. **Sem coleta a mais.** Evento de risco não é oportunidade de enriquecer perfil.
7. **Sem métrica de engajamento neste módulo.** Ninguém é avaliado por tempo de
   conversa em crise. Sucesso é conexão humana rápida.

---

## 6. Linguagem — princípios e rascunhos

**Princípios** (o "como", que importa mais que as palavras exatas):

| Fazer                                             | Não fazer                            |
| ------------------------------------------------- | ------------------------------------ |
| Validar sem concordar com a conclusão desesperada | Minimizar ("não é tão grave")        |
| Frases curtas, uma ideia por vez                  | Parágrafo, lista, explicação         |
| Perguntas fechadas e fáceis                       | Pergunta aberta que exige elaboração |
| Devolver as palavras dele, do plano frio          | Texto genérico de autoajuda          |
| Oferecer o próximo passo concreto                 | Oferecer cinco opções                |

**Rascunhos para revisão** — `TODO [CLINICAL]`, nada abaixo vai a produção como está:

> **N1, abertura:**
> "Tô vendo que a coisa apertou agora. Sou o assistente do app, não sou uma pessoa.
> Vou ficar aqui os próximos minutos e te conectar com alguém de verdade."

> **N1, ancoragem:**
> "Você escreveu isto quando estava melhor: «{motivo_para_viver_dele}»."

> **N2:**
> "O CVV atende agora, 24 h, de graça e em sigilo. Toca aqui que eu ligo: **188**."

> **Perda financeira, especificamente:**
> "Dinheiro perdido dói e tem conserto — e o conserto não precisa ser hoje à noite.
> Hoje à noite a gente só passa por essa hora."

**Proibido em qualquer texto:** detalhe de método, tom de julgamento, menção a
"decepcionar a família", números de dívida.

---

## 7. Governança clínica

**Sem estes itens o módulo não sobe — não há versão parcial aceitável:**

| #   | Item                                                                         | Responsável        |
| --- | ---------------------------------------------------------------------------- | ------------------ |
| G1  | **Diretor clínico nomeado**, habilitado, que assina este protocolo           | Empresa            |
| G2  | **Plantão humano definido** com tempo de resposta acordado                   | Operação           |
| G3  | **Revisão humana de 100% dos eventos de risco em 24 h** — censo, não amostra | Clínica            |
| G4  | **Testes adversariais** do conteúdo de crise, com clínicos tentando quebrar  | Clínica + Eng.     |
| G5  | **Protocolo de evento adverso grave** e canal de notificação                 | Clínica + Jurídico |
| G6  | **Menores excluídos deste módulo** até parecer específico                    | Jurídico/DPO       |
| G7  | **Reavaliação trimestral** dos critérios de detecção com dados reais         | Clínica            |

**Dever de cuidado:** um sistema que detecta risco e responde assume
responsabilidade. Isso muda a posição jurídica da empresa. `TODO [LEGAL]` —
parecer obrigatório antes do primeiro usuário real.

---

## 8. Dados de evento de risco

Classe **C3 — sensível (saúde)**, com tratamento mais restrito que o restante:

- Conteúdo da mensagem: criptografado por coluna, **nunca** em log, nunca em
  telemetria, nunca em prompt enviado a terceiro sem base legal específica.
- `riskFlag` e trilha de escalonamento: auditados em WORM (já implementado).
- Acesso: exclusivo do diretor clínico e do profissional vinculado. Todo acesso
  registrado e revisado.
- Retenção: `TODO [LEGAL]` — prazo específico, provavelmente distinto dos 24 meses
  gerais de `panic_events`.
- **Nunca** compartilhado com plataforma de jogo, empregador, universidade ou
  seguradora. Em nenhuma hipótese, sob nenhum contrato.

---

## 9. Depois do evento

O que acontece nas 72 h seguintes importa tanto quanto o pico:

1. **Contato de acompanhamento** em 24 h, humano, curto, sem cobrança.
2. **Revisão do plano de segurança** com o usuário — o que funcionou, o que não.
3. **Revisão do disjuntor financeiro** — os limites seguraram? Precisam mudar?
4. **Reenquadramento como lesão, não fracasso** — recaída segue protocolo de
   retorno, não expulsa ninguém do programa (ver `AI_COACHING_TEAM.md` §1).
5. **Cuidado com quem socorreu.** O familiar que atendeu às 3h também precisa de
   apoio. Ignorar isso queima a rede — que é o ativo mais valioso do produto.

---

## 10. Métricas — e as que são proibidas

**Acompanhar:**

| Métrica                                             | Por quê                       |
| --------------------------------------------------- | ----------------------------- |
| Tempo até conexão humana                            | O número que define o módulo  |
| % de eventos de risco que chegaram a um humano      | Cobertura da escada           |
| % com plano de segurança preenchido antes do evento | Qualidade do estado frio      |
| Falsos positivos reportados pelo usuário            | Fadiga e confiança            |
| Eventos revisados em 24 h                           | Cumprimento de G3 — meta 100% |

**Proibido otimizar:** tempo de conversa com a IA, número de mensagens trocadas,
retenção dentro do módulo de crise, qualquer proxy de engajamento.

---

## 11. Checklist bloqueante

- [ ] G1–G7 cumpridos
- [ ] Critérios de detecção definidos e calibrados `TODO [CLINICAL]`
- [ ] Todos os textos revisados e aprovados `TODO [CLINICAL]`
- [ ] Escopo (tempo vs. dinheiro) decidido e refletido nos documentos `TODO [LEGAL]`
- [ ] Parecer sobre dever de cuidado e responsabilidade civil `TODO [LEGAL]`
- [ ] Retenção de dados de evento de risco definida `TODO [LEGAL]`
- [ ] Testes adversariais executados, com achados fechados
- [ ] Simulação de mesa do plantão realizada, com ata

**Enquanto qualquer item estiver aberto, o módulo de crise não é implantado.** O
restante do produto pode seguir sem ele — desde que os canais públicos de apoio
(188/192) continuem visíveis, como já estão hoje.
