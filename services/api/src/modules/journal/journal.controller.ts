import type { NextFunction, Request, Response } from 'express';
import { getUserId } from '../../middleware/auth';
import { createJournalEntrySchema, listJournalQuerySchema } from './journal.schema';
import type { JournalService } from './journal.service';

export class JournalController {
  constructor(private readonly service: JournalService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = createJournalEntrySchema.parse(req.body ?? {});
      const entrada = await this.service.create(userId, input);

      // Nunca registramos `triggerType`, `intensity` nem `notes`: dado de saúde.
      req.log.info('diario_registrado', { entryId: entrada.id });

      res.status(201).json({ entry: entrada });
    } catch (erro) {
      next(erro);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const query = listJournalQuerySchema.parse(req.query ?? {});
      res.status(200).json(await this.service.list(userId, query));
    } catch (erro) {
      next(erro);
    }
  };
}
