import { z } from 'zod';

/**
 * Leitura e validação das variáveis de ambiente.
 *
 * Regra: nenhum segredo tem valor padrão em produção. Em desenvolvimento e teste
 * usamos valores fictícios para permitir `npm run dev` sem configuração prévia.
 * Ver `.env.example` na raiz do repositório.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  WEB_BASE_URL: z.string().url().default('http://localhost:3001'),
  CORS_ORIGINS: z.string().default('http://localhost:3001,http://localhost:8081'),

  // Autenticação
  JWT_SECRET: z.string().min(32).optional(),
  JWT_ISSUER: z.string().default('escape-the-games'),

  // Provedores — vazios em desenvolvimento: a fábrica cai para adaptadores de console.
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().default('apoio@escape-the-games.example'),
  SENDGRID_FROM_NAME: z.string().default('ESCAPE-THE-GAMES'),

  // Observabilidade
  SENTRY_DSN: z.string().optional(),

  // Regras de negócio
  PANIC_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(5),
  PANIC_RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(10),
  CONTACT_VERIFICATION_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  MAX_CONTACTS_PER_USER: z.coerce.number().int().positive().default(10),
  CONSENT_VERSION: z.string().default('v1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalhes = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Variáveis de ambiente inválidas -> ${detalhes}`);
}

const raw = parsed.data;

if (raw.NODE_ENV === 'production' && !raw.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção. Injete-o pelo cofre de segredos.');
}

const DEV_JWT_SECRET = 'segredo-de-desenvolvimento-nao-use-em-producao-32+';

export const env = {
  ...raw,
  JWT_SECRET: raw.JWT_SECRET ?? DEV_JWT_SECRET,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const;

export type Env = typeof env;
