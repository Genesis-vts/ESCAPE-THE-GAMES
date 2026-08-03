import { z } from 'zod';

export const createGoalSchema = z
  .object({
    /** Meta de dias livres. Sem teto artificial, mas com limite sensato. */
    targetDaysFree: z.number().int().min(1).max(3650),
    /**
     * Data de início da contagem. Opcional — o padrão é agora.
     *
     * Existe para a pessoa poder registrar que já está há um tempo sem jogar
     * quando chega ao produto, em vez de zerar um progresso real.
     */
    startedAt: z.string().datetime().optional(),
  })
  .strict();

/**
 * Registro de recaída.
 *
 * Rota **explícita e do próprio usuário** — deliberadamente separada do botão
 * de pânico. Ver o comentário em `goals.service.ts`.
 */
export const registerLapseSchema = z
  .object({
    occurredAt: z.string().datetime().optional(),
  })
  .strict();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type RegisterLapseInput = z.infer<typeof registerLapseSchema>;
