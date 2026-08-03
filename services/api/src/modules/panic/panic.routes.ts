import { Router } from 'express';
import { env } from '../../config/env';
import type { Container } from '../../container';
import { requireAuth } from '../../middleware/auth';
import { MENSAGEM_LIMITE_PANICO, createRateLimiter } from '../../middleware/rateLimit';
import { PanicController } from './panic.controller';
import { PanicService } from './panic.service';

/**
 * Rotas do botão de pânico.
 *
 * Limites (PANIC_BUTTON_DESIGN.md §4): 5 acionamentos por hora e 10 por dia,
 * por usuário. O excedente é auditado — pico de acionamento é sinal clínico.
 */
export function createPanicRouter(deps: Container): Router {
  const router = Router();
  const service = new PanicService(deps);
  const controller = new PanicController(service);

  const registrarExcedente = (chave: string) => {
    deps.audit.append({
      actorId: chave,
      actorType: 'user',
      action: 'RATE_LIMIT_EXCEEDED',
      entityType: 'panic_event',
      entityId: 'n/a',
      metadata: { rota: 'POST /panic' },
    });
  };

  const limitePorHora = createRateLimiter({
    limit: env.PANIC_RATE_LIMIT_PER_HOUR,
    windowMs: 60 * 60 * 1000,
    message: MENSAGEM_LIMITE_PANICO,
    onExceeded: (_req, chave) => registrarExcedente(chave),
  });

  const limitePorDia = createRateLimiter({
    limit: env.PANIC_RATE_LIMIT_PER_DAY,
    windowMs: 24 * 60 * 60 * 1000,
    message: MENSAGEM_LIMITE_PANICO,
    onExceeded: (_req, chave) => registrarExcedente(chave),
  });

  router.post(
    '/panic',
    requireAuth(),
    limitePorHora.middleware,
    limitePorDia.middleware,
    controller.trigger,
  );
  router.get('/panic/:eventId', requireAuth(), controller.get);
  router.post('/panic/:eventId/resolve', requireAuth(), controller.resolve);

  return router;
}
