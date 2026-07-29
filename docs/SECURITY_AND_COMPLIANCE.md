# SEGURANÇA E CONFORMIDADE — ESCAPE-THE-GAMES

> Versão 0.1.0 · Este documento é **insumo de engenharia**, não parecer jurídico.
> Cada item marcado `TODO [LEGAL]` exige validação do DPO/assessoria antes do go-live.

---

## 1. Classificação de dados

| Classe                         | Exemplos                                                         | Tratamento                                                                                 |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **C3 — Sensível (saúde)**      | triagem, humor, mensagens de pânico, `riskFlag`, vínculo clínico | Criptografia em repouso por coluna, acesso mínimo, auditoria de todo acesso, nunca em logs |
| **C2 — Pessoal identificável** | nome, e-mail, telefone, destino de contato, localização          | Criptografia em repouso, mascaramento em UI e API, retenção limitada                       |
| **C1 — Operacional**           | requestId, timestamps, status de entrega, métricas               | Log padrão, retenção 90 dias                                                               |
| **C0 — Público**               | conteúdo educativo, textos legais                                | Sem restrição                                                                              |

**Regra dura:** dado C3 **nunca** sai do nosso perímetro para provedores de notificação.
O SMS contém nome, horário e telefone — nunca triagem, humor ou histórico clínico.

---

## 2. LGPD (Lei 13.709/2018) — checklist

| #   | Requisito                                          | Como atendemos                                                                                           | Status                                          |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| L1  | Base legal definida por finalidade                 | Consentimento (art. 7º, I) para dados de saúde (art. 11, I); execução de contrato para operação da conta | `TODO [LEGAL]`                                  |
| L2  | Consentimento livre, informado e inequívoco        | Aceite não pré-marcado, granular (clínico / localização / marketing), versionado e com timestamp         | ✔ especificado                                  |
| L3  | Consentimento de terceiro (contato de apoio)       | Double opt-in com código; contato só entra no fan-out após confirmar                                     | ✔ implementado                                  |
| L4  | Finalidade específica e minimização                | Coletamos apenas o necessário; localização opt-in por evento; sem rastreio de terceiros                  | ✔ especificado                                  |
| L5  | Direito de acesso e portabilidade                  | Endpoint de exportação (JSON+CSV), prazo ≤ 15 dias                                                       | Backlog                                         |
| L6  | Direito de eliminação                              | Exclusão de conta com anonimização em ≤ 30 dias; auditoria pseudonimizada retida                         | Backlog / `TODO [LEGAL]`                        |
| L7  | Revogação de consentimento                         | Efeito imediato; contatos param de receber na hora                                                       | Backlog                                         |
| L8  | Registro das operações de tratamento (ROPA)        | Planilha de inventário mantida pelo DPO, revisada a cada release maior                                   | `TODO [LEGAL]`                                  |
| L9  | Relatório de Impacto (RIPD/DPIA)                   | Obrigatório: dado sensível + risco a titular vulnerável                                                  | `TODO [LEGAL]`                                  |
| L10 | Encarregado (DPO) nomeado e publicado              | Contato na Política de Privacidade e no app                                                              | `TODO [LEGAL]`                                  |
| L11 | Comunicação de incidente à ANPD e aos titulares    | Runbook com prazo interno de 24 h para triagem e 48 h para decisão de comunicação                        | ✔ definido                                      |
| L12 | Contratos com operadores (Twilio, SendGrid, cloud) | DPA assinado, cláusulas de transferência internacional                                                   | `TODO [LEGAL]`                                  |
| L13 | Menores de idade                                   | Público-alvo inclui 16–17 anos: exigir consentimento específico do responsável                           | `TODO [LEGAL]` — **bloqueante para lançamento** |
| L14 | Segurança técnica e administrativa (art. 46)       | Este documento + controles abaixo                                                                        | ✔ em curso                                      |

---

## 3. GDPR — deltas em relação à LGPD

Aplicável se houver usuário na UE/EEA (mesmo sem operação lá).

| Requisito                                | Nota                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Art. 9 — dados de saúde                  | Consentimento explícito ou finalidade de cuidado; documentar a escolha `TODO [LEGAL]` |
| Art. 35 — DPIA                           | Obrigatório (dados de saúde em larga escala)                                          |
| Art. 30 — Records of Processing          | Equivalente ao ROPA                                                                   |
| Art. 33 — notificação em 72 h            | Runbook alinhado ao prazo mais curto (72 h)                                           |
| Art. 44–49 — transferência internacional | SCCs com subprocessadores fora do EEA                                                 |
| Art. 17 — direito ao esquecimento        | Mesmo fluxo de eliminação da LGPD                                                     |
| Art. 25 — privacy by design/default      | Localização off por padrão; retenção mínima; pseudonimização                          |
| Representante na UE                      | Necessário se houver oferta ativa a titulares na UE `TODO [LEGAL]`                    |

