import type { NextFunction, Request, Response } from 'express';
import { getUserId } from '../../middleware/auth';
import { nods3Schema, ogdqSchema } from './screening.schema';
import type { ScreeningService } from './screening.service';

export class ScreeningController {
  constructor(private readonly service: ScreeningService) {}

  instrument = (_req: Request, res: Response): void => {
    res.status(200).json(this.service.getInstrument());
  };

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = nods3Schema.parse(req.body ?? {});
      const resultado = await this.service.submit(userId, input);

      // Log estrutural: escore e resultado, nunca as respostas item a item.
      req.log.info('rastreio_concluido', {
        instrumento: 'nods3-br',
        escore: resultado.assessment.escore,
      });

      res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  };

  ogdqInstrument = (_req: Request, res: Response): void => {
    res.status(200).json(this.service.getOgdqInstrument());
  };

  submitOgdq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = ogdqSchema.parse(req.body ?? {});
      const resultado = await this.service.submitOgdq(userId, input);

      // Escore e classificação; nunca as respostas item a item.
      req.log.info('rastreio_concluido', {
        instrumento: 'ogdq-br',
        escore: resultado.assessment.escoreTotal,
      });

      res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  };
}
