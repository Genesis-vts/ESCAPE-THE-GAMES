import { z } from 'zod';

/**
 * Tipos de gatilho registráveis.
 *
 * Os dois primeiros existem por causa da literatura de **convergência entre
 * jogo eletrônico e aposta** (gamblification): loot box e publicidade de aposta
 * são as duas exposições que a literatura associa à transição de um para o
 * outro. Ver DATA_SOURCES.md §4.4.
 *
 * `TODO [CLINICAL]`: a lista é de escopo de produto, não taxonomia clínica
 * validada. Revisar com o serviço parceiro antes de usar em análise.
 */
export const TIPOS_DE_GATILHO = [
  'loot_box_exposure',
  'ads_exposure',
  'social_pressure',
  'anxiety',
  'craving',
] as const;

export type TipoDeGatilho = (typeof TIPOS_DE_GATILHO)[number];

export const createJournalEntrySchema = z
  .object({
    triggerType: z.enum(TIPOS_DE_GATILHO, {
      errorMap: () => ({
        message: `triggerType deve ser um de: ${TIPOS_DE_GATILHO.join(', ')}.`,
      }),
    }),
    intensity: z.number().int().min(1).max(10).optional(),
    /** Texto livre do usuário. Conteúdo sensível — nunca vai para log nem auditoria. */
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const listJournalQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type ListJournalQuery = z.infer<typeof listJournalQuerySchema>;
