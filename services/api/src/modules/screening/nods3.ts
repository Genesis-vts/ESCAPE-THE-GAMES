/**
 * NODS-3-BR — rastreio breve de Transtorno do Jogo, 3 itens.
 *
 * FONTE PRIMÁRIA (lida na íntegra, não é estimativa nossa):
 *   Tovar Velásquez, Juan David. "Transtorno do jogo e jogo problemático nas
 *   loterias brasileiras: construindo uma amostra nacional representativa dos
 *   apostadores de loteria e validação de um instrumento de triagem."
 *   Dissertação de Mestrado, Faculdade de Medicina da USP, 2021.
 *   Orientador: Prof. Dr. Hermano Tavares.
 *   https://teses.usp.br/teses/disponiveis/5/5142/tde-29032022-125916/
 *
 * Os três itens são os de número #4, #8 e #10 da NODS (National Opinion Research
 * Center DSM Screen for Gambling Problems), selecionados por desempenho em
 * amostra brasileira. O enunciado abaixo é o do instrumento, transcrito da
 * Tabela 3 da dissertação — NÃO reescrever por estilo: alterar o enunciado
 * invalida as propriedades psicométricas medidas.
 *
 * CORRESPONDÊNCIA COM OS "3 Cs": em entrevista à revista Radis (Fiocruz,
 * 20/08/2025), Hermano Tavares resume os sinais de alerta como
 * **Controle, Confronto e Caça** — os mesmos três construtos, na ordem, com o
 * mesmo ponto de corte ("qualquer um desses três sinais, mesmo que
 * isoladamente"). É a formulação pública da mesma triagem, e é a linguagem que
 * deve aparecer na interface.
 *
 * AMOSTRA DE VALIDAÇÃO: 5.407 apostadores de loteria entrevistados em 494
 * unidades lotéricas de todo o Brasil (de 500 planejadas); 23.123 abordados,
 * 7.226 elegíveis, taxa de recusa 25,2%.
 *
 * ⚠️ LIMITE DE GENERALIZAÇÃO — DECLARADO PELOS PRÓPRIOS AUTORES (§6.1):
 *   "os itens foram derivados de jogadores de loteria legais, a sensibilidade e
 *   especificidade desses itens para classificar TJ não podem ser generalizados
 *   para jogadores não lotéricos no Brasil."
 *
 * O público deste produto — apostas online e jogo eletrônico — NÃO é a
 * população de validação. O apostador médio do estudo tinha 50,2 anos e 83,9%
 * eram homens. Portanto: este instrumento é o melhor ponto de partida
 * disponível com validação brasileira, e **não** é um rastreio validado para
 * os nossos usuários. Tratar o resultado como sinal de triagem, jamais como
 * diagnóstico. `TODO [CLINICAL]`: validar nesta população antes de usar o
 * resultado para qualquer decisão automatizada de maior consequência.
 */

export interface Nods3Item {
  /** Número do item na NODS original — preserva a rastreabilidade à fonte. */
  readonly nodsItem: 4 | 8 | 10;
  readonly id: 'controle' | 'escapismo' | 'recuperar';
  /**
   * Nome do "C" na formulação pública de Hermano Tavares (entrevista à Radis,
   * Fiocruz, 20/08/2025). Linguagem que a própria referência clínica usa com o
   * público — preferir na interface ao jargão do construto.
   */
  readonly c: 'Controle' | 'Confronto' | 'Caça';
  /** Construto avaliado, para relatório clínico. */
  readonly construto: string;
  /** Enunciado do instrumento. Não editar. */
  readonly pergunta: string;
}

export const NODS3_ITENS: readonly Nods3Item[] = [
  {
    nodsItem: 4,
    id: 'controle',
    c: 'Controle',
    construto: 'Perda de controle',
    pergunta: 'Você já tentou parar, reduzir, ou controlar as suas apostas?',
  },
  {
    nodsItem: 8,
    id: 'escapismo',
    c: 'Confronto',
    construto: 'Escapismo — apostar para lidar com emoções negativas',
    pergunta: 'Você já apostou como uma forma de escapar dos seus problemas pessoais?',
  },
  {
    nodsItem: 10,
    id: 'recuperar',
    c: 'Caça',
    construto: 'Jogar para recuperar o prejuízo (chasing)',
    pergunta:
      'Já houve um período em que quando você perdia dinheiro numa aposta você voltava um outro dia para tentar recuperar (e ficar quites)?',
  },
] as const;

