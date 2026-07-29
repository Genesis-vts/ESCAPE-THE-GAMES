import type { NextFunction, Request, Response } from 'express';
import { getUserId } from '../../middleware/auth';
import { contactIdParamSchema, createContactSchema, verifyContactSchema } from './contacts.schema';
import type { ContactsService } from './contacts.service';

export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const input = createContactSchema.parse(req.body ?? {});
      const resultado = await this.service.create(userId, input);

      // Nunca registramos `destination` nem o código: PII e segredo.
      req.log.info('contato_criado', {
        contactId: resultado.contact.id,
        channel: resultado.contact.channel,
      });

      res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      res.status(200).json({ contacts: await this.service.list(userId) });
    } catch (erro) {
      next(erro);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { id } = contactIdParamSchema.parse(req.params);
      const input = verifyContactSchema.parse(req.body ?? {});
      const contact = await this.service.verify(userId, id, input);
      res.status(200).json({ contact });
    } catch (erro) {
      next(erro);
    }
  };

  resend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { id } = contactIdParamSchema.parse(req.params);
      res.status(200).json({ verification: await this.service.resendCode(userId, id) });
    } catch (erro) {
      next(erro);
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { id } = contactIdParamSchema.parse(req.params);
      res.status(200).json(await this.service.revoke(userId, id, 'user'));
    } catch (erro) {
      next(erro);
    }
  };
}
