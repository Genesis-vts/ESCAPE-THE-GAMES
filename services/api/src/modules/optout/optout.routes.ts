import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { env } from '../../config/env';
import type { Container } from '../../container';
import { AppError } from '../../errors/AppError';
import { createRateLimiter } from '../../middleware/rateLimit';
import { validateTwilioSignature } from '../../utils/crypto';
import { ContactsService } from '../contacts/contacts.service';

/**
 * Descadastro do contato de apoio ("não quero mais receber").
 *
 * Estas rotas são PÚBLICAS por decisão de produto: toda mensagem que enviamos a
 * um contato promete uma saída, e exigir login de quem nunca pediu para ser
 * contatado tornaria a promessa vazia. A autorização vem do token HMAC do link
 * (e-mail) ou da assinatura do provedor (SMS).
 *
 * Ver PANIC_BUTTON_DESIGN.md §3.3 e SECURITY_AND_COMPLIANCE.md §2 (L3, L7).
 */

const optOutLinkSchema = z.object({
  contactId: z.string().min(1),
  token: z.string().min(16),
});

/** Palavras aceitas como pedido de saída, conforme praxe das operadoras no Brasil. */
const PALAVRAS_DE_SAIDA = new Set(['sair', 'parar', 'pare', 'stop', 'cancelar', 'descadastrar']);

export function createOptOutRouter(deps: Container): Router {
  const router = Router();
  const service = new ContactsService(deps);

  // Limite generoso por IP: é rota pública e não autenticada, mas nunca deve ser
  // apertada a ponto de impedir alguém de sair.
  const limite = createRateLimiter({
    limit: 30,
    windowMs: 60 * 1000,
    keyFn: (req) => req.ip ?? 'anonimo',
    message: 'Muitas tentativas. Aguarde um instante e tente novamente.',
  });

  /**
   * Descadastro pelo link do e-mail.
   * `GET` também é aceito para funcionar direto do cliente de e-mail.
   */
  const handleLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const origem = req.method === 'GET' ? req.query : req.body;
      const { contactId, token } = optOutLinkSchema.parse({
        contactId:
          (origem as Record<string, unknown>)?.c ?? (origem as Record<string, unknown>)?.contactId,
        token: (origem as Record<string, unknown>)?.t ?? (origem as Record<string, unknown>)?.token,
      });

      await service.optOutByToken(contactId, token);

      res.status(200).json({
        status: 'revoked',
        message:
          'Pronto. Você não receberá mais mensagens do ESCAPE-THE-GAMES neste contato, ' +
          'nem se for cadastrado novamente.',
      });
    } catch (erro) {
      next(erro);
    }
  };

  router.get('/opt-out', limite.middleware, handleLink);
  router.post('/opt-out', limite.middleware, handleLink);

  /**
   * Webhook de SMS entrante (Twilio) — trata a resposta "SAIR".
   *
   * A assinatura é obrigatória em produção: sem ela, qualquer pessoa poderia
   * forjar um "SAIR" e derrubar a rede de apoio de um usuário em crise.
   */
  router.post(
    '/webhooks/sms/inbound',
    limite.middleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const params = (req.body ?? {}) as Record<string, string>;
        const assinatura = req.header('x-twilio-signature') ?? '';
        const url = `${env.API_BASE_URL}${req.originalUrl}`;

        if (env.TWILIO_AUTH_TOKEN) {
          if (!validateTwilioSignature(url, params, assinatura, env.TWILIO_AUTH_TOKEN)) {
            throw AppError.forbidden('Assinatura do webhook inválida.');
          }
        } else if (env.isProduction) {
          // Falha fechada: sem o token não há como distinguir provedor de atacante.
          throw AppError.forbidden('Webhook não configurado.');
        }

        const de = String(params.From ?? '').trim();
        const corpo = String(params.Body ?? '')
          .trim()
          .toLowerCase()
          .replace(/[.!]$/, '');

        if (!de) throw AppError.validation('Campo From ausente.');

        if (PALAVRAS_DE_SAIDA.has(corpo)) {
          const { revoked } = await service.optOutByDestination(de, 'sms_reply');
          req.log.info('optout_por_sms', { revogados: revoked });
        }

        // Twilio espera TwiML; devolvemos vazio para não responder nada ao remetente.
        res.status(200).type('text/xml').send('<Response></Response>');
      } catch (erro) {
        next(erro);
      }
    },
  );

  return router;
}
