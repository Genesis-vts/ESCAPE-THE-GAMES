import { Router } from 'express';
import type { Container } from '../../container';
import { requireAuth } from '../../middleware/auth';
import { createRateLimiter } from '../../middleware/rateLimit';
import { ScreeningController } from './screening.controller';
import { ScreeningService } from './screening.service';

/** Rotas do rastreio breve (NODS-3-BR). */
export function createScreeningRouter(deps: Container): Router {
  const router = Router();
  const controller = new ScreeningController(new ScreeningService(deps));

  // Rastreio é barato e não tem efeito externo, mas continua sendo escrita em
  // auditoria — limite generoso o bastante para refazer, apertado o bastante
  // para não virar vetor de inflar o log.
  const limite = createRateLimiter({
    limit: 20,
    windowMs: 60 * 60 * 1000,
    message: 'Muitos rastreios em pouco tempo. Tente novamente mais tarde.',
  });

  router.get('/screening/nods3', requireAuth(), controller.instrument);
  router.post('/screening/nods3', requireAuth(), limite.middleware, controller.submit);

  return router;
}