---

## 4. HIPAA — aplicabilidade e básicos

**Avaliação atual:** HIPAA **não se aplica** enquanto não formos _covered entity_ nem
_business associate_ de uma nos EUA. Se firmarmos contrato com prestador/plano de saúde
americano, passa a aplicar-se e exigirá **BAA**. `TODO [LEGAL]`

Controles equivalentes já previstos (adotados como boa prática, independentemente de HIPAA):

| Safeguard      | Controle                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Administrativo | Política de acesso mínimo, treinamento anual, análise de risco documentada, plano de contingência                                   |
| Físico         | Data center de provedor certificado (SOC 2 / ISO 27001); sem servidores próprios                                                    |
| Técnico        | Controle de acesso único por pessoa, logs de auditoria, criptografia em trânsito e repouso, timeout de sessão, integridade por hash |
| Organizacional | BAA/DPA com todo subprocessador que toque dado de saúde                                                                             |

---

## 5. Controles técnicos

### 5.1 Criptografia

| Camada                 | Controle                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Em trânsito            | TLS 1.2+ obrigatório (1.3 preferencial); HSTS `max-age=31536000; includeSubDomains; preload`; sem TLS interno desabilitado                              |
| Em repouso — volume    | Criptografia de disco/RDS via KMS                                                                                                                       |
| Em repouso — coluna    | Envelope encryption AES-256-GCM para C2/C3 (`email`, `phone`, `destination`, `message`, respostas de triagem); DEK por registro, cifrada por KEK no KMS |
| Backups                | Snapshots criptografados; export de auditoria em bucket com Object Lock                                                                                 |
| Mobile                 | Tokens no Keychain (iOS) / Keystore (Android); nunca em `AsyncStorage`                                                                                  |
| Senhas                 | Argon2id (fallback bcrypt custo ≥ 12); nunca reversível                                                                                                 |
| Códigos de verificação | Somente hash (SHA-256 + salt) no banco; TTL 15 min; uso único                                                                                           |

### 5.2 Gestão de chaves

| Item                  | Regra                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origem                | AWS KMS (ou GCP KMS). Chaves **nunca** em código, imagem ou repositório                                                                              |
| Segredos de aplicação | Secrets Manager / SSM; injetados como variável de ambiente no boot                                                                                   |
| Rotação               | KEK: anual (automática). `JWT_SECRET`: trimestral, com janela de dupla validação. Chaves de provedor: semestral ou a cada troca de pessoa com acesso |
| Acesso                | IAM por função; ninguém tem acesso permanente a segredos de produção — só via elevação temporária com justificativa registrada                       |
| Emergência            | Procedimento de revogação imediata + invalidação de todas as sessões                                                                                 |
| Repositório           | `git-secrets`/`gitleaks` no CI; `.env` no `.gitignore`; apenas `.env.example` versionado                                                             |

### 5.3 Autenticação e autorização

- Access token JWT HS256, TTL 15 min, com `jti`; refresh token opaco de 30 dias, rotativo,
  armazenado com hash e revogável. Reuso de refresh token → revoga toda a família de tokens.
- Autorização por papel (`user`, `clinician`, `admin`) **e** por propriedade do recurso:
  todo acesso a `contact`/`panic_event` valida `resource.userId === auth.userId`.
- Profissional só acessa paciente com vínculo ativo e escopo consentido.
- MFA obrigatório para `admin` e para o painel clínico. `TODO` — implementar na v1.
- Bloqueio progressivo após tentativas de login malsucedidas.

### 5.4 Proteção de aplicação

| Controle             | Implementação                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| Validação de entrada | `zod` em todo payload; rejeição de campos desconhecidos                  |
| Rate limiting        | Por usuário, por IP e por rota (ver PANIC_BUTTON_DESIGN.md §4)           |
| Headers              | `helmet` (CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) |
| CORS                 | Allowlist explícita de origens (app web e domínios próprios)             |
| Injeção              | Query builder/ORM parametrizado; nenhuma concatenação de SQL             |
| Payload              | Limite de 100 KB por requisição                                          |
| Dependências         | `npm audit` + Dependabot no CI; falha em vulnerabilidade alta/crítica    |
| Segredos no código   | `gitleaks` no CI                                                         |
| Erros                | Handler central; nunca vaza stack trace ou detalhe interno ao cliente    |

### 5.5 Log e auditoria

