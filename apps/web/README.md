# apps/web — Next.js (painel clínico + site)

> Estado: **scaffold documental**. O projeto Next.js ainda não foi inicializado —
> este README define a estrutura acordada. Épico correspondente:
> "Painel clínico" (ver `docs/ISSUES_BACKLOG.md`).

## Stack

| Item      | Escolha                                                                |
| --------- | ---------------------------------------------------------------------- |
| Framework | Next.js 14 (App Router, Server Components)                             |
| Linguagem | TypeScript estrito                                                     |
| Estilo    | Tailwind CSS + Radix UI (acessibilidade por padrão)                    |
| Dados     | TanStack Query no cliente; fetch no servidor para páginas autenticadas |
| Gráficos  | Recharts (séries de tempo/humor do paciente)                           |
| Testes    | Vitest + Testing Library; Playwright para E2E                          |

## Inicialização (quando o épico for iniciado)

```bash
npx create-next-app@latest apps/web --typescript --tailwind --app --eslint
```

## Estrutura planejada

```
apps/web/
  src/app/
    (public)/
      page.tsx              # landing
      termos/               # Termos de Uso            TODO [LEGAL]
      privacidade/          # Política de Privacidade  TODO [LEGAL]
      opt-out/              # descadastro de contato de apoio (SEM login)
    (clinico)/
      login/
      pacientes/            # lista de pacientes vinculados
      pacientes/[id]/       # triagem, séries, histórico de acionamentos
    api/                    # BFF: repassa à services/api, nunca expõe segredo ao browser
  src/components/
  src/lib/
```

## Páginas obrigatórias no MVP

| Rota                       | Autenticação      | Observação                                                 |
| -------------------------- | ----------------- | ---------------------------------------------------------- |
| `/`                        | não               | Landing com proposta de valor e disclaimer                 |
| `/termos` e `/privacidade` | não               | Textos em PT-BR, versionados `TODO [LEGAL]`                |
| `/opt-out?c=<contactId>`   | **não**           | Descadastro em um clique — exigir login aqui seria abusivo |
| `/login`                   | —                 | Painel clínico; MFA obrigatório na v1                      |
| `/pacientes`               | sim (`clinician`) | Só pacientes com vínculo ativo                             |
| `/pacientes/[id]`          | sim (`clinician`) | Todo acesso gera registro de auditoria                     |

## Regras inegociáveis

1. **Nenhum segredo no cliente.** Chaves de provedor ficam no servidor; o browser só
   fala com as rotas do BFF.
2. **Aviso permanente no painel:** _"Este painel não é canal de plantão."_
3. **Sem dados de paciente em query string** — usar rota com id opaco e verificar
   vínculo no servidor a cada requisição.
4. **CSP restritiva**, sem `unsafe-inline`; cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
5. **Acessibilidade WCAG 2.1 AA** — o painel é usado por profissionais em jornada longa.

## Variáveis de ambiente

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
API_INTERNAL_URL=http://api:3000       # usado apenas no servidor
SESSION_SECRET=                        # cofre de segredos; nunca no repositório
SENTRY_DSN=
```
