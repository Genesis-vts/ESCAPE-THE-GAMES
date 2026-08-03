import { z } from 'zod';

/**
 * Schemas de entrada do módulo de contatos.
 * Campos desconhecidos são rejeitados (`strict`) — evita que o cliente injete
 * atributos não previstos.
 */
export const createContactSchema = z
  .object({
    displayName: z.string().trim().min(1, 'Informe o nome do contato.').max(80),
    relationship: z.string().trim().max(40).optional(),
    channel: z.enum(['sms', 'email', 'push', 'whatsapp_deeplink'], {
      errorMap: () => ({ message: 'Canal deve ser sms, email, push ou whatsapp_deeplink.' }),
    }),
    destination: z.string().trim().min(3, 'Informe o destino do contato.').max(254),
    priority: z.number().int().min(1).max(10).optional(),
  })
  .strict();

export const verifyContactSchema = z
  .object({
    verificationToken: z.string().min(10, 'Token de verificação inválido.'),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'O código tem 6 dígitos.'),
  })
  .strict();

export const contactIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type VerifyContactInput = z.infer<typeof verifyContactSchema>;