**Log de aplicação (retenção 90 dias)** — JSON estruturado, sem PII. Campos proibidos:
`message`, `destination`, `email`, `phone`, `lat`, `lon`, `code`, `token`, `authorization`.
Redaction centralizada no logger e coberta por teste automatizado.

**Log de auditoria (WORM, retenção 5 anos `TODO [LEGAL]`)** — tabela append-only:
sem `UPDATE`/`DELETE` (revogado por GRANT), hash SHA-256 encadeado ao registro anterior,
export diário para bucket com Object Lock (compliance mode).

Eventos auditados obrigatoriamente:

```
USER_REGISTERED · USER_LOGIN · USER_LOGIN_FAILED · CONSENT_GRANTED · CONSENT_REVOKED
CONTACT_CREATED · CONTACT_VERIFIED · CONTACT_REVOKED · CONTACT_VERIFY_FAILED
PANIC_TRIGGERED · PANIC_NOTIFICATION_SENT · PANIC_NOTIFICATION_FAILED · PANIC_RESOLVED
CLINICIAN_LINKED · CLINICIAN_UNLINKED · CLINICIAN_VIEWED_PATIENT
DATA_EXPORT_REQUESTED · ACCOUNT_DELETION_REQUESTED · ADMIN_ACTION
```

Cada registro guarda: `occurredAt`, `actorId` (pseudonimizado), `action`, `entityType`,
`entityId`, `metadata` (sem PII), `prevHash`, `hash`.

### 5.6 Retenção

| Dado                      | Retenção                                          | Após o prazo                                             |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Conta ativa               | enquanto durar a relação                          | —                                                        |
| Conta excluída            | anonimização em ≤ 30 dias                         | identificadores substituídos por pseudônimo irreversível |
| `panic_events`            | 24 meses                                          | agregação estatística e descarte do conteúdo             |
| Mensagens de pânico       | 12 meses                                          | apagadas                                                 |
| Localização               | 90 dias                                           | apagada                                                  |
| Log de aplicação          | 90 dias                                           | descarte automático                                      |
| Log de auditoria          | 5 anos `TODO [LEGAL]`                             | descarte com ata                                         |
| Backups                   | 35 dias (PITR)                                    | rotação automática                                       |
| Dados de contato revogado | destino em hash na lista de bloqueio (indefinido) | mantido só para impedir reenvio                          |

---

## 6. Segurança operacional

| Área                   | Prática                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| SDLC                   | PR com ≥ 1 revisor; CI obrigatório (lint, testes, audit, gitleaks); sem push direto na `main` |
| Ambientes              | Segregação estrita; proibido dado real fora de produção                                       |
| Acesso a produção      | Just-in-time, com aprovação e registro; sem acesso permanente ao banco                        |
| Máquinas               | Disco criptografado, MFA, gerenciador de senhas corporativo                                   |
| Fornecedores           | Avaliação de segurança antes da contratação; DPA/BAA assinado                                 |
| Testes                 | Pentest externo anual + a cada mudança arquitetural relevante; SAST no CI                     |
| Vulnerabilidades       | SLA: crítica 24 h, alta 7 dias, média 30 dias                                                 |
| Divulgação responsável | `SECURITY.md` com canal `security@` e política de safe harbor                                 |

### 6.1 Política de `npm audit` no CI

O gate de dependências é dividido por superfície de risco:

| Escopo                      | Comando                                   | Comportamento                                                                                                              |
| --------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Produção** (`--omit=dev`) | `npm audit --omit=dev --audit-level=high` | **Bloqueia o merge.** É o código que roda em runtime e é alcançável por um atacante. Estado atual: **0 vulnerabilidades**. |
| **Desenvolvimento**         | `npm audit --audit-level=high`            | Informativo (`continue-on-error`). Falha visível no log, revisada a cada release.                                          |

**Por que o escopo de desenvolvimento não bloqueia:** há advisories transitivas sem correção
disponível fora de major. Caso atual: `brace-expansion <= 5.0.7` (DoS por expansão ilimitada),
puxado por `minimatch` dentro de `jest`/`ts-jest`. A única versão corrigida é a `5.0.8`, fora
da faixa aceita por qualquer consumidor instalado (`minimatch` 3.x/9.x/10.x) — forçar por
`overrides` quebraria a API. O risco concreto é negar serviço ao próprio runner de CI, não ao
produto.

Mitigações já aplicadas: ESLint migrado para a v10 (flat config), `typescript-eslint` v8 e
Jest v30, o que eliminou parte das cadeias vulneráveis.

**Regra:** um advisory que atinja `dependencies` (produção) é sempre bloqueante. Nenhuma
exceção nova de desenvolvimento entra sem registro nesta seção com data e justificativa.

