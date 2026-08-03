import request from 'supertest';
import {
  avaliarOgdq,
  OGDQ_ESCALA,
  OGDQ_ITENS,
  OGDQ_MINIMO_DE_ITENS,
  OGDQ_NOTA_DE_CRITERIO,
  type OgdqDuracao,
  type OgdqResposta,
} from '../modules/screening/ogdq';
import { createTestHarness, type TestHarness } from './helpers';

/** Todas as respostas no mínimo (1 = Nunca), com override por item. */
function respostas(overrides: Record<string, OgdqResposta> = {}) {
  const base: Record<string, OgdqResposta> = {};
  for (const item of OGDQ_ITENS) base[item.id] = 1;
  return { ...base, ...overrides };
}

/** Marca `quantos` itens com a nota dada, na ordem do instrumento. */
function comNota(quantos: number, nota: OgdqResposta) {
  const over: Record<string, OgdqResposta> = {};
  for (const item of OGDQ_ITENS.slice(0, quantos)) over[item.id] = nota;
  return respostas(over);
}

describe('Rastreio OGD-Q BR', () => {
  let harness: TestHarness;

  beforeEach(() => {
    harness = createTestHarness();
  });

  const responder = (body: Record<string, unknown>) =>
    request(harness.app)
      .post('/api/v1/screening/ogdq')
      .set('Authorization', `Bearer ${harness.token}`)
      .send(body);

  describe('fidelidade ao instrumento publicado', () => {
    it('mantém os 11 itens, numerados como no artigo', () => {
      expect(OGDQ_ITENS).toHaveLength(11);
      expect(OGDQ_ITENS.map((i) => i.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      expect(OGDQ_ITENS[7]?.pergunta).toBe(
        'Depois de perder dinheiro em um jogo de apostas online, você volta a jogar para tentar recuperar o dinheiro perdido?',
      );
    });

    it('mantém a escala Likert de 5 pontos da versão brasileira', () => {
      expect(OGDQ_ESCALA.map((e) => e.rotulo)).toEqual([
        'Nunca',
        'Poucas vezes',
        'Com frequência',
        'Com muita frequência',
        'Todos os dias',
      ]);
    });

    it('usa o critério do artigo: nota ≥ 4 em pelo menos 4 itens', () => {
      expect(OGDQ_NOTA_DE_CRITERIO).toBe(4);
      expect(OGDQ_MINIMO_DE_ITENS).toBe(4);

      const tres = avaliarOgdq(comNota(3, 4), 'mais_de_12_meses');
      expect(tres.atingeCriterioDeItens).toBe(false);

      const quatro = avaliarOgdq(comNota(4, 4), 'mais_de_12_meses');
      expect(quatro.atingeCriterioDeItens).toBe(true);
    });

    it('nota 3 conta como indicador, mas não conta para o critério', () => {
      const avaliacao = avaliarOgdq(comNota(6, 3), 'mais_de_12_meses');
      expect(avaliacao.itensComProblema).toHaveLength(6);
      expect(avaliacao.itensNoCriterio).toHaveLength(0);
      expect(avaliacao.atingeCriterioDeItens).toBe(false);
    });

    it('soma o escore bruto na faixa 11–55', () => {
      expect(avaliarOgdq(respostas(), 'recentemente').escoreTotal).toBe(11);
      expect(avaliarOgdq(comNota(11, 5), 'mais_de_12_meses').escoreTotal).toBe(55);
    });
  });

  describe('estratificação por duração (item 12)', () => {
    const casos: Array<[OgdqDuracao, string]> = [
      ['mais_de_12_meses', 'criterio_de_transtorno'],
      ['mais_de_6_meses', 'problema'],
      ['mais_de_1_mes', 'em_risco'],
      ['recentemente', 'em_risco'],
    ];

    it.each(casos)('com critério atingido e duração %s → %s', (duracao, esperado) => {
      expect(avaliarOgdq(comNota(4, 4), duracao).classificacao).toBe(esperado);
    });

    it('sem critério de itens, a duração não promove a classificação', () => {
      // Doze meses de sinais isolados continua sendo sinal isolado — o critério
      // do artigo é sobre itens, e a duração só estratifica quem já o atingiu.
      expect(avaliarOgdq(comNota(3, 4), 'mais_de_12_meses').classificacao).toBe(
        'indicadores_isolados',
      );
    });

    it('nenhum indicador → sem_indicadores', () => {
      expect(avaliarOgdq(respostas(), 'mais_de_12_meses').classificacao).toBe('sem_indicadores');
    });
  });

  describe('resposta da API', () => {
    it('devolve classificação, escore e os itens que pesaram', async () => {
      const resposta = await responder({
        respostas: comNota(4, 4),
        duracao: 'mais_de_12_meses',
      }).expect(200);

      expect(resposta.body.assessment.classificacao).toBe('criterio_de_transtorno');
      expect(resposta.body.assessment.itensNoCriterio).toHaveLength(4);
      expect(resposta.body.assessment.escoreTotal).toBe(4 * 4 + 7);
    });

    it('declara que mede confiabilidade, não acurácia diagnóstica', async () => {
      // Diferença crucial em relação ao NODS-3-BR: este estudo não reporta
      // sensibilidade nem especificidade. Quem consumir a API precisa saber.
      const resposta = await responder({
        respostas: respostas(),
        duracao: 'recentemente',
      }).expect(200);

      expect(resposta.body.instrument.reliability.alfaDeCronbach).toBe(0.92);
      expect(resposta.body.instrument.generalizationWarning).toContain('NÃO reporta sensibilidade');
      expect(resposta.body.instrument.generalizationWarning).toContain('nunca diagnóstico');
      expect(resposta.body.instrument.source).toContain('10.1007/s10899-026-10480-9');
    });

    it('nunca rotula na devolutiva, e oferece caminho concreto', async () => {
      const resposta = await responder({
        respostas: comNota(11, 5),
        duracao: 'mais_de_12_meses',
      }).expect(200);

      const mensagem: string = resposta.body.message;
      expect(mensagem).toContain('não um diagnóstico');
      expect(mensagem).toContain('Autoexclusão');
      expect(mensagem).toContain('188');
      expect(mensagem).not.toMatch(/você (tem|é) (um )?(transtorno|dependente|viciado)/i);
    });

    it('expõe o preâmbulo, que inclui loot boxes no escopo do instrumento', async () => {
      const resposta = await request(harness.app)
        .get('/api/v1/screening/ogdq')
        .set('Authorization', `Bearer ${harness.token}`)
        .expect(200);

      expect(resposta.body.items).toHaveLength(11);
      expect(resposta.body.scale).toHaveLength(5);
      expect(resposta.body.preamble).toContain('loot boxes');
    });
  });

  describe('validação', () => {
    it('exige autenticação', async () => {
      await request(harness.app)
        .post('/api/v1/screening/ogdq')
        .send({ respostas: respostas(), duracao: 'recentemente' })
        .expect(401);
    });

    it('recusa item faltando — mudaria escore e classificação em silêncio', async () => {
      const parcial = respostas();
      delete parcial.prioridade;
      await responder({ respostas: parcial, duracao: 'recentemente' }).expect(400);
    });

    it('recusa nota fora da escala de 1 a 5', async () => {
      for (const foraDaEscala of [0, 6, 3.5]) {
        await responder({
          respostas: { ...respostas(), tolerancia: foraDaEscala },
          duracao: 'recentemente',
        }).expect(400);
      }
    });

    it('exige a duração e recusa valor desconhecido', async () => {
      await responder({ respostas: respostas() }).expect(400);
      await responder({ respostas: respostas(), duracao: 'ontem' }).expect(400);
    });

    it('recusa campos desconhecidos, inclusive classificação pré-calculada', async () => {
      await responder({
        respostas: respostas(),
        duracao: 'recentemente',
        classificacao: 'sem_indicadores',
      }).expect(400);
    });
  });

  describe('limites duros', () => {
    it('audita escore e classificação, nunca as respostas item a item', async () => {
      await responder({ respostas: comNota(4, 4), duracao: 'mais_de_6_meses' }).expect(200);

      const entrada = harness.deps.audit.list().find((e) => e.entityId === 'ogdq-br');
      expect(entrada?.metadata).toEqual({ escore: 23, resultado: 'problema' });
      expect(Object.keys(entrada?.metadata ?? {})).not.toContain('tolerancia');
      expect(harness.deps.audit.verifyChain().valid).toBe(true);
    });
  });
});
