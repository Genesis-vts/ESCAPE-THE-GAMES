# DESIGN DO BOTÃO DE PÂNICO — ESCAPE-THE-GAMES

> Versão 0.1.0 · Todos os textos em PT-BR são **rascunhos** e dependem de revisão clínica e
> jurídica antes do lançamento: `TODO [CLINICAL]` `TODO [LEGAL]`.

---

## 1. Objetivo e limites

**O que o botão é:** um atalho para acionar rapidamente pessoas que o próprio usuário
escolheu e que **consentiram** em ser acionadas, no momento de fissura ou sofrimento agudo
relacionado ao uso de jogos.

**O que o botão não é:**

- não é serviço de emergência;
- não aciona polícia, SAMU, bombeiros ou qualquer serviço público;
- não garante que alguém vá responder;
- não é canal de plantão clínico.

Essa delimitação aparece **em todos os canais**: na tela do app, no SMS, no e-mail, no push e
nos Termos de Uso. `TODO [LEGAL]`

---

## 2. Fluxo de UX

### 2.1 Acionamento

| Etapa                     | Comportamento                                                                                | Racional                                |
| ------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1. Alcance                | Botão sempre visível na Home e disponível como atalho rápido do sistema                      | Em crise, ninguém navega menus          |
| 2. Gesto                  | **Padrão: manter pressionado 1,5 s** (`hold`). `tap` disponível como opção de acessibilidade | Reduz acionamento acidental             |
| 3. Feedback               | Vibração + anel de progresso preenchendo                                                     | Confirma que o gesto está sendo lido    |
| 4. Janela de cancelamento | 5 s com botão "Cancelar" grande                                                              | Protege contra arrependimento imediato  |
| 5. Mensagem opcional      | Campo de texto pré-preenchido com sugestões ("Tô quase recaindo", "Preciso conversar")       | Escrever em crise é difícil             |
| 6. Localização            | **Desligada por padrão**, toggle explícito por evento                                        | Minimização de dados (LGPD)             |
| 7. Envio                  | Chamada à API; confirmação em < 1 s                                                          | Percepção de que "alguém foi avisado"   |
| 8. Tela de apoio          | Respiração guiada + lista de contatos com status ao vivo                                     | O usuário não fica olhando para o vazio |
| 9. Encerramento           | "Já estou bem" resolve o evento e agradece                                                   | Fecha o ciclo, gera dado clínico        |

### 2.2 Estados de acessibilidade

- Contraste mínimo AA; alvo de toque ≥ 64 dp.
- Rótulo de leitor de tela: _"Botão de ajuda. Toque duas vezes e mantenha pressionado para
  avisar sua rede de apoio."_
- Alternativa para quem não consegue manter pressionado: `tap` com confirmação em diálogo.
- Sem dependência de cor para status (ícones + texto).
- Funciona com texto ampliado (até 200%) sem corte.

### 2.3 Sem contatos verificados

Não bloqueamos o acionamento. A API responde 200 com `warnings: ["NO_VERIFIED_CONTACTS"]` e
o app exibe:

> **Ainda não há ninguém na sua rede.**
> Você pode falar agora com o CVV pelo 188 (24 h, gratuito e sigiloso).
> [ Ligar 188 ] [ Adicionar contato de apoio ]

O evento é registrado mesmo assim — é dado clínico relevante.

---

## 3. Consentimento

### 3.1 Do usuário

- Aceite explícito dos Termos e da Política no cadastro, com versão e timestamp gravados.
- Consentimento **separado** para: (a) compartilhar dados com profissional vinculado;
  (b) usar localização; (c) receber comunicações de produto. Nenhum pré-marcado.
- Revogável a qualquer momento nas configurações, com efeito imediato.

### 3.2 Do contato de apoio (double opt-in obrigatório)

1. Usuário cadastra o contato → status `pending`.
2. A plataforma envia ao contato uma mensagem de convite explicando o que é, quem cadastrou,
   o que ele vai receber e como sair.
3. Contato confirma com o código de 6 dígitos → status `verified`, `consentAt` e
   `consentVersion` gravados.
4. Só a partir daí ele entra no fan-out.

### 3.3 Opt-out

- SMS: responder **SAIR**.
- E-mail: link "Não quero mais receber" (one-click, sem login).
- Efeito: `revoked` imediato e **bloqueio permanente** daquele destino, mesmo em novo cadastro
  por outro usuário. O usuário é avisado de que o contato saiu, sem detalhes do motivo.
