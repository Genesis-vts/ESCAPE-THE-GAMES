# Descrição

<!-- O que muda e por quê. Cite a issue: Closes #123 -->

## Tipo de mudança

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `docs` — documentação
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `test` — testes
- [ ] `chore` / `ci` — infraestrutura e ferramentas

## Como testar

<!-- Passos exatos, incluindo curl ou tela do app -->

---

## Checklist de qualidade

- [ ] `npm run lint` e `npm run typecheck` passam
- [ ] Testes novos ou atualizados; suíte verde (`npm test`)
- [ ] Cobertura mantida nos módulos `panic` e `contacts` (≥ 70%)
- [ ] Sem `console.log` esquecido nem código morto
- [ ] Erros tratados pelo handler central (`AppError`), sem `try/catch` que engole falha

## Checklist de privacidade e segurança

- [ ] **Nenhum segredo** em código, teste, fixture ou log — apenas variáveis de ambiente
- [ ] Nenhuma PII em log, mensagem de erro, auditoria ou telemetria
      (`message`, `destination`, `email`, `phone`, `lat`/`lon`, códigos, tokens)
- [ ] Payloads validados com zod, com `.strict()` onde aplicável
- [ ] Autorização verifica **propriedade do recurso**, não só o papel
- [ ] Rate limit aplicado em rota nova que crie efeito externo (envio, cadastro)
- [ ] Mudança em dado pessoal está refletida em `docs/SECURITY_AND_COMPLIANCE.md`
- [ ] Novo subprocessador? DPA verificado `TODO [LEGAL]`

## Checklist de acessibilidade (UI)

- [ ] Contraste mínimo WCAG 2.1 AA (4.5:1 em texto normal, 3:1 em texto grande)
- [ ] Alvos de toque ≥ 44 dp (≥ 64 dp no botão de pânico)
- [ ] Rótulos de leitor de tela em todo controle interativo
- [ ] Navegação completa por teclado (web) e foco visível
- [ ] Layout íntegro com texto ampliado até 200%
- [ ] Nenhuma informação transmitida **apenas** por cor
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Textos em PT-BR, linguagem simples e não estigmatizante

## Impacto clínico e legal

- [ ] Mudou texto exibido ao usuário ou ao contato de apoio? → revisão clínica `TODO [CLINICAL]`
- [ ] Mudou consentimento, retenção ou base legal? → revisão jurídica `TODO [LEGAL]`
- [ ] Disclaimer de "não é serviço de emergência" preservado em todos os canais afetados

## Riscos e rollback

<!-- O que pode quebrar e como reverter -->
