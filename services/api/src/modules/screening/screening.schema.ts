import { z } from 'zod';

/**
 * Entrada do rastreio NODS-3-BR.
 *
 * Os três itens são obrigatórios: o ponto de corte é "pelo menos um positivo",
 * então um item ausente mudaria silenciosamente o resultado. `strict()` impede
 * que o cliente envie campos extras — inclusive um "resultado" já calculado.
 */
export const nods3Schema = z
  .object({
    controle: z.boolean({ required_error: 'Responda o item de perda de controle.' }),
    escapismo: z.boolean({ required_error: 'Responda o item de escapismo.' }),
    recuperar: z.boolean({ required_error: 'Responda o item de jogar para recuperar.' }),
  })
  .strict();

export type Nods3Input = z.infer<typeof nods3Schema>;
