# apps/mobile — aplicativo React Native

> Estado: **scaffold documental**. O projeto React Native ainda não foi inicializado —
> este README define a estrutura acordada e as regras que o app precisa respeitar.
> Épico correspondente: "App mobile — onboarding e botão de pânico" (ver `docs/ISSUES_BACKLOG.md`).

## Stack

| Item                 | Escolha                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| Framework            | React Native 0.74+ (CLI, sem Expo — precisamos de módulos nativos de push e háptico) |
| Linguagem            | TypeScript estrito                                                                   |
| Navegação            | React Navigation 6                                                                   |
| Estado/servidor      | TanStack Query + Zustand para estado local                                           |
| Formulários          | React Hook Form + zod (mesmos schemas da API)                                        |
| Push                 | Firebase Cloud Messaging (Android e iOS)                                             |
| Armazenamento seguro | react-native-keychain (Keychain/Keystore)                                            |
| Testes               | Jest + React Native Testing Library; Detox para E2E do fluxo de pânico               |

## Inicialização (quando o épico for iniciado)

```bash
npx @react-native-community/cli init mobile --directory apps/mobile --template react-native-template-typescript
```

## Estrutura planejada

```
apps/mobile/
  src/
    app/                  # navegação, providers, tema
    features/
      onboarding/         # cadastro, consentimento, perfil de jogo
      triagem/            # questionário e devolutiva
      panic/              # BOTÃO DE PÂNICO + tela de acompanhamento
      contacts/           # rede de apoio, verificação por código
      journal/            # registro diário (horas, humor, gatilho)
      exercises/          # respiração, adiar 15 min, reestruturação (TCC)
    shared/
      api/                # cliente HTTP, refresh de token, retry offline
      auth/               # armazenamento seguro do token
      ui/                 # design system (botões, cards, tipografia)
      i18n/               # PT-BR (idioma único no MVP)
  __tests__/
```

## Regras inegociáveis do app

1. **Token seguro.** Access/refresh token apenas em Keychain/Keystore. Nunca em
   `AsyncStorage`, nunca em log.
2. **Botão de pânico offline-first.** Sem rede, o acionamento é enfileirado localmente
   e reenviado com o **mesmo** `Idempotency-Key` — o usuário vê "enviando…", nunca um erro.
3. **Gesto padrão `hold` de 1,5 s** + janela de cancelamento de 5 s. `tap` disponível
   como alternativa de acessibilidade.
4. **Localização desligada por padrão.** Toggle explícito por acionamento; nunca coleta
   contínua em segundo plano.
5. **Acessibilidade.** Contraste AA, alvo de toque ≥ 64 dp, rótulos de leitor de tela,
   suporte a texto ampliado até 200%.
6. **Sem PII em telemetria.** Crashlytics/Sentry com scrubbing ativo; nunca enviar
   `message`, `destination` ou coordenadas.
7. **Disclaimer visível** na tela de pânico: o app não é serviço de emergência.

## Integração com a API

```
Base: http://localhost:3000/api/v1   (desenvolvimento)
Header: Authorization: Bearer <access token>
Header: Idempotency-Key: <uuid v4>   (obrigatório no POST /panic)
```

Contratos e exemplos de payload: `docs/MVP_SPEC.md` §5.

## Variáveis de ambiente do app

Use `react-native-config` com um `.env` **não versionado**:

```
API_BASE_URL=http://10.0.2.2:3000     # 10.0.2.2 = localhost do host no emulador Android
SENTRY_DSN=
```

`google-services.json` e `GoogleService-Info.plist` **não** são versionados
(ver `.gitignore`) — cada dev baixa do console do Firebase.
