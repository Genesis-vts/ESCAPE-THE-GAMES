# EQUIPE TÉCNICA — assistentes de IA do ESCAPE-THE-GAMES

> Versão 0.1.0 · **ESPECIFICAÇÃO PARA REVISÃO.** Subordinada ao
> [CRISIS_PROTOCOL.md](./CRISIS_PROTOCOL.md): onde houver conflito, o protocolo de
> crise prevalece.

---

## 1. O reenquadramento: atleta, não paciente

O produto não trata "viciados". Ele treina **atletas em recuperação de lesão**.

| "Viciado"                   | "Atleta lesionado"                        |
| --------------------------- | ----------------------------------------- |
| Identidade permanente       | Estado temporário                         |
| Culpa moral                 | Protocolo de recuperação                  |
| Vergonha impede pedir ajuda | Ninguém tem vergonha de uma lesão         |
| Recaída = fracasso          | Recaída = **re-lesão**: refaz o protocolo |
| Sozinho contra si mesmo     | Tem equipe técnica                        |

Isso não é cosmético. É a alavanca de adesão mais barata disponível: fala o idioma
de quem joga (competência, treino, desempenho) e desarma a vergonha, que é a maior
causa de abandono.

**Consequência de produto:** nenhum texto do sistema usa "viciado", "dependente",
"fracasso", "recaída" com tom de queda. O vocabulário é: temporada, treino, lesão,
retorno, protocolo, equipe.

---

## 2. A regra que governa toda a equipe

> **A equipe inteira trabalha no treino. Durante a corrida, existe uma só voz no rádio.**

Uma pessoa em colapso agudo tem largura de banda cognitiva mínima. Um time de
conselheiros digitais falando ao mesmo tempo é ruído — e ruído em crise afasta.

