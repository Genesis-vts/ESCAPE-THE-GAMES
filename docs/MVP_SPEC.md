# ESPECIFICAÇÃO DO MVP — ESCAPE-THE-GAMES

> Versão 0.1.0 · Janela: 3–6 meses · Idioma de produto: PT-BR.
> Prioridade pelo método MoSCoW. Itens `Must` compõem o critério de lançamento.

---

## 1. Escopo

### 1.1 Dentro do MVP (Must)

| # | Épico | Descrição |
|---|-------|-----------|
| E1 | Conta e onboarding | Cadastro, login, consentimento, perfil de jogo |
| E2 | Triagem inicial | Questionário de autoavaliação e devolutiva |
| E3 | Rede de apoio | Cadastro e **verificação** de contatos |
| E4 | Botão de pânico | Acionamento, fan-out SMS/e-mail/push, acompanhamento |
| E5 | Monitoramento básico | Registro diário de tempo, humor e gatilhos |
| E6 | Painel clínico | Visão do profissional sobre paciente vinculado |
| E7 | Privacidade e dados | Exportação, exclusão de conta, revogação de consentimento |

### 1.2 Fora do MVP (Won't — nesta janela)

Envio automático por WhatsApp (exige Business API), telemetria automática de tempo de jogo
por integração com Steam/PSN/Xbox, videochamada, gamificação social/ranking, IA conversacional
terapêutica, marketplace de profissionais.

---

## 2. Personas

- **Rafael, 22** — universitário, joga 6–9 h/dia, já reprovou por causa disso. Quer parar mas
  recai à noite. Usa o botão de pânico.
- **Cláudia, 51** — mãe do Rafael. Instalou o app "pra ele". É o contato de apoio primário.
  Precisa saber **o que fazer** ao receber o aviso, sem invadir.
- **Dra. Marina, 38** — psicóloga, TCC, 4 pacientes com uso problemático. Precisa de dados
  entre sessões, sem virar plantonista.

---

## 3. Histórias de usuário e critérios de aceitação

Formato: **Como** <persona> **quero** <ação> **para** <benefício>.
Critérios em Gherkin (Dado/Quando/Então).

---

### E1 — Conta e onboarding

#### US-01 — Criar conta (Must)
**Como** pessoa que quer reduzir o tempo de jogo **quero** criar uma conta **para** salvar meu
progresso com segurança.

```gherkin
Dado que estou na tela de cadastro
Quando informo e-mail válido e senha com no mínimo 10 caracteres
E aceito os Termos de Uso e a Política de Privacidade (versão registrada)
Então minha conta é criada
E recebo um e-mail de verificação
E o consentimento é gravado com timestamp, versão do texto e IP
```
- Senha: mínimo 10 caracteres, verificada contra lista de senhas vazadas (k-anonymity).
- Consentimento **não** pode vir pré-marcado. `TODO [LEGAL]`

#### US-02 — Login (Must)
```gherkin
Dado que possuo conta verificada
Quando faço login com credenciais corretas
Então recebo um access token JWT (TTL 15 min) e um refresh token (TTL 30 dias)
E após 5 tentativas erradas em 15 minutos a conta é bloqueada por 15 minutos
```

#### US-03 — Onboarding de contexto (Should)
```gherkin
Dado que acabei de criar a conta
Quando respondo jogos principais, horas/dia estimadas e objetivo
Então vejo um resumo do meu ponto de partida
E a meta inicial de tempo é sugerida (redução de 20% sobre o relatado)
```

---

### E2 — Triagem inicial

#### US-04 — Responder autoavaliação (Must)
```gherkin
Dado que concluí o onboarding
Quando respondo o questionário de triagem (9 itens)
Então recebo uma devolutiva em faixas: "sinais leves", "sinais moderados", "sinais intensos"
E vejo o aviso de que isso NÃO é diagnóstico
E, na faixa intensa, vejo a recomendação de buscar profissional e os canais de apoio
```
- Instrumento e pontos de corte definidos pela consultoria clínica antes do lançamento.
  `TODO [CLINICAL]`
- Texto obrigatório: *"Esta autoavaliação não é diagnóstico e não substitui atendimento
  profissional."* `TODO [LEGAL]`

---

### E3 — Rede de apoio

