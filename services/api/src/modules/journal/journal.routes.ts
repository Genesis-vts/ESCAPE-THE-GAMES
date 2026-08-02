import { Router } from 'express';
import type { Container } from '../../container';
import { requireAuth } from '../../middleware/auth';
import { createRateLimiter } from '../../middleware/rateLimit';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

/** Rotas do diário de gatilhos. */
export function createJournalRouter(deps: Container): Router {
  const router = Router();
  const controller = new JournalController(new JournalService(deps));

  // Generoso: registrar gatilho é o comportamento que queremos incentivar.
  // O limite existe só para o diário não virar vetor de inflar a auditoria.
  const limite = createRateLimiter({
    limit: 60,
    windowMs: 60 * 60 * 1000,
    message: 'Muitos registros em pouco tempo. Tente novamente mais tarde.',
  });

  router.post('/journal', requireAuth(), limite.middleware, controller.create);
  router.get('/journal', requireAuth(), controller.list);

  return router;
}