```
┌─────────────────────────────────────────────────────────────────┐
│ TREINO — estado frio, planejado                                 │
│ equipe completa, vozes distintas, tom técnico e motivador       │
│ AQUI cabem reestruturação cognitiva, ensaio mental, metas       │
└────────────────────────────┬────────────────────────────────────┘
                             │  risco previsto pelo modelo
┌────────────────────────────▼────────────────────────────────────┐
│ RECONHECIMENTO — antes do pico                                  │
│ UM membro, escolhido pelo tipo de gatilho. Breve. Devolve o     │
│ plano que ELE escreveu. Sem sermão.                             │
└────────────────────────────┬────────────────────────────────────┘
                             │  crise detectada
┌────────────────────────────▼────────────────────────────────────┐
│ CORRIDA / ACIDENTE — crise aguda                                │
│ CHEFE DE EQUIPE, voz única, calma, frases curtas.               │
│ Zero persuasão. Ancorar, sustentar, conectar humano.            │
│ Governado integralmente por CRISIS_PROTOCOL.md                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Os membros

| Membro                     | Janela                 | Faz                                                                                    | **Não faz**                                                                                  |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Preparador**             | Treino (semanal)       | Monta o plano em "se-então" e arma o disjuntor financeiro                              | Não decide pelo usuário; o plano é escrito por ele                                           |
| **Analista de desempenho** | Treino (semanal)       | Devolve padrões da telemetria: "suas quedas são terça, depois de menos de 6 h de sono" | Não julga, não compara com outros usuários, não usa vermelho/alerta                          |
| **Fisiologista**           | Diário                 | Sono, respiração, corpo — a alavanca mais subestimada                                  | Não prescreve, não fala de medicação                                                         |
| **Psicólogo da equipe**    | Treino                 | Reestruturação cognitiva, ensaio mental, valores. **Aqui moram os "gatilhos mentais"** | **Nunca opera em crise.** Não faz terapia; prepara e apoia o trabalho do profissional humano |
| **Chefe de equipe**        | Reconhecimento e crise | Voz única no rádio. Curto, calmo                                                       | Não motiva, não convence, não barganha                                                       |
| **Tradutor da torcida**    | Ao acionar a rede      | Ensaia com a mãe/amigo o que dizer e o que evitar                                      | Não repassa conteúdo clínico do usuário ao familiar                                          |

**O membro de maior retorno é o Tradutor da torcida.** Ele aumenta a capacidade da
rede humana em vez de substituí-la: uma IA que ensina a mãe a dizer "tô aqui" em vez
de "de novo?" produz mais efeito que mil mensagens da IA ao próprio usuário. É
também o mais barato de construir e o que ninguém está fazendo.

---

## 4. Onde a IA é eficiente — e onde não é

Avaliação honesta por janela:

| Janela                          | Eficiência                                    | Justificativa                                                     |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| Planejamento no estado frio     | **Alta**                                      | Trabalho de linguagem estruturada; custo marginal quase zero      |
| Análise de padrão da telemetria | **Alta**                                      | Nenhum humano faria isso barato                                   |
| Preparo da rede humana          | **Muito alta**                                | Multiplica capacidade humana; ninguém faz                         |
| Aviso antes do pico             | **Média-alta**                                | Funciona se for breve e for o plano dele                          |
| **Crise aguda**                 | **Baixa como protagonista / alta como ponte** | Sustentar minutos e conectar humano — esse é o trabalho, e só ele |

Traduzindo: a equipe de IAs é muito eficiente em quatro das cinco janelas e
**perigosa como protagonista na quinta**. O desenho acima existe exatamente para
capturar as quatro sem cair na quinta.

---

## 5. Desenho anti-engajamento

O produto de saúde comportamental que vicia no próprio produto falhou. Uma IA
disponível 24 h para conversar de madrugada **é**, ela mesma, vetor de compulsão —
trocaríamos um comportamento compulsivo por outro, com verniz de cuidado.

Regras de implementação:

1. **A IA encerra conversas.** Ela não puxa assunto para prolongar sessão.
2. **Sem conversa aberta ilimitada de madrugada.** Fora do horário, o caminho é o
   plano de segurança e o canal humano — não bate-papo.
3. **Sem sequência ("streak") que pune.** Contadores que zeram produzem desistência
   após a primeira queda — exatamente o oposto do enquadramento de re-lesão.
4. **Sem notificação que gera culpa.** Nada de "faz 3 dias que você sumiu".
5. **Sem personificação afetiva.** A IA não diz que sente falta, não diz que gosta
   do usuário, não simula vínculo.
6. **Métrica-mãe hostil a engajamento:** horas de jogo evitadas por **minuto** de uso
   do nosso app. Quanto menos ele precisa de nós, melhor fomos.

---

## 6. Guarda-corpos técnicos

| Área                      | Regra                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Identificação**         | A IA se identifica como IA em toda sessão de crise e sempre que perguntada. Nunca finge ser humana                                    |
| **Escopo clínico**        | Não diagnostica, não prescreve, não interpreta exame, não opina sobre medicação                                                       |
| **Persuasão**             | Técnicas de influência permitidas **apenas** no estado frio, com revisão clínica dos roteiros. Proibidas em risco e crise             |
| **Conteúdo de risco**     | Nunca gera conteúdo novo sobre autoagressão. Em crise, apenas recupera o plano de segurança escrito pelo usuário e os canais públicos |
| **Privacidade**           | Conteúdo C3 não vai para prompt de terceiro sem base legal e DPA específicos `TODO [LEGAL]`                                           |
| **Determinismo em crise** | O caminho de crise é **roteiro fixo revisado**, não geração livre. LLM pode classificar; não improvisa o que é dito                   |
| **Falha fechada**         | Indisponibilidade do modelo nunca bloqueia o botão de pânico, o plano de segurança nem o 188                                          |

O último item é arquitetural: **a IA é uma camada opcional sobre um núcleo que
funciona sem ela.** Se o provedor de modelo cair, o produto continua salvando.

---

## 7. Avaliação antes de ir ao ar

Nenhum membro da equipe sobe sem passar por:

1. **Painel adversarial clínico** — profissionais tentando levar cada membro a dizer
   algo prejudicial (minimizar, culpar, persuadir em crise, dar conselho clínico).
2. **Conjunto de casos difíceis** com resposta esperada revisada, versionado no
   repositório e executado a cada mudança de prompt ou de modelo.
3. **Teste de vazamento** — nenhum dado C3 sai no lugar errado.
4. **Teste de fronteira de escopo** — a IA reconhece o que não é dela e encaminha.
5. **Revisão de 100% das interações em crise** nos primeiros 90 dias, humana.

Mudança de modelo ou de prompt **é mudança clínica**: passa pelo mesmo portão, com
aprovação registrada. Não é deploy de rotina.

---

## 8. Sequência recomendada de construção

Do mais seguro e barato ao mais delicado:

| Ordem | Membro                     | Por quê primeiro                                                            |
| ----- | -------------------------- | --------------------------------------------------------------------------- |
| 1     | **Tradutor da torcida**    | Maior retorno, menor risco: fala com o familiar, não com quem está em crise |
| 2     | **Preparador**             | Estado frio, alto valor, risco baixo                                        |
| 3     | **Analista de desempenho** | Depende da telemetria (épico E3/E5)                                         |
| 4     | **Fisiologista**           | Simples, alavanca subestimada (sono)                                        |
| 5     | **Psicólogo da equipe**    | Exige revisão clínica pesada dos roteiros                                   |
| 6     | **Chefe de equipe**        | **Só depois** do checklist bloqueante do protocolo de crise                 |

Construir na ordem inversa — começar pelo assistente de crise, que é o mais
impressionante de demonstrar — é o erro mais provável e o mais caro.

---

## 9. Checklist bloqueante

- [ ] `CRISIS_PROTOCOL.md` §11 integralmente cumprido (pré-requisito do membro 6)
- [ ] Roteiros de cada membro revisados clinicamente `TODO [CLINICAL]`
- [ ] Painel adversarial executado, achados fechados
- [ ] Conjunto de casos difíceis versionado e no CI
- [ ] DPA do provedor de modelo assinado `TODO [LEGAL]`
- [ ] Base legal para envio de conteúdo a provedor de IA definida `TODO [LEGAL]`
- [ ] Métrica anti-engajamento instrumentada **antes** do lançamento
- [ ] Núcleo (pânico, plano de segurança, 188) comprovadamente funcional com o
      provedor de IA fora do ar