| Advisory                | Escopo | Origem                           | Correção                                            | Revisar em           |
| ----------------------- | ------ | -------------------------------- | --------------------------------------------------- | -------------------- |
| `brace-expansion` (DoS) | dev    | `minimatch` via `jest`/`ts-jest` | aguardar release que aceite `brace-expansion@5.0.8` | a cada release maior |

### 6.2 Varredura de segredos

Roda a cada push, com o **binário oficial do gitleaks** em versão fixada
(a `gitleaks-action` exige licença paga para repositórios de organização; o gitleaks
em si é livre). A varredura cobre **todo o histórico**, não apenas o diff: um segredo
commitado e depois removido continua comprometido e exige rotação.

- `--redact` é obrigatório: nenhum valor encontrado pode ser impresso no log do CI.
- Configuração em `.gitleaks.toml`, com o conjunto de regras padrão estendido.

**Registro de exceções (allowlist).** Toda entrada é pontual — por fingerprint de commit
ou caminho exato — e precisa constar aqui:

| Exceção                                                          | Motivo                                                                                                                           | Rotação necessária          |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Achados históricos em `README.md` e `services/api/jest.setup.js` | Valores fictícios: token de exemplo de servidor local efêmero (TTL 15 min) e segredo JWT de teste. Já removidos do código atual. | Não — não dão acesso a nada |
| `.env.example`                                                   | Arquivo de referência: contém **nomes** de variáveis, nunca valores                                                              | Não                         |

**Proibido:** allowlist por caminho amplo (`src/`, `services/`) ou desativação de regra
inteira. Se um segredo **real** for encontrado, o procedimento é o da §7: rotacionar a
credencial primeiro, remover do histórico depois.

---

## 7. Resposta a incidentes

**Severidades:** P1 = vazamento de dado pessoal ou botão de pânico indisponível ·
P2 = degradação relevante · P3 = falha contida sem impacto a titular.

**Fluxo (P1):**

1. **Detectar** (alerta/relato) → abrir incidente e canal dedicado.
2. **Conter** (≤ 1 h): revogar chaves, isolar componente, bloquear acesso.
3. **Avaliar** (≤ 24 h): dados e titulares afetados, causa raiz preliminar; acionar DPO e
   jurídico.
4. **Comunicar** (≤ 48 h da confirmação): decisão sobre notificação à ANPD e aos titulares —
   sob GDPR, prazo de 72 h. Comunicação em PT-BR, clara, sem jargão. `TODO [LEGAL]`
5. **Erradicar e recuperar**: corrigir, restaurar, validar integridade da auditoria.
6. **Post-mortem sem culpados** em ≤ 5 dias úteis, com ações e responsáveis.

**Contatos:** DPO `TODO [LEGAL]` · jurídico `TODO [LEGAL]` · plantão de engenharia (on-call).

---

## 8. Considerações éticas e clínicas

- **Não exploramos vulnerabilidade:** sem dark patterns, sem gamificação que crie compulsão
  pelo próprio app, sem notificação que induza culpa.
- **Transparência sobre limites:** deixamos claro, em todos os canais, que o app não é
  emergência e não garante resposta humana.
- **Não monetizamos dados de saúde** — compromisso público e contratual.
- **Conteúdo clínico revisado** por profissional habilitado antes de publicar. `TODO [CLINICAL]`
- **Antiabuso:** o botão pode ser usado para assediar terceiros; double opt-in, opt-out
  permanente, rate limit e canal de denúncia são controles obrigatórios, não opcionais.

---

## 9. Checklist pré-lançamento (bloqueantes)

- [ ] DPIA/RIPD concluído e aprovado `TODO [LEGAL]`
- [ ] DPO nomeado e publicado `TODO [LEGAL]`
- [ ] Termos de Uso e Política de Privacidade em PT-BR revisados `TODO [LEGAL]`
- [ ] Tratamento de menores de 18 anos definido `TODO [LEGAL]` — **bloqueante**
- [ ] DPAs assinados (Twilio, SendGrid, cloud, Sentry) `TODO [LEGAL]`
- [ ] Textos clínicos e critérios de risco validados `TODO [CLINICAL]`
- [ ] Protocolo de encaminhamento com parceiros clínicos assinado `TODO [CLINICAL]`
- [ ] Criptografia por coluna implementada e testada
- [ ] `audit_log` sem permissão de UPDATE/DELETE em produção (verificado por script)
- [ ] Teste automatizado de redaction de PII em logs passando
- [ ] Pentest sem findings críticos/altos em aberto
- [ ] Runbook de incidente testado em simulação (tabletop)
- [ ] Fluxos de exportação e exclusão de conta funcionando ponta a ponta
