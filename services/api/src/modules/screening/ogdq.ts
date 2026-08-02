/**
 * OGD-Q BR — Questionário sobre Transtorno do Jogo de Aposta Online,
 * versão brasileira. 11 itens.
 *
 * FONTE PRIMÁRIA (lida na íntegra):
 *   Rego MCS, Souza VHM, Martins LF, Sanvicente-Vieira B.
 *   "Translation and Adaptation of the Online Gambling Disorder Questionnaire
 *   (OGD-Q) into Brazilian Portuguese."
 *   Journal of Gambling Studies, aceito em 27/01/2026.
 *   doi 10.1007/s10899-026-10480-9 · PUC-Rio.
 *   Instrumento original: González-Cabrera et al. (2020).
 *
 * POR QUE ESTE INSTRUMENTO EXISTE AQUI, AO LADO DO NODS-3-BR:
 *   o NODS-3-BR foi validado em apostadores de LOTERIA (idade média 50 anos), e
 *   seus autores declaram que a acurácia não generaliza para não-lotéricos. O
 *   OGD-Q BR foi validado em **aposta ONLINE na população brasileira** — que é
 *   exatamente o público deste produto. Os dois se complementam; nenhum
 *   substitui o outro.
 *
 * ESCOPO DECLARADO PELO PRÓPRIO INSTRUMENTO: o enunciado inclui apostas online,
 * pôquer, bingo, casas de aposta **e loot boxes em videogames** (FIFA,
 * Hearthstone, CS-GO). É o único instrumento aqui que cobre os dois lados da
 * decisão de escopo em aberto no BUSINESS_PLAN.md §10.
 *
 * PSICOMETRIA NA AMOSTRA BRASILEIRA (n = 298):
 *   alfa de Cronbach 0,92 · ômega 0,93 · AFC unifatorial com bom ajuste.
 *
 * ⚠️ LIMITE IMPORTANTE, DIFERENTE DO NODS-3-BR: este é um estudo de
 * **confiabilidade e estrutura fatorial**, não de acurácia diagnóstica. O artigo
 * **não** reporta sensibilidade nem especificidade. Portanto o resultado aqui
 * classifica intensidade declarada — não estima probabilidade de diagnóstico.
 * `TODO [CLINICAL]`: não usar a classificação como se fosse diagnóstico, e
 * confirmar os pontos de corte com o serviço clínico parceiro.
 */

export interface OgdqItem {
  /** Número do item no instrumento publicado. Não reordenar. */
  readonly numero: number;
  readonly id: string;
  /** Construto avaliado, para relatório clínico. */
  readonly construto: string;
  /** Enunciado da versão brasileira publicada. Não editar. */
  readonly pergunta: string;
}

/** Preâmbulo do instrumento. Define o que conta como "aposta online". */
export const OGDQ_PREAMBULO =
  'As perguntas a seguir são sobre jogo de aposta online: todos os jogos online ' +
  'que envolvem a sorte — pôquer online, bingos online, casas de apostas online — ' +
  'além da compra de pacotes e caixas de itens aleatórios (loot boxes) em ' +
  'videogames. Vale como aposta online qualquer aposta feita pela internet, com ' +
  'dinheiro, em que você não sabe se ganhará o prêmio desejado.';

