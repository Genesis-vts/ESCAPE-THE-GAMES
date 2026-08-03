import { z } from 'zod';

/**
 * Payload do acionamento do botão de pânico.
 *
 * Exemplo:
 * { "message": "Preciso de ajuda agora",
 *   "location": { "lat": -23.55052, "lon": -46.633308 },
 *   "triggerType": "hold" }
 */
export const panicRequestSchema = z
  .object({
    message: z.string().trim().max(280, 'A mensagem pode ter no máximo 280 caracteres.').optional(),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
        accuracyMeters: z.number().nonnegative().optional(),
      })
      .optional(),
    // "tap" = toque simples; "hold" = manter pressionado (padrão do app).
    triggerType: z.enum(['tap', 'hold'], {
      errorMap: () => ({ message: 'triggerType deve ser "tap" ou "hold".' }),
    }),
    clientRequestId: z.string().max(64).optional(),
  })
  .strict();

export const panicEventIdParamSchema = z.object({
  eventId: z.string().min(1),
});

export type PanicRequestInput = z.infer<typeof panicRequestSchema>;