- Registro em auditoria: `CONTACT_REVOKED` com origem (`sms_reply` | `email_link` | `user`).

`TODO [LEGAL]` — validar se o convite ao contato configura comunicação legítima sob a LGPD
(legítimo interesse vs. consentimento prévio) e revisar o texto do convite.

---

## 4. Limites de taxa (rate limits)

| Escopo                       | Limite                | Resposta ao exceder                          |
| ---------------------------- | --------------------- | -------------------------------------------- |
| `POST /panic` por usuário    | 5 por hora            | 429 + `Retry-After`                          |
| `POST /panic` por usuário    | 10 por dia            | 429 + tela de acolhimento                    |
| Notificações por contato     | 3 por hora            | evento registrado, contato marcado `skipped` |
| `POST /contacts` por usuário | 10 por hora           | 429                                          |
| `verify` por contato         | 5 tentativas / 15 min | bloqueio até novo código                     |
| `resend` por contato         | 3 por hora            | 429                                          |
| Global por IP                | 100 req/min           | 429                                          |

**Texto de acolhimento no 429 (não usar linguagem de erro):**

> Você acionou seu apoio há pouco tempo. Suas mensagens já foram enviadas.
> Se a situação piorou e você está em risco agora, ligue **192** (SAMU) ou **188** (CVV).
> [ Ligar 188 ] [ Exercício de respiração ]

> **Decisão de produto:** o limite protege os contatos contra sobrecarga e o produto contra
> uso abusivo — nunca é apresentado como punição. Excedentes ficam registrados e visíveis ao
> profissional vinculado, pois indicam agravamento. `TODO [CLINICAL]`

---

## 5. Templates de mensagem (PT-BR)

Variáveis disponíveis: `{{userDisplayName}}`, `{{userPhone}}`, `{{timestamp}}`, `{{message}}`,
`{{locationUrl}}`, `{{contactDisplayName}}`, `{{optOutUrl}}`, `{{eventId}}`.

Implementação: [`services/api/src/notifications/templates.ts`](../services/api/src/notifications/templates.ts).

### 5.1 SMS — acionamento (padrão, ≤ 320 caracteres / 2 segmentos)

```
[ESCAPE-THE-GAMES] {{userDisplayName}} acionou o botão de apoio em {{timestamp}}.
Mensagem: "{{message}}"
Fale com {{userDisplayName}}: {{userPhone}}
Este app nao e servico de emergencia. Em risco imediato ligue 192.
Responda SAIR para nao receber mais.
```

Sem mensagem do usuário, a linha `Mensagem:` é omitida.
Com localização autorizada, entra `Local: {{locationUrl}}`.

> **Nota técnica:** o corpo do SMS é enviado **sem acentos** (transliteração automática) para
> manter a codificação GSM-7 e evitar o custo dobrado de UCS-2. Regra implementada em
> `templates.ts` e coberta por teste.

### 5.2 SMS — convite/verificação de contato

```
[ESCAPE-THE-GAMES] {{userDisplayName}} indicou voce como contato de apoio.
Voce recebera um aviso quando essa pessoa pedir ajuda.
Codigo de confirmacao: {{code}} (validade 15 min)
Nao quer participar? Responda SAIR.
```

### 5.3 E-mail — acionamento

**Assunto:** `{{userDisplayName}} pediu apoio agora ({{timestamp}})`

**Corpo (texto):**

```
Olá, {{contactDisplayName}}.

{{userDisplayName}} acionou o botão de apoio do ESCAPE-THE-GAMES em {{timestamp}}.

Mensagem deixada:
"{{message}}"

Como falar agora: {{userPhone}}
Local compartilhado: {{locationUrl}}

O QUE COSTUMA AJUDAR
- Responda rápido, mesmo que curto: "Tô aqui, me liga."
- Ouça sem julgar. A pessoa já sabe que quer mudar.
- Pergunte o que ela precisa agora, em vez de propor solução.

O QUE EVITAR
- Cobrar, ameaçar ou lembrar de promessas anteriores.
- Prometer o que você não pode cumprir.

IMPORTANTE
O ESCAPE-THE-GAMES não é serviço de emergência e não aciona socorro.
Se houver risco imediato à vida, ligue 192 (SAMU).
Apoio emocional gratuito e sigiloso 24 h: 188 (CVV).

Você recebe este aviso porque confirmou ser contato de apoio de {{userDisplayName}}.
Para sair a qualquer momento: {{optOutUrl}}

Identificador do evento: {{eventId}}
```