export const OGDQ_ITENS: readonly OgdqItem[] = [
  {
    numero: 1,
    id: 'tolerancia',
    construto: 'Tolerância',
    pergunta:
      'Você sente a necessidade de gastar cada vez mais dinheiro para conseguir o prazer que deseja?',
  },
  {
    numero: 2,
    id: 'abstinencia',
    construto: 'Abstinência',
    pergunta:
      'Você se sente nervoso, irritado ou chateado quando tenta reduzir ou parar o seu jogo de aposta online?',
  },
  {
    numero: 3,
    id: 'controle',
    construto: 'Tentativas fracassadas de controle',
    pergunta:
      'Você já tentou controlar, reduzir ou abandonar o jogo de aposta online e não conseguiu? (caso não jogue, marque a opção nunca)',
  },
  {
    numero: 4,
    id: 'persistencia',
    construto: 'Persistência apesar do prejuízo',
    pergunta:
      'Você já sentiu que a prática do jogo de aposta online teve consequências negativas a nível pessoal, social, familiar ou acadêmico/trabalho, e continuou jogando mesmo assim?',
  },
  {
    numero: 5,
    id: 'preocupacao',
    construto: 'Preocupação',
    pergunta:
      'Você pensa frequentemente nas apostas online, por exemplo, lembrando apostas passadas, planejando próximas apostas, pensando em formas de ganhar mais dinheiro jogando online, revivendo momentos relacionados ao jogo de aposta online, etc.?',
  },
  {
    numero: 6,
    id: 'escapismo',
    construto: 'Escapismo',
    pergunta:
      'Você aposta ou joga jogos de aposta online quando está triste, ansioso ou se sente culpado, para se sentir melhor ou deixar de pensar em como está se sentindo?',
  },
  {
    numero: 7,
    id: 'perda_de_controle',
    construto: 'Perda de controle',
    pergunta:
      'Você sente que tem pouco controle sobre o jogo de aposta online (por exemplo, joga mais do que gostaria, gasta mais dinheiro do que pretendia, joga em lugares onde não deveria fazer isso, não consegue parar de jogar quando quer)?',
  },
  {
    numero: 8,
    id: 'recuperar',
    construto: 'Jogar para recuperar o prejuízo (chasing)',
    pergunta:
      'Depois de perder dinheiro em um jogo de apostas online, você volta a jogar para tentar recuperar o dinheiro perdido?',
  },
  {
    numero: 9,
    id: 'mentira',
    construto: 'Mentir para ocultar',
    pergunta:
      'Você mente para pessoas para esconder o tempo que passa ou quanto dinheiro realmente gasta jogando jogos online de aposta?',
  },
  {
    numero: 10,
    id: 'resgate_financeiro',
    construto: 'Pedir dinheiro para cobrir prejuízo',
    pergunta:
      'Você já pediu dinheiro a alguém para melhorar ou sair de um problema financeiro que o jogo de aposta online te causou?',
  },
  {
    numero: 11,
    id: 'prioridade',
    construto: 'Deslocamento de outras áreas da vida',
    pergunta:
      'Você já sentiu que dá prioridade ao jogo de aposta online ao invés de outras áreas da sua vida que antes eram mais importantes (estudar, sair com seus amigos, dormir menos que de costume caso jogue a noite, etc.)?',
  },
] as const;

/** Escala Likert de 5 pontos, conforme publicada. */
export const OGDQ_ESCALA = [
  { valor: 1, rotulo: 'Nunca' },
  { valor: 2, rotulo: 'Poucas vezes' },
  { valor: 3, rotulo: 'Com frequência' },
  { valor: 4, rotulo: 'Com muita frequência' },
  { valor: 5, rotulo: 'Todos os dias' },
] as const;

/** Item 12 do instrumento — há quanto tempo a pessoa vive as situações acima. */
export const OGDQ_DURACOES = [
  'mais_de_12_meses',
  'mais_de_6_meses',
  'mais_de_1_mes',
  'recentemente',
] as const;

export type OgdqDuracao = (typeof OGDQ_DURACOES)[number];
export type OgdqResposta = 1 | 2 | 3 | 4 | 5;

/**
 * Regras de pontuação, transcritas do artigo:
 *
 *  - Item com nota ≥ 3 conta como "problema"; ≤ 2 não conta.
 *  - O critério de transtorno é atingido com nota **≥ 4 em pelo menos 4 itens**.
 *  - A duração separa os estratos: ≥ 12 meses, 6–12 meses, e menos de 6 meses.
 */
export const OGDQ_NOTA_DE_PROBLEMA = 3;
export const OGDQ_NOTA_DE_CRITERIO = 4;
export const OGDQ_MINIMO_DE_ITENS = 4;

export const OGDQ_CONFIABILIDADE = { alfaDeCronbach: 0.92, omega: 0.93, n: 298 } as const;

export type OgdqClassificacao =
  'sem_indicadores' | 'indicadores_isolados' | 'em_risco' | 'problema' | 'criterio_de_transtorno';

