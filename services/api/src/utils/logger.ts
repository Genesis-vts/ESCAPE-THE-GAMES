import { env } from '../config/env';

/**
 * Logger estruturado (JSON) com redação obrigatória de PII.
 *
 * Ver SECURITY_AND_COMPLIANCE.md §5.5: os campos abaixo NUNCA podem aparecer em
 * log de aplicação. A redação é central e coberta por teste automatizado
 * (`src/__tests__/logger.test.ts`) — não a contorne montando strings manualmente.
 */
const CAMPOS_SENSIVEIS = new Set([
  'message',
  'msg',
  'destination',
  'destinations',
  'email',
  'phone',
  'phonenumber',
  'lat',
  'lon',
  'latitude',
  'longitude',
  'location',
  'code',
  'verificationcode',
  'devcode',
  'token',
  'verificationtoken',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'password',
  'secret',
  'apikey',
]);

const NIVEIS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 } as const;
export type LogLevel = keyof typeof NIVEIS;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[profundidade-maxima]';
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));

  const saida: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(value as Record<string, unknown>)) {
    if (CAMPOS_SENSIVEIS.has(chave.toLowerCase())) {
      saida[chave] = '[REDACTED]';
    } else {
      saida[chave] = redact(valor, depth + 1);
    }
  }
  return saida;
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

function escrever(level: Exclude<LogLevel, 'silent'>, msg: string, meta: Record<string, unknown>) {
  if (NIVEIS[level] < NIVEIS[env.LOG_LEVEL]) return;
  const linha = JSON.stringify({
    level,
    time: new Date().toISOString(),
    // `event` e não `message`: "message" é campo redigido por conter texto do usuário.
    event: msg,
    ...(redact(meta) as Record<string, unknown>),
  });
  if (level === 'error' || level === 'warn') console.error(linha);
  else console.log(linha);
}

export function createLogger(bindings: Record<string, unknown> = {}): Logger {
  return {
    debug: (msg, meta = {}) => escrever('debug', msg, { ...bindings, ...meta }),
    info: (msg, meta = {}) => escrever('info', msg, { ...bindings, ...meta }),
    warn: (msg, meta = {}) => escrever('warn', msg, { ...bindings, ...meta }),
    error: (msg, meta = {}) => escrever('error', msg, { ...bindings, ...meta }),
    child: (extra) => createLogger({ ...bindings, ...extra }),
  };
}

export const logger = createLogger({ service: 'escape-api' });
