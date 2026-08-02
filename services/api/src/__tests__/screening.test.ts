import request from 'supertest';
import { avaliarNods3, NODS3_ITENS, NODS3_PONTO_DE_CORTE } from '../modules/screening/nods3';
import {
  createTestHarness,
  criarContatoVerificado,
  smsDePanico,
  type TestHarness,
} from './helpers';

describe('Rastreio NODS-3-BR', () => {
  let harness: TestHarness;

  beforeEach(() => {
    harness = createTestHarness();
  });

  const responder = (body: Record<string, unknown>) =>
    request(harness.app)
      .post('/api/v1/screening/nods3')
      .set('Authorization', `Bearer ${harness.token}`)
      .send(body);

  describe('fidelidade ao instrumento publicado', () => {
    it('mantém os três itens da fonte, com o número original da NODS', () => {
      // Se este teste quebrar, alguém alterou o instrumento. A acurácia
      // publicada vale para ESTES itens — mudar o enunciado a invalida.
      expect(NODS3_ITENS.map((i) => i.nodsItem)).toEqual([4, 8, 10]);
      expect(NODS3_ITENS.map((i) => i.id)).toEqual(['controle', 'escapismo', 'recuperar']);
      // Os "3 Cs" de Hermano Tavares mapeiam 1:1 nos três itens, nesta ordem.
      expect(NODS3_ITENS.map((i) => i.c)).toEqual(['Controle', 'Confronto', 'Caça']);
      expect(NODS3_ITENS[0]?.pergunta).toBe(
        'Você já tentou parar, reduzir, ou controlar as suas apostas?',
      );
      expect(NODS3_ITENS[1]?.pergunta).toBe(
        'Você já apostou como uma forma de escapar dos seus problemas pessoais?',
      );
    });

    it('usa o ponto de corte da fonte: um item positivo basta', () => {
      expect(NODS3_PONTO_DE_CORTE).toBe(1);

      for (const item of NODS3_ITENS) {
        const respostas = { controle: false, escapismo: false, recuperar: false };
        respostas[item.id] = true;

        const avaliacao = avaliarNods3(respostas);
        expect(avaliacao.resultado).toBe('positivo');
        expect(avaliacao.escore).toBe(1);
      }
    });

    it('só é negativo com os três itens negativos', () => {
      const avaliacao = avaliarNods3({ controle: false, escapismo: false, recuperar: false });
      expect(avaliacao).toEqual({ resultado: 'negativo', escore: 0, itensPositivos: [] });
    });
  });

  describe('resposta da API', () => {
    it('devolve resultado, itens positivos e os caminhos gratuitos de apoio', async () => {
      const resposta = await responder({
        controle: true,
        escapismo: false,
        recuperar: true,
      }).expect(200);

      expect(resposta.body.assessment).toEqual({
        resultado: 'positivo',
        escore: 2,
        itensPositivos: ['controle', 'recuperar'],
      });

      const rotulos = resposta.body.supportPaths.map((c: { label: string }) => c.label).join(' ');
      expect(rotulos).toContain('Autoexclusão');
      expect(rotulos).toContain('Meu SUS Digital');
      expect(resposta.body.supportPaths.some((c: { phone?: string }) => c.phone === '188')).toBe(
        true,
      );
    });

    it('carrega sempre a procedência e o limite de generalização declarado pelos autores', async () => {
      // O aviso não é decoração: o instrumento foi validado em apostadores de
      // loteria, e os autores dizem que a acurácia não generaliza. Quem
      // consumir a API precisa receber isso junto com o resultado.
      const resposta = await responder({
        controle: false,
        escapismo: false,
        recuperar: false,
      }).expect(200);

      expect(resposta.body.instrument.source).toContain('Tovar Velásquez');
      expect(resposta.body.instrument.generalizationWarning).toContain('loteria');
      expect(resposta.body.instrument.generalizationWarning).toContain('nunca como diagnóstico');
      expect(resposta.body.disclaimer).toContain('não é diagnóstico');
    });

    it('nunca afirma diagnóstico na devolutiva positiva, e oferece caminho concreto', async () => {
      const resposta = await responder({
        controle: true,
        escapismo: true,
        recuperar: true,
      }).expect(200);

      const mensagem: string = resposta.body.message;
      expect(mensagem).toContain('não um diagnóstico');
      expect(mensagem).toContain('Autoexclusão');
      expect(mensagem).toContain('188');
      // Rótulo é proibido: "você tem transtorno", "você é dependente".
      expect(mensagem).not.toMatch(/você (tem|é) (um )?(transtorno|dependente|viciado)/i);
    });

    it('expõe os itens para o cliente renderizar sem duplicar o enunciado', async () => {
      const resposta = await request(harness.app)
        .get('/api/v1/screening/nods3')
        .set('Authorization', `Bearer ${harness.token}`)
        .expect(200);

      expect(resposta.body.items).toHaveLength(3);
      expect(resposta.body.cutoff).toBe(1);
      expect(resposta.body.warning).toContain('loteria');
    });
  });

  describe('validação e autenticação', () => {
    it('exige autenticação', async () => {
      await request(harness.app)
        .post('/api/v1/screening/nods3')
        .send({ controle: true, escapismo: false, recuperar: false })
        .expect(401);
    });

    it('recusa envio incompleto — item faltando mudaria o resultado em silêncio', async () => {
      await responder({ controle: true, escapismo: false }).expect(400);
    });

    it('recusa campos desconhecidos, inclusive um resultado pré-calculado', async () => {
      await responder({
        controle: false,
        escapismo: false,
        recuperar: false,
        resultado: 'negativo',
      }).expect(400);
    });
  });

  describe('limites duros', () => {
    it('rastreio positivo NÃO aciona contato de apoio', async () => {
      // Um rastreio é informação para a própria pessoa. Transformá-lo em
      // gatilho de notificação delataria sofrimento sem consentimento.
      await criarContatoVerificado(harness);

      await responder({ controle: true, escapismo: true, recuperar: true }).expect(200);
      await harness.drain();

      expect(smsDePanico(harness)).toHaveLength(0);
      expect(harness.push.sent).toHaveLength(0);
    });

    it('audita o escore, mas nunca as respostas item a item', async () => {
      await responder({ controle: true, escapismo: false, recuperar: false }).expect(200);

      const entrada = harness.deps.audit.list().find((e) => e.action === 'SCREENING_COMPLETED');
      expect(entrada).toBeDefined();
      expect(entrada?.metadata).toEqual({ escore: 1, resultado: 'positivo' });
      expect(Object.keys(entrada?.metadata ?? {})).not.toContain('controle');
      expect(harness.deps.audit.verifyChain().valid).toBe(true);
    });
  });
});