export interface OgdqAvaliacao {
  classificacao: OgdqClassificacao;
  /** Soma bruta dos 11 itens: 11 a 55. */
  escoreTotal: number;
  /** Itens com nota ≥ 3. */
  itensComProblema: string[];
  /** Itens com nota ≥ 4 — os que contam para o critério. */
  itensNoCriterio: string[];
  /** Se atingiu ≥ 4 itens com nota ≥ 4, independentemente da duração. */
  atingeCriterioDeItens: boolean;
}

export function avaliarOgdq(
  respostas: Record<string, OgdqResposta>,
  duracao: OgdqDuracao,
): OgdqAvaliacao {
  const itensComProblema: string[] = [];
  const itensNoCriterio: string[] = [];
  let escoreTotal = 0;

  for (const item of OGDQ_ITENS) {
    const nota = respostas[item.id] ?? 1;
    escoreTotal += nota;
    if (nota >= OGDQ_NOTA_DE_PROBLEMA) itensComProblema.push(item.id);
    if (nota >= OGDQ_NOTA_DE_CRITERIO) itensNoCriterio.push(item.id);
  }

  const atingeCriterioDeItens = itensNoCriterio.length >= OGDQ_MINIMO_DE_ITENS;

  return {
    classificacao: classificar(atingeCriterioDeItens, itensComProblema.length, duracao),
    escoreTotal,
    itensComProblema,
    itensNoCriterio,
    atingeCriterioDeItens,
  };
}

function classificar(
  atingeCriterio: boolean,
  quantosComProblema: number,
  duracao: OgdqDuracao,
): OgdqClassificacao {
  if (!atingeCriterio) {
    if (quantosComProblema === 0) return 'sem_indicadores';
    // Há sinais, mas abaixo do critério de itens. Não é estrato do artigo —
    // é uma faixa nossa, para não devolver "sem indicadores" a quem relatou algo.
    return 'indicadores_isolados';
  }

  // Critério de itens atingido: a duração define o estrato (item 12).
  switch (duracao) {
    case 'mais_de_12_meses':
      return 'criterio_de_transtorno';
    case 'mais_de_6_meses':
      return 'problema';
    default:
      return 'em_risco';
  }
}

/**
 * Devolutiva ao usuário.
 *
 * Mesma regra do NODS-3-BR: rastreio não entrega diagnóstico e não produz
 * alarme. `TODO [CLINICAL]`: redação a revisar com o serviço clínico parceiro.
 */
export function mensagemDeDevolutivaOgdq(avaliacao: OgdqAvaliacao): string {
  if (avaliacao.classificacao === 'sem_indicadores') {
    return (
      'Suas respostas não indicaram sinais de alerta neste questionário. Ele não é ' +
      'um diagnóstico e pode não refletir o que você está vivendo. Se algo em ' +
      'relação a apostas está te incomodando, procurar ajuda continua valendo a pena.'
    );
  }

  if (avaliacao.classificacao === 'indicadores_isolados') {
    return (
      'Você marcou alguns sinais, mas abaixo do conjunto que o questionário usa ' +
      'como critério. Isso não é um diagnóstico nem um alarme — é informação sua. ' +
      'Vale prestar atenção se esses sinais aumentarem de frequência.'
    );
  }

  return (
    'Suas respostas reuniram vários sinais que costumam aparecer em quem está ' +
    'tendo dificuldade com apostas online. Isto é um questionário de rastreio, ' +
    'não um diagnóstico — quem avalia isso é um profissional de saúde.\n\n' +
    'Duas coisas gratuitas que você pode fazer hoje:\n' +
    '• Bloquear seu CPF em todas as casas de aposta autorizadas de uma só vez, ' +
    'pela Plataforma Centralizada de Autoexclusão do Ministério da Fazenda.\n' +
    '• Falar com um profissional pelo SUS — o Meu SUS Digital oferece ' +
    'teleatendimento com psicólogo e psiquiatra, sem custo.\n\n' +
    'Se você estiver em sofrimento agora, o CVV atende 24 horas pelo 188, de ' +
    'graça e em sigilo.'
  );
}
