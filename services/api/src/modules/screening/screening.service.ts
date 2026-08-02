import type { Container } from '../../container';
import { AppError } from '../../errors/AppError';
import {
  avaliarNods3,
  mensagemDeDevolutiva,
  NODS3_ACURACIA,
  NODS3_ITENS,
  NODS3_PONTO_DE_CORTE,
  type Nods3Avaliacao,
} from './nods3';
import {
  avaliarOgdq,
  mensagemDeDevolutivaOgdq,
  OGDQ_CONFIABILIDADE,
  OGDQ_DURACOES,
  OGDQ_ESCALA,
  OGDQ_ITENS,
  OGDQ_PREAMBULO,
  type OgdqAvaliacao,
} from './ogdq';
import type { Nods3Input, OgdqInput } from './screening.schema';

/** Canais públicos e gratuitos oferecidos junto com a devolutiva. */
const CAMINHOS_DE_APOIO = [
  {
    label: 'Autoexclusão — bloqueie seu CPF em todas as casas autorizadas',
    url: 'https://www.gov.br/pt-br/servicos/plataforma-centralizada-de-autoexclusao-apostas',
  },
  {
    label: 'Meu SUS Digital — teleatendimento gratuito com psicólogo e psiquiatra',
    url: 'https://meususdigital.saude.gov.br/',
  },
  { label: 'CVV — apoio emocional 24h, gratuito e sigiloso', phone: '188' },
] as const;

export interface ScreeningResult {
  instrument: {
    id: 'nods3-br';
    version: '1.0.0';
    source: string;
    cutoff: number;
    /** Acurácia na amostra de validação — não na nossa população. */
    validationAccuracy: typeof NODS3_ACURACIA;
    /** Aviso que acompanha o resultado em toda resposta da API. */
    generalizationWarning: string;
  };
  assessment: Nods3Avaliacao;
  message: string;
  supportPaths: typeof CAMINHOS_DE_APOIO;
  disclaimer: string;
}

export interface OgdqScreeningResult {
  instrument: {
    id: 'ogdq-br';
    version: '1.0.0';
    source: string;
    /** Confiabilidade na amostra brasileira. NÃO é acurácia diagnóstica. */
    reliability: typeof OGDQ_CONFIABILIDADE;
    generalizationWarning: string;
  };
  assessment: OgdqAvaliacao;
  message: string;
  supportPaths: typeof CAMINHOS_DE_APOIO;
  disclaimer: string;
}

const AVISO_OGDQ =
  'Validado em aposta online na população brasileira (n=298), com alta ' +
  'consistência interna. O estudo mede confiabilidade e estrutura fatorial — ' +
  'NÃO reporta sensibilidade nem especificidade. A classificação indica ' +
  'intensidade declarada, nunca diagnóstico.';

const AVISO_DE_GENERALIZACAO =
  'Instrumento validado em apostadores de loteria (idade média 50 anos, 83,9% ' +
  'homens). Os autores declaram que sensibilidade e especificidade não podem ser ' +
  'generalizadas para jogadores não lotéricos. Use como sinal de triagem, nunca ' +
  'como diagnóstico.';

const DISCLAIMER =
  'Este rastreio não é diagnóstico e não substitui avaliação profissional. ' +
  'O ESCAPE-THE-GAMES não é serviço de emergência.';

/**
 * Rastreio breve de transtorno do jogo.
 *
 * Decisão de projeto: o resultado **não** dispara notificação a contato de
 * apoio, não altera o `riskFlag` do botão de pânico e não aciona nenhuma
 * escalada automática. Rastreio positivo é informação para a própria pessoa —
 * transformá-lo em gatilho seria delatar sofrimento sem consentimento e usar
 * fora da finalidade validada. Ver CRISIS_PROTOCOL.md §"limites duros".
 */
export class ScreeningService {
  constructor(private readonly deps: Container) {}

  /** Itens do instrumento, para o cliente renderizar sem duplicar o enunciado. */
  getInstrument(): { cutoff: number; items: typeof NODS3_ITENS; warning: string } {
    return {
      cutoff: NODS3_PONTO_DE_CORTE,
      items: NODS3_ITENS,
      warning: AVISO_DE_GENERALIZACAO,
    };
  }

  async submit(userId: string, input: Nods3Input): Promise<ScreeningResult> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    const assessment = avaliarNods3(input);

    // Auditoria registra que houve rastreio e o escore agregado.
    // NÃO registra as respostas item a item: são dado de saúde, e o escore
    // basta para prestar contas de que a devolutiva correta foi entregue.
    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'SCREENING_COMPLETED',
      entityType: 'screening',
      entityId: 'nods3-br',
      metadata: { escore: assessment.escore, resultado: assessment.resultado },
    });

    return {
      instrument: {
        id: 'nods3-br',
        version: '1.0.0',
        source:
          'Tovar Velásquez JD. Dissertação de Mestrado, FMUSP, 2021. Orient. Hermano Tavares.',
        cutoff: NODS3_PONTO_DE_CORTE,
        validationAccuracy: NODS3_ACURACIA,
        generalizationWarning: AVISO_DE_GENERALIZACAO,
      },
      assessment,
      message: mensagemDeDevolutiva(assessment),
      supportPaths: CAMINHOS_DE_APOIO,
      disclaimer: DISCLAIMER,
    };
  }

  /** Itens e escala do OGD-Q BR, para o cliente renderizar. */
  getOgdqInstrument(): {
    preamble: string;
    items: typeof OGDQ_ITENS;
    scale: typeof OGDQ_ESCALA;
    durations: typeof OGDQ_DURACOES;
    warning: string;
  } {
    return {
      preamble: OGDQ_PREAMBULO,
      items: OGDQ_ITENS,
      scale: OGDQ_ESCALA,
      durations: OGDQ_DURACOES,
      warning: AVISO_OGDQ,
    };
  }

  async submitOgdq(userId: string, input: OgdqInput): Promise<OgdqScreeningResult> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    const assessment = avaliarOgdq(input.respostas, input.duracao);

    // Mesma política do NODS-3-BR: audita o agregado, nunca item a item.
    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'SCREENING_COMPLETED',
      entityType: 'screening',
      entityId: 'ogdq-br',
      metadata: { escore: assessment.escoreTotal, resultado: assessment.classificacao },
    });

    return {
      instrument: {
        id: 'ogdq-br',
        version: '1.0.0',
        source:
          'Rego MCS, Souza VHM, Martins LF, Sanvicente-Vieira B. J Gambling Studies, 2026. doi 10.1007/s10899-026-10480-9.',
        reliability: OGDQ_CONFIABILIDADE,
        generalizationWarning: AVISO_OGDQ,
      },
      assessment,
      message: mensagemDeDevolutivaOgdq(assessment),
      supportPaths: CAMINHOS_DE_APOIO,
      disclaimer: DISCLAIMER,
    };
  }
}
