import { Router } from 'express';
import { env } from '../../config/env';
import type { Container } from '../../container';

/**
 * Liveness e readiness.
 * Rota pública (sem JWT) — não expõe nada além de estado operacional.
 */
export function createHealthRouter(deps: Container): Router {
  const router = Router();
  const iniciadoEm = Date.now();

  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'escape-the-games-api',
      version: process.env.npm_package_version ?? '0.1.0',
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round((Date.now() - iniciadoEm) / 1000),
      queueDepth: deps.queue.size(),
    });
  });

  return router;
}
