import type { NextFunction, Request, Response } from 'express';
import { newId } from '../utils/crypto';
import { logger } from '../utils/logger';

/**
 * Injeta `requestId` e um logger com contexto em cada requisição.
 * O `requestId` volta no header `X-Request-Id` para correlacionar suporte,
 * cliente e servidor sem precisar de nenhum dado pessoal.
 */
export function requestContext() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const entrada = req.header('x-request-id');
    const requestId = entrada && /^[\w-]{8,64}$/.test(entrada) ? entrada : newId();

    req.requestId = requestId;
    req.log = logger.child({ requestId, method: req.method, path: req.path });
    res.setHeader('X-Request-Id', requestId);

    const inicio = process.hrtime.bigint();
    res.on('finish', () => {
      const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
      req.log.info('requisicao_concluida', {
        status: res.statusCode,
        duracaoMs: Math.round(duracaoMs),
      });
    });

    next();
  };
}
