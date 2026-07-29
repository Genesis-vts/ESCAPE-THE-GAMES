import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Limitador de taxa por janela deslizante, em memória.
 *
 * MVP: contadores locais à instância. v1: mover para Redis (token bucket
 * compartilhado) — ver ARCHITECTURE.md §6.3. Os limites por rota estão em
 * PANIC_BUTTON_DESIGN.md §4.
 *
 * O texto da resposta 429 do `/panic` é acolhedor, não técnico: quem bate no
 * limite está em crise, não é um cliente de API.
 */
export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  /** Chave do balde. Padrão: userId autenticado, com fallback para o IP. */
  keyFn?: (req: Request) => string;
  message?: string;
  /** Callback para auditar excedentes. */
  onExceeded?: (req: Request, key: string) => void;
}

interface Janela {
  hits: number[];
}

export interface RateLimiter {
  middleware: (req: Request, res: Response, next: NextFunction) => void;
  reset: () => void;
}

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const baldes = new Map<string, Janela>();
  const {
    limit,
    windowMs,
    keyFn = (req) => req.auth?.userId ?? req.ip ?? 'anonimo',
    message = 'Limite de requisições atingido. Tente novamente em instantes.',
    onExceeded,
  } = options;

  function middleware(req: Request, res: Response, next: NextFunction): void {
    const chave = keyFn(req);
    const agora = Date.now();
    const balde = baldes.get(chave) ?? { hits: [] };

    balde.hits = balde.hits.filter((t) => agora - t < windowMs);

    if (balde.hits.length >= limit) {
      const maisAntigo = balde.hits[0] ?? agora;
      const retryAfter = Math.max(1, Math.ceil((windowMs - (agora - maisAntigo)) / 1000));
      baldes.set(chave, balde);
      onExceeded?.(req, chave);
      next(AppError.rateLimited(message, retryAfter));
      return;
    }

    balde.hits.push(agora);
    baldes.set(chave, balde);

    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - balde.hits.length)));

    next();
  }

  return { middleware, reset: () => baldes.clear() };
}

/** Mensagem de acolhimento do 429 no botão de pânico (PANIC_BUTTON_DESIGN.md §4). */
export const MENSAGEM_LIMITE_PANICO =
  'Você acionou seu apoio há pouco tempo e suas mensagens já foram enviadas. ' +
  'Se a situação piorou e você está em risco agora, ligue 192 (SAMU) ou 188 (CVV).';