`TODO [CLINICAL]` — validar as seções "o que ajuda / o que evitar" com a consultoria clínica.

### 5.4 Push — para o contato

- **Título:** `{{userDisplayName}} pediu apoio`
- **Corpo:** `Acionou o botão de apoio agora. Toque para ver como ajudar.`
- **Data:** `{ "type": "panic_alert", "eventId": "…", "userId": "…" }`
- Prioridade alta; sem conteúdo sensível na notificação (a mensagem só aparece dentro do app).

### 5.5 Push — para o próprio usuário (confirmação)

- **Título:** `Seu apoio foi avisado`
- **Corpo:** `Avisamos {{count}} pessoa(s). Respire com a gente enquanto isso.`

### 5.6 WhatsApp — apenas deep link (sem envio automático)

A API devolve, para contatos do tipo `whatsapp_deeplink`, uma URL pronta:

```
https://wa.me/5511999998888?text=<mensagem%20urlencoded>
```

O app abre o WhatsApp com o texto pré-preenchido; **o envio é ação manual do usuário**.
Nenhuma mensagem parte dos nossos servidores por esse canal no MVP. `TODO [LEGAL]`

### 5.7 Disclaimer obrigatório (todos os canais)

> Este aplicativo não substitui serviços de emergência nem atendimento profissional.
> Em risco imediato, ligue 192 (SAMU). Apoio emocional 24 h: 188 (CVV).

---

## 6. Conteúdo com sinal de risco de autoagressão

Se a mensagem digitada contiver indícios de risco (lista de termos + revisão clínica do
critério), o comportamento é:

1. **Não bloquear** o acionamento — a rede de apoio continua sendo avisada.
2. Exibir imediatamente ao usuário, na própria tela, os canais de ajuda:
   > Se você está pensando em se machucar, fale agora com o **CVV: 188** (24 h, gratuito e
   > sigiloso) ou ligue **192**. Você não precisa passar por isso sozinho.
3. Marcar o evento com `riskFlag=true` para visibilidade do profissional vinculado.
4. **Não** enviar o conteúdo íntegro da mensagem por SMS nesse caso — o SMS traz apenas o
   aviso de acionamento e o convite a ligar. O conteúdo completo fica no app/e-mail.
5. **Não** acionar terceiros automaticamente (nem serviços públicos).

`TODO [CLINICAL]` — definir os critérios de detecção, a taxa de falso positivo aceitável e o
protocolo de escalonamento.
`TODO [LEGAL]` — definir dever de cuidado, limites de responsabilidade e registro do evento.

---

## 7. Regras de despacho

| Regra            | Descrição                                                                          |
| ---------------- | ---------------------------------------------------------------------------------- |
| Elegibilidade    | Somente contatos `verified` e não revogados                                        |
| Ordem            | Por `priority` crescente; todos são notificados em paralelo (não é cascata no MVP) |
| Canal            | Definido no cadastro do contato; `whatsapp_deeplink` não gera envio pelo servidor  |
| Retry            | 3 tentativas por destinatário: 2 s, 8 s, 30 s (backoff exponencial + jitter)       |
| Falha definitiva | `failed` com motivo; visível ao usuário na tela de acompanhamento                  |
| Circuit breaker  | 10 falhas consecutivas de um provedor → abre por 60 s e usa canal alternativo      |
| Deduplicação     | `Idempotency-Key` (janela de 60 s) evita fan-out duplicado                         |
| Silêncio noturno | **Não aplicável** ao pânico: alertas ignoram qualquer janela de silêncio           |

---

## 8. Métricas do botão

| Métrica                        | Definição                                | Alvo MVP                                |
| ------------------------------ | ---------------------------------------- | --------------------------------------- |
| Tempo até confirmação          | Toque → resposta 200                     | p95 < 1 s                               |
| Tempo até 1ª entrega           | Evento → primeiro `delivered`            | p95 < 60 s                              |
| Taxa de entrega                | `delivered` / `queued` por canal         | ≥ 95% (SMS), ≥ 98% (e-mail)             |
| Taxa de resposta do contato    | Contatos que responderam em 30 min       | ≥ 60%                                   |
| Taxa de cancelamento           | Acionamentos cancelados na janela de 5 s | monitorar (proxy de falso positivo)     |
| Acionamentos por usuário ativo | média mensal                             | monitorar; alta súbita = alerta clínico |
| Resolução "já estou bem"       | Eventos resolvidos pelo usuário          | ≥ 70%                                   |
