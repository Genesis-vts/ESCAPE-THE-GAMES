import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { createContainer, type Container } from './container';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestContext } from './middleware/requestContext';
import { createRateLimiter } from './middleware/rateLimit';
import { createContactsRouter } from './modules/contacts/contacts.routes';
import { createGoalsRouter } from './modules/goals/goals.routes';
import { createHealthRouter } from './modules/health/health.routes';
import { createJournalRouter } from './modules/journal/journal.routes';
import { createOptOutRouter } from './modules/optout/optout.routes';
import { createPanicRouter } from './modules/panic/panic.routes';
import { createScreeningRouter } from './modules/screening/screening.routes';

/**
 * Composição da aplicação Express.
 *
 * Recebe o container por parâmetro para que os testes injetem dublês de
 * provedor e uma fila sem espera entre retentativas.
 */
export function createApp(deps: Container = createContainer()): Express {
  const app = express();

  // `trust proxy`: atrás de ALB/Cloud Run, o IP real vem em X-Forwarded-For.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id', 'Retry-After', 'X-RateLimit-Remaining'],
    }),
  );
  // Limite de payload: o maior corpo legítimo é um /panic com mensagem de 280 caracteres.
  app.use(express.json({ limit: '100kb' }));
  // Webhooks de provedor chegam como form-urlencoded (padrão da Twilio).
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(requestContext());

  // Limite global por IP, antes da autenticação (defesa contra força bruta).
  const limiteGlobal = createRateLimiter({
    limit: 100,
    windowMs: 60 * 1000,
    keyFn: (req) => req.ip ?? 'anonimo',
    message: 'Muitas requisições. Aguarde um instante.',
  });
  app.use(limiteGlobal.middleware);

  app.use(createHealthRouter(deps));
  // Rotas públicas (sem JWT): descadastro do contato e webhook de SMS entrante.
  app.use('/api/v1', createOptOutRouter(deps));
  app.use('/api/v1', createPanicRouter(deps));
  app.use('/api/v1', createContactsRouter(deps));
  app.use('/api/v1', createScreeningRouter(deps));
  app.use('/api/v1', createJournalRouter(deps));
  app.use('/api/v1', createGoalsRouter(deps));

  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