#### US-05 — Adicionar contato de apoio (Must)
```gherkin
Dado que estou autenticado
Quando cadastro nome, relação e canal (sms | email | push | whatsapp_deeplink) com destino válido
Então o contato é criado com status "pending"
E um código de verificação de 6 dígitos (validade 15 min) é enviado ao contato
E o contato NÃO recebe notificações de pânico enquanto estiver "pending"
```
- Telefone normalizado para E.164 (`+55...`); e-mail validado por formato + MX. 
- Limite: 10 contatos por usuário no MVP.

#### US-06 — Verificar contato (Must)
```gherkin
Dado um contato com status "pending"
Quando o código correto é informado dentro da validade
Então o status vira "verified", com consentAt e consentVersion gravados
E o evento CONTACT_VERIFIED entra no log de auditoria

Dado um contato "pending"
Quando erro o código 5 vezes
Então a verificação é bloqueada e é preciso reenviar um novo código
```

#### US-07 — Contato pode se descadastrar (Must)
```gherkin
Dado que sou contato de apoio de alguém
Quando respondo "SAIR" ao SMS ou clico no link de descadastro do e-mail
Então meu contato passa a "revoked" imediatamente
E não recebo mais nenhuma notificação, mesmo se for cadastrado de novo
E o usuário é informado de que aquele contato saiu (sem detalhes do motivo)
```

---

### E4 — Botão de pânico (núcleo)

#### US-08 — Acionar o botão (Must)
**Como** pessoa em fissura **quero** acionar meu apoio com um toque **para** não recair sozinho.

```gherkin
Dado que estou autenticado e tenho ao menos 1 contato verificado
Quando mantenho o botão pressionado por 1,5 s
Então vejo uma contagem de 5 s com opção de cancelar
E, ao fim, POST /api/v1/panic responde 200 em menos de 1 s com eventId
E as notificações são enfileiradas para todos os contatos verificados e ativos
E o evento é gravado antes de qualquer envio
E vejo uma tela de apoio com exercício de respiração enquanto aguardo
```

```gherkin
Dado que não tenho nenhum contato verificado
Quando aciono o botão
Então a API responde 200 com recipients vazio e warning "NO_VERIFIED_CONTACTS"
E o app exibe os canais públicos de apoio e o atalho para cadastrar um contato
```

```gherkin
Dado que já acionei 5 vezes na última hora
Quando aciono novamente
Então recebo 429 com o header Retry-After
E o app exibe acolhimento, não erro técnico ("Já avisamos seu apoio há pouco…")
```

- **Sem conexão:** o app enfileira localmente e reenvia com o mesmo `Idempotency-Key`.
- Localização é **opcional** e exige permissão explícita a cada evento (padrão: desligada).

#### US-09 — Acompanhar o acionamento (Must)
```gherkin
Dado que acionei o botão
Quando abro a tela de acompanhamento
Então vejo, por contato, o status: enfileirado | enviado | entregue | falhou
E vejo o horário do acionamento
E posso marcar "já estou bem" (resolve o evento)
```

#### US-10 — Contato recebe e sabe o que fazer (Must)
```gherkin
Dado que sou contato verificado
Quando a pessoa aciona o botão
Então recebo SMS/e-mail/push em até 60 s (p95)
E a mensagem traz: quem acionou, horário, mensagem opcional, telefone de contato
E o e-mail traz orientação breve do que fazer e do que evitar
E toda mensagem traz o aviso de que o app não é serviço de emergência
```
Textos exatos em [PANIC_BUTTON_DESIGN.md](./PANIC_BUTTON_DESIGN.md). `TODO [CLINICAL]`

---

### E5 — Monitoramento básico

#### US-11 — Registro diário (Must)
```gherkin
Dado que estou autenticado
Quando registro horas jogadas, humor (1–5) e gatilho do dia
Então o registro é salvo com a data local do usuário
E vejo minha série dos últimos 14 dias
```

#### US-12 — Meta de tempo (Should)
```gherkin
Dado que defini meta diária de horas
Quando meu registro ultrapassa a meta
Então recebo um push de acolhimento (não punitivo) no fim do dia
E a semana mostra dias dentro/fora da meta
```

---

### E6 — Painel clínico

#### US-13 — Vincular profissional (Must)
```gherkin
Dado que meu psicólogo me passou um código de vínculo
Quando informo o código e confirmo o compartilhamento
Então o profissional passa a ver meus dados conforme o escopo que autorizei
E posso revogar o vínculo a qualquer momento, com efeito imediato
```

#### US-14 — Ver paciente (Must)
```gherkin
Dado que sou profissional com vínculo ativo
Quando abro o paciente no painel
Então vejo triagem, série de tempo/humor e histórico de acionamentos
E NÃO vejo dados de pacientes sem vínculo ativo
E cada acesso é registrado no log de auditoria
```
> O painel **não** é canal de plantão. Aviso permanente na interface. `TODO [CLINICAL]`

