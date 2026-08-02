import type { NextFunction, Request, Response } from 'express';
import { getUserId } from '../../middleware/auth';
import { createGoalSchema, registerLapseSchema } from './goals.schema';
import type { GoalsService } from './goals.service';

export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = createGoalSchema.parse(req.body ?? {});
      const meta = await this.service.create(userId, input);
      res.status(201).json({ goal: meta });
    } catch (erro) {
      next(erro);
    }
  };

  progress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await this.service.getProgress(getUserId(req)));
    } catch (erro) {
      next(erro);
    }
  };

  lapse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = registerLapseSchema.parse(req.body ?? {});
      res.status(200).json(await this.service.registerLapse(userId, input));
    } catch (erro) {
      next(erro);
    }
  };
}
