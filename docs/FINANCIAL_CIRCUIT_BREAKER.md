# DISJUNTOR FINANCEIRO — ESCAPE-THE-GAMES

> Versão 0.1.0 · **ESPECIFICAÇÃO PARA REVISÃO** clínica, jurídica e de parcerias.
> Depende de decisão de escopo pendente em [CRISIS_PROTOCOL.md](./CRISIS_PROTOCOL.md) §2.

---

## 1. A tese

Em prevenção de dano, **restringir o acesso ao meio** é das abordagens com melhor
sustentação. Nesta população, um dos meios centrais é o **dinheiro**: é o que
alimenta a perseguição da perda e é o que transforma uma recaída em catástrofe
financeira — que é o gatilho da janela crítica descrita no protocolo de crise.

```
limite ativo          →  perda contida  →  vergonha administrável  →  recuperável
sem limite            →  perda escala   →  desespero               →  janela crítica
```

**Consequência estratégica:** o disjuntor é simultaneamente intervenção de recaída
**e** de segurança. É a única funcionalidade do roadmap que atua nas duas frentes,
e por isso tem a maior relação impacto/esforço do produto.

**Consequência de desenho:** ele é armado no **estado frio** — quando a pessoa tem
capacidade de decidir — e opera sozinho no estado quente, quando ela não tem.
É o contrato de Ulisses aplicado a dinheiro.

---

## 2. Princípio da assimetria

O único princípio que faz o mecanismo funcionar:

> **Apertar é imediato. Afrouxar é lento.**

| Ação                  | Latência                                      | Motivo                                                  |
| --------------------- | --------------------------------------------- | ------------------------------------------------------- |
| Reduzir limite        | Imediata                                      | Nunca colocar fricção em quem está se protegendo        |
| Pausar tudo           | Imediata                                      | Idem                                                    |
| **Aumentar** limite   | **24–48 h de resfriamento** `TODO [CLINICAL]` | O pedido de aumento quase sempre nasce no estado quente |
| Remover cossignatário | 7 dias + aviso a ele                          | Impede desmonte impulsivo da própria proteção           |
| Desativar o disjuntor | 7 dias + aviso à rede                         | Idem                                                    |

A janela de resfriamento é o mecanismo inteiro. Sem ela, existe um botão de
"aumentar limite" que qualquer pessoa em perseguição de perda vai apertar.

**Contrapartida obrigatória:** a pessoa **sempre** pode sair do produto inteiro na
hora. O que é lento é afrouxar a proteção **continuando dentro**. Prender usuário
não é proteção — é cárcere, e não construímos isso.

---

## 3. Mecanismos, por viabilidade real

Honestidade sobre o que dá para fazer hoje sem parceria e o que depende de terceiros:

| Mecanismo                                          | Viabilidade | Depende de                                       |
| -------------------------------------------------- | ----------- | ------------------------------------------------ |
| **Registro e teto declarado** com alerta ao romper | **Hoje**    | Nada — entrada manual + telemetria               |
| **Cartão pré-pago dedicado** com saldo teto        | **Hoje**    | Parceria com emissor / conta separada do usuário |
| **Auto-exclusão em plataforma de aposta regulada** | Depende     | Canal da plataforma / regulador `TODO [LEGAL]`   |
| **Limite de compra dentro do jogo**                | Parcial     | Controle parental de loja (iOS/Android/console)  |
| **Limite e bloqueio de Pix por janela**            | Depende     | Parceria bancária ou Open Finance `TODO [LEGAL]` |
| **Leitura de gasto via Open Finance**              | Depende     | Consentimento Open Finance + instituição         |
| **Cossignatário para valor acima de X**            | **Hoje**    | Rede de apoio já implementada                    |

**Recomendação de sequência:** comece pelo que não depende de ninguém — teto
declarado + cossignatário + alerta. Isso já testa a tese com custo quase zero. As
integrações financeiras vêm depois de saber que as pessoas aceitam apostar a própria
liberdade financeira futura.

---

## 4. O cossignatário

O mecanismo mais forte disponível hoje, porque reaproveita a rede de apoio já
construída (contatos verificados por double opt-in).

```
usuário define, no estado frio:
   "acima de R$ X em 24 h, preciso do OK da Cláudia"
              ↓
tentativa de gasto acima do teto
              ↓
pedido enviado ao cossignatário, com contexto mínimo
              ↓
    aprovou → libera        não respondeu em N h → NÃO libera
                            recusou → não libera, sem justificativa exigida
```

**Regras que evitam que isto vire abuso:**

- O cossignatário **nunca** vê extrato, histórico ou saldo. Vê apenas o pedido.
- Ele **não** pode iniciar bloqueio nem alterar limites. Só responde sim/não.
- Silêncio significa **não** — nunca "sim por omissão".
- O usuário pode trocar de cossignatário (com a janela de 7 dias).
- O cossignatário pode renunciar a qualquer momento, imediatamente.

**Vetor de abuso que precisa de mitigação explícita** — `TODO [LEGAL]`: controle
coercitivo. Um familiar controlador pode usar o mecanismo para dominar a vida
financeira de um adulto. Mitigações: escopo restrito a gasto em jogo, teto mínimo
inviolável que o cossignatário não alcança, canal de denúncia, e a saída sempre
disponível.

---