---

### E7 — Privacidade e dados

#### US-15 — Exportar meus dados (Must)
```gherkin
Quando solicito a exportação
Então recebo, em até 15 dias, um arquivo JSON+CSV com meus dados pessoais
E a solicitação fica registrada na auditoria
```

#### US-16 — Excluir minha conta (Must)
```gherkin
Quando solicito a exclusão e confirmo
Então minha conta é anonimizada em até 30 dias
E os contatos deixam de receber qualquer notificação imediatamente
E os registros de auditoria são mantidos pseudonimizados pelo prazo legal
```
`TODO [LEGAL]` — prazos e base legal de retenção a confirmar com o DPO.

---

## 4. Wireframes textuais

### 4.1 Home (mobile)

```
┌──────────────────────────────────────┐
│  ESCAPE-THE-GAMES            [perfil]│
│                                      │
│  Olá, Rafael 👋                      │
│  4 dias dentro da meta                │
│                                      │
│   ╭────────────────────────────────╮ │
│   │                                │ │
│   │        ⬤  PRECISO DE AJUDA     │ │
│   │      (segure por 1,5 s)        │ │
│   │                                │ │
│   ╰────────────────────────────────╯ │
│   3 contatos prontos para te apoiar   │
│                                      │
│  ── Hoje ───────────────────────────  │
│  [ Registrar meu dia ]                │
│  Tempo jogado: 3h20 / meta 4h ▓▓▓▓░░  │
│                                      │
│  ── Exercícios ─────────────────────  │
│  ▸ Respiração 4-7-8        (2 min)    │
│  ▸ Adiar por 15 minutos    (TCC)      │
│                                      │
│ [Início] [Diário] [Apoio] [Ajuda]     │
└──────────────────────────────────────┘
```

### 4.2 Acionamento em andamento

```
┌──────────────────────────────────────┐
│           Avisando seu apoio…        │
│                                      │
│      ◍ ◍ ◍   (respire com a bolha)   │
│      inspire 4 · segure 7 · solte 8  │
│                                      │
│  Cláudia (mãe)      ✓ entregue 21:04 │
│  Pedro (amigo)      ✓ enviado  21:04 │
│  Dra. Marina        ⟳ enviando…      │
│                                      │
│  [ Já estou bem ]   [ Ligar p/ CVV ] │
│                                      │
│  Emergência? Ligue 192 (SAMU).       │
│  Este app não é serviço de emergência│
└──────────────────────────────────────┘
```

### 4.3 Rede de apoio

```
┌──────────────────────────────────────┐
│  Minha rede de apoio        [+ novo] │
│                                      │
│  ✓ Cláudia · mãe · SMS +55 11 9****  │
│    verificada em 12/03 · prioridade 1│
│  ✓ Pedro · amigo · e-mail p***@x.com │
│  ⏳ Tia Lia · SMS · aguardando código │
│    [ reenviar código ]  [ remover ]  │
│                                      │
│  Só contatos verificados recebem      │
│  seus acionamentos.                   │
└──────────────────────────────────────┘
```

### 4.4 Painel clínico (web)

