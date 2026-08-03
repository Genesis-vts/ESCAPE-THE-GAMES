import { Router } from 'express';
import type { Container } from '../../container';
import { requireAuth } from '../../middleware/auth';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

/** Rotas de autorregulação. Sem rate limit agressivo: nenhuma tem efeito externo. */
export function createGoalsRouter(deps: Container): Router {
  const router = Router();
  const controller = new GoalsController(new GoalsService(deps));

  router.post('/goals', requireAuth(), controller.create);
  router.get('/goals/progress', requireAuth(), controller.progress);
  // Recaída é declarada pelo usuário — nunca inferida do botão de pânico.
  router.post('/goals/lapse', requireAuth(), controller.lapse);

  return router;
}