export type Nods3ItemId = Nods3Item['id'];

/**
 * Ponto de corte: **uma** resposta positiva basta.
 *
 * Duas fontes independentes concordam:
 *  - Metodologia NODS-CLiP, seguida pela dissertação: "Uma resposta positiva a
 *    qualquer uma das três perguntas a seguir indica que um indivíduo é/já foi
 *    provável portador de TJ."
 *  - Hermano Tavares, sobre os 3 Cs (Radis/Fiocruz, 20/08/2025): "Qualquer um
 *    desses três sinais, mesmo que isoladamente, é um sinal preocupante de que
 *    a pessoa está na iminência de se complicar com as apostas, ou já está
 *    complicada."
 */
export const NODS3_PONTO_DE_CORTE = 1;

/**
 * Acurácia medida na amostra de validação (Tabela 3 da dissertação).
 * Referência para conversas clínicas — não é acurácia na nossa população.
 */
export const NODS3_ACURACIA = {
  ultimoAno: {
    transtornoDoJogo: { sensibilidade: 1.0, especificidade: 0.729, youden: 0.73 },
    jogoProblema: { sensibilidade: 0.965, especificidade: 0.739, youden: 0.7 },
  },
  aoLongoDaVida: {
    transtornoDoJogo: { sensibilidade: 1.0, especificidade: 0.661, youden: 0.66 },
    jogoProblema: { sensibilidade: 0.952, especificidade: 0.705, youden: 0.66 },
  },
} as const;

export type Nods3Resultado = 'negativo' | 'positivo';

export interface Nods3Avaliacao {
  resultado: Nods3Resultado;
  /** Quantos itens positivos (0 a 3). */
  escore: number;
  /** Quais construtos vieram positivos — insumo para personalizar o plano. */
  itensPositivos: Nods3ItemId[];
}

/**
 * Aplica o ponto de corte. Sem heurística nossa: conta itens positivos e
 * compara com o corte da fonte.
 */
export function avaliarNods3(respostas: Record<Nods3ItemId, boolean>): Nods3Avaliacao {
  const itensPositivos = NODS3_ITENS.filter((item) => respostas[item.id]).map((item) => item.id);

  return {
    resultado: itensPositivos.length >= NODS3_PONTO_DE_CORTE ? 'positivo' : 'negativo',
    escore: itensPositivos.length,
    itensPositivos,
  };
}

/**
 * Texto devolvido ao usuário após o rastreio.
 *
 * Regra que não muda: o rastreio **não** entrega diagnóstico e **não** produz
 * alarme. Um resultado positivo é convite, com caminho concreto e gratuito.
 *
 * `TODO [CLINICAL]`: redação a revisar com o serviço clínico parceiro antes de
 * ir a usuário real. O conteúdo abaixo evita deliberadamente rótulo
 * ("você tem", "você é") e linguagem de urgência.
 */
export function mensagemDeDevolutiva(avaliacao: Nods3Avaliacao): string {
  if (avaliacao.resultado === 'negativo') {
    return (
      'Suas respostas não indicaram sinais de alerta neste rastreio breve. ' +
      'Ele não é um diagnóstico, e pode não refletir o que você está vivendo. ' +
      'Se algo em relação a apostas ou jogos está te incomodando, procurar ajuda ' +
      'continua valendo a pena.'
    );
  }

  return (
    'Suas respostas indicaram sinais que costumam aparecer em quem está tendo ' +
    'dificuldade com apostas. Isto é um rastreio breve, não um diagnóstico — ' +
    'quem avalia isso é um profissional de saúde.\n\n' +
    'Duas coisas gratuitas que você pode fazer hoje:\n' +
    '• Bloquear seu CPF em todas as casas de aposta autorizadas de uma só vez, ' +
    'pela Plataforma Centralizada de Autoexclusão do Ministério da Fazenda.\n' +
    '• Falar com um profissional pelo SUS — o Meu SUS Digital oferece ' +
    'teleatendimento com psicólogo e psiquiatra, sem custo.\n\n' +
    'Se você estiver em sofrimento agora, o CVV atende 24 horas pelo 188, de ' +
    'graça e em sigilo.'
  );
}
