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

/**
 * Entrada do OGD-Q BR. Os 11 itens são obrigatórios — item ausente mudaria o
 * escore e a classificação em silêncio. `duracao` é o item 12 do instrumento e
 * define o estrato quando o critério de itens é atingido.
 */
// União de literais (não `number().min(1).max(5)`) para que o tipo inferido seja
// exatamente 1|2|3|4|5 — os pontos da escala Likert publicada, sem intermediários.
const notaOgdq = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)], {
  errorMap: () => ({ message: 'Responda na escala de 1 a 5.' }),
});

export const ogdqSchema = z
  .object({
    respostas: z
      .object({
        tolerancia: notaOgdq,
        abstinencia: notaOgdq,
        controle: notaOgdq,
        persistencia: notaOgdq,
        preocupacao: notaOgdq,
        escapismo: notaOgdq,
        perda_de_controle: notaOgdq,
        recuperar: notaOgdq,
        mentira: notaOgdq,
        resgate_financeiro: notaOgdq,
        prioridade: notaOgdq,
      })
      .strict(),
    duracao: z.enum(['mais_de_12_meses', 'mais_de_6_meses', 'mais_de_1_mes', 'recentemente'], {
      errorMap: () => ({ message: 'Informe há quanto tempo (item 12 do questionário).' }),
    }),
  })
  .strict();

export type OgdqInput = z.infer<typeof ogdqSchema>;
