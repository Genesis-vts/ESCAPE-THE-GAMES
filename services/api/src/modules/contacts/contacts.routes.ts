import { Router } from 'express';
import type { Container } from '../../container';
import { requireAuth } from '../../middleware/auth';
import { createRateLimiter } from '../../middleware/rateLimit';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

/** Rotas da rede de apoio. Limites conforme PANIC_BUTTON_DESIGN.md §4. */
export function createContactsRouter(deps: Container): Router {
  const router = Router();
  const controller = new ContactsController(new ContactsService(deps));

  const limiteCriacao = createRateLimiter({
    limit: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Muitos cadastros de contato em pouco tempo. Tente novamente mais tarde.',
  });

  const limiteVerificacao = createRateLimiter({
    limit: 5,
    windowMs: 15 * 60 * 1000,
    keyFn: (req) => `${req.auth?.userId ?? req.ip}:${req.params.id ?? 'sem-id'}`,
    message: 'Muitas tentativas de verificação. Solicite um novo código.',
  });

  const limiteReenvio = createRateLimiter({
    limit: 3,
    windowMs: 60 * 60 * 1000,
    keyFn: (req) => `${req.auth?.userId ?? req.ip}:${req.params.id ?? 'sem-id'}`,
    message: 'Limite de reenvios atingido. Tente novamente mais tarde.',
  });

  router.post('/contacts', requireAuth(), limiteCriacao.middleware, controller.create);
  router.get('/contacts', requireAuth(), controller.list);
  router.post(
    '/contacts/:id/verify',
    requireAuth(),
    limiteVerificacao.middleware,
    controller.verify,
  );
  router.post('/contacts/:id/resend', requireAuth(), limiteReenvio.middleware, controller.resend);
  router.delete('/contacts/:id', requireAuth(), controller.revoke);

  return router;
}
