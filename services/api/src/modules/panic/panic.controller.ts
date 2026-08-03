import type { NextFunction, Request, Response } from 'express';
import { getUserId } from '../../middleware/auth';
import { panicEventIdParamSchema, panicRequestSchema } from './panic.schema';
import type { PanicService } from './panic.service';

/**
 * Controllers do botão de pânico.
 * Responsabilidade única: traduzir HTTP <-> service. Nenhuma regra aqui.
 */
export class PanicController {
  constructor(private readonly service: PanicService) {}

  trigger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = panicRequestSchema.parse(req.body ?? {});
      const idempotencyKey = req.header('idempotency-key') ?? undefined;

      const resultado = await this.service.trigger(userId, input, idempotencyKey);

      // Log sem conteúdo da mensagem nem localização (PII).
      req.log.info('panico_acionado', {
        eventId: resultado.eventId,
        triggerType: input.triggerType,
        destinatarios: resultado.recipients.length,
      });

      res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { eventId } = panicEventIdParamSchema.parse(req.params);
      res.status(200).json(await this.service.getEvent(userId, eventId));
    } catch (erro) {
      next(erro);
    }
  };

  resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { eventId } = panicEventIdParamSchema.parse(req.params);
      res.status(200).json(await this.service.resolve(userId, eventId));
    } catch (erro) {
      next(erro);
    }
  };
}