## 5. Anti-padrões — o que nunca construímos

1. **Crédito, adiantamento ou parcelamento.** Em nenhuma forma. Um produto de
   proteção financeira que oferece crédito a pessoa com dano por jogo é predatório.
2. **Taxa sobre bloqueio, desbloqueio ou emergência.** Proteção não se cobra por uso.
3. **Custódia do dinheiro do usuário.** O produto **limita** e **avisa** — não guarda.
   Guardar cria obrigação regulatória e risco que não queremos.
4. **Punição financeira por recaída.** Aposta de compromisso é uma coisa; multa por
   ter caído é outra, e agrava exatamente a espiral de vergonha que queremos evitar.
5. **Compartilhar dado financeiro** com plataforma de jogo, empregador ou seguradora.
6. **Teto que a pessoa não consegue baixar.** Ela sempre pode se proteger mais.

---

## 6. Interação com a aposta de compromisso

A estratégia prevê contratos de depósito (aversão à perda). Convivem com o
disjuntor, **com limites**:

- Valor pequeno e com teto absoluto — `TODO [CLINICAL]` define a faixa.
- **Nunca** dinheiro que a pessoa não tem. Verificação de capacidade antes.
- Alternativa não-monetária sempre disponível e igualmente respeitada (compromisso
  social, tempo de voluntariado).
- **Suspensão automática** da aposta durante evento de risco ativo — ninguém perde
  dinheiro por ter tido uma crise.
- Perda da aposta nunca é comunicada com tom punitivo.

---

## 7. Privacidade

Dado financeiro aqui é **C2 no mínimo** e, por revelar padrão de comportamento
associado a quadro de saúde, deve ser tratado como **C3** — ver
`SECURITY_AND_COMPLIANCE.md` §1.

- Consentimento **separado e específico** para leitura financeira, revogável, com
  efeito imediato — nunca embutido no aceite geral.
- Granularidade mínima: guardamos **agregado por janela** (gastou acima do teto,
  sim/não), não o extrato. O que não é necessário não é coletado.
- Retenção mais curta que a dos demais dados `TODO [LEGAL]`.
- Open Finance tem regime próprio de consentimento e prazo — `TODO [LEGAL]`.
- Painel do familiar mostra **tendência e rompimento de limite**, jamais transação
  a transação.

---

## 8. Esboço de contrato de API

Sem implementação — desenho para revisão. Segue o padrão dos módulos existentes
(JWT, zod estrito, rate limit, auditoria WORM).

```
POST   /api/v1/limits                 cria/atualiza limite (apertar = imediato)
POST   /api/v1/limits/increase        solicita aumento -> entra em resfriamento
GET    /api/v1/limits                 estado atual + pedidos pendentes
DELETE /api/v1/limits/:id             remoção -> janela de 7 dias + aviso à rede

POST   /api/v1/spend-approvals        pedido de aprovação ao cossignatário
POST   /api/v1/spend-approvals/:id/respond   público, token HMAC (padrão do opt-out)

POST   /api/v1/webhooks/finance/spend interação com parceiro financeiro (assinado)
```

**Eventos de auditoria a acrescentar em `audit/auditLog.ts`:**

```
LIMIT_SET · LIMIT_TIGHTENED · LIMIT_INCREASE_REQUESTED · LIMIT_INCREASE_APPLIED
LIMIT_BREACHED · COSIGNER_ASSIGNED · COSIGNER_APPROVED · COSIGNER_DENIED
COSIGNER_TIMEOUT · CIRCUIT_BREAKER_DISABLED
```

`LIMIT_BREACHED` é o evento que alimenta a detecção de risco do protocolo de crise:
romper o teto é um dos sinais comportamentais de maior valor preditivo esperado.
**Sem PII no metadata** — enum e contador, como no restante da auditoria.

---

## 9. Como testar a tese antes de construir

O experimento nº 1 do plano de 90 dias, aplicado a este módulo:

| Etapa                 | Como                                                                             | Custo     |
| --------------------- | -------------------------------------------------------------------------------- | --------- |
| Teto declarado manual | Planilha + WhatsApp, 30 pessoas, 4 semanas                                       | ~R$ 5 mil |
| Cossignatário manual  | Um humano intermedia os pedidos                                                  | incluso   |
| Medida                | % que aceita armar o disjuntor; % que pede aumento; o que acontece no rompimento | —         |

**O que mata a tese:** se quase ninguém aceita amarrar o próprio dinheiro futuro, o
mecanismo central do produto não existe e a estratégia precisa mudar. Melhor
descobrir isso com R$ 5 mil e um mês do que depois de construir integração bancária.

---

## 10. Checklist bloqueante

- [ ] Escopo (dinheiro dentro ou fora) decidido `TODO [LEGAL]`
- [ ] Parecer sobre não configurar atividade financeira regulada `TODO [LEGAL]`
- [ ] Mitigação de controle coercitivo desenhada e revisada `TODO [LEGAL]`
- [ ] Faixas de valor da aposta de compromisso definidas `TODO [CLINICAL]`
- [ ] Janela de resfriamento validada clinicamente `TODO [CLINICAL]`
- [ ] Consentimento financeiro separado, com texto revisado `TODO [LEGAL]`
- [ ] Experimento manual concluído com resultado positivo
- [ ] Nenhum anti-padrão da §5 presente no desenho final