```
┌──────────────────────────────────────────────────────────────┐
│ Painel clínico · Dra. Marina                    [sair]       │
├───────────────┬──────────────────────────────────────────────┤
│ Pacientes (4) │  Rafael S. · vínculo ativo desde 02/03       │
│ ▸ Rafael S. ● │  Triagem: sinais moderados (14/03)           │
│   Ana P.      │                                              │
│   João M. ●   │  Horas/dia (14d)   ▁▃▅▇▅▃▂▁▂▃▅▂▁▁            │
│   Beatriz L.  │  Humor (14d)       ▃▂▂▄▅▃▄▅▅▄▃▄▅▅            │
│               │                                              │
│ ● acionamento │  Acionamentos: 3 em 30 dias                  │
│   nos 7 dias  │   21/03 23:41 · hold · 3 contatos avisados   │
│               │   14/03 02:10 · tap  · 2 contatos avisados   │
│               │                                              │
│               │  ⚠ Este painel não é canal de plantão.       │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 5. APIs essenciais

Base: `/api/v1` · Autenticação: `Authorization: Bearer <jwt>` (exceto `/health` e `/auth/*`)
· `Content-Type: application/json` · Erros no formato `{ error: { code, message, details? } }`.

| Método | Rota | Descrição | Rate limit |
|--------|------|-----------|-----------|
| GET | `/health` | Liveness/readiness | 60/min por IP |
| POST | `/auth/login` | Emite access + refresh token | 10/min por IP |
| POST | `/auth/refresh` | Rotaciona refresh token | 30/h por usuário |
| **POST** | **`/panic`** | **Aciona botão de pânico** | **5/h e 10/dia por usuário** |
| GET | `/panic/:eventId` | Status do acionamento por contato | 60/min por usuário |
| POST | `/panic/:eventId/resolve` | Marca "já estou bem" | 30/h por usuário |
| **POST** | **`/contacts`** | **Cria contato (status pending)** | **10/h por usuário** |
| GET | `/contacts` | Lista contatos do usuário | 60/min por usuário |
| POST | `/contacts/:id/verify` | Verifica com código de 6 dígitos | 5/15min por contato |
| POST | `/contacts/:id/resend` | Reenvia código | 3/h por contato |
| DELETE | `/contacts/:id` | Revoga contato | 20/h por usuário |
| GET | `/me` | Perfil do usuário autenticado | 60/min |

### 5.1 `POST /api/v1/panic`

**Request**
```json
{
  "message": "Preciso de ajuda agora",
  "location": { "lat": -23.55052, "lon": -46.633308 },
  "triggerType": "hold"
}
```
| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `message` | string | não | ≤ 280 caracteres; nunca vai para logs |
| `location` | objeto | não | `lat` −90..90, `lon` −180..180; só com consentimento do evento |
| `triggerType` | enum | **sim** | `tap` \| `hold` |

Headers opcionais: `Idempotency-Key` (uuid; janela de 60 s).

**200 OK**
```json
{
  "eventId": "3f1c1d4e-9a0b-4c2a-8f77-2b6f0c9d5a11",
  "status": "queued",
  "createdAt": "2026-03-21T23:41:07.412Z",
  "recipients": [
    { "contactId": "c1", "displayName": "Cláudia", "channel": "sms",   "status": "queued" },
    { "contactId": "c2", "displayName": "Pedro",   "channel": "email", "status": "queued" }
  ],
  "warnings": [],
  "disclaimer": "Este aplicativo não substitui serviços de emergência. Em risco imediato, ligue 192 (SAMU) ou 188 (CVV)."
}
```

**Erros:** `401 UNAUTHORIZED` · `400 VALIDATION_ERROR` · `429 RATE_LIMITED` (com `Retry-After`).

### 5.2 `POST /api/v1/contacts`

**Request**
```json
{
  "displayName": "Cláudia",
  "relationship": "mãe",
  "channel": "sms",
  "destination": "+5511999998888",
  "priority": 1
}
```

**201 Created**
```json
{
  "contact": {
    "id": "c1",
    "displayName": "Cláudia",
    "relationship": "mãe",
    "channel": "sms",
    "destinationMasked": "+55 11 *****-8888",
    "status": "pending",
    "priority": 1,
    "createdAt": "2026-03-21T23:30:00.000Z"
  },
  "verification": {
    "verificationToken": "vt_9f2b…",
    "expiresAt": "2026-03-21T23:45:00.000Z",
    "channel": "sms",
    "devCode": "123456"
  }
}
```
> `devCode` só é retornado quando `NODE_ENV !== 'production'` — em produção o código
> **jamais** trafega na resposta da API.

### 5.3 `POST /api/v1/contacts/:id/verify`

```json
{ "verificationToken": "vt_9f2b…", "code": "123456" }
```
**200 OK** → `{ "contact": { "id": "c1", "status": "verified", "consentAt": "…", "consentVersion": "v1" } }`

---

## 6. Critérios de lançamento (Definition of Done do MVP)

- [ ] Todas as histórias `Must` com critérios de aceitação verdes.
- [ ] `POST /panic` p95 < 400 ms e ≥ 99% de eventos persistidos com sucesso em teste de carga.
- [ ] Notificação de pânico entregue em < 60 s (p95) em teste com provedores reais em staging.
- [ ] Cobertura de testes ≥ 70% nos módulos `panic` e `contacts`.
- [ ] Nenhuma PII em logs (teste automatizado de redaction).
- [ ] Textos clínicos revisados. `TODO [CLINICAL]`
- [ ] Termos, Política de Privacidade e fluxo de consentimento revisados. `TODO [LEGAL]`
- [ ] Pentest externo sem findings críticos/altos em aberto.
- [ ] Runbook de incidente e plantão definidos.
