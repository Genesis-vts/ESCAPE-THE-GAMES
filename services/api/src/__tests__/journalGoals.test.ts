import request from 'supertest';
import {
  createTestHarness,
  criarContatoVerificado,
  smsDePanico,
  type TestHarness,
} from './helpers';

describe('Diário de gatilhos e metas', () => {
  let harness: TestHarness;

  beforeEach(() => {
    harness = createTestHarness();
  });

  const auth = () => ({ Authorization: `Bearer ${harness.token}` });

  describe('POST /journal', () => {
    it('registra um gatilho de exposição a loot box', async () => {
      const resposta = await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'loot_box_exposure', intensity: 7, notes: 'abri caixa no FIFA' })
        .expect(201);

      expect(resposta.body.entry.triggerType).toBe('loot_box_exposure');
      expect(resposta.body.entry.intensity).toBe(7);
    });

    it('recusa triggerType fora do enum', async () => {
      await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'tedio' })
        .expect(400);
    });

    it('recusa intensidade fora de 1–10 e campos desconhecidos', async () => {
      await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'craving', intensity: 11 })
        .expect(400);

      await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'craving', userId: 'outro-usuario' })
        .expect(400);
    });

    it('exige autenticação', async () => {
      await request(harness.app)
        .post('/api/v1/journal')
        .send({ triggerType: 'craving' })
        .expect(401);
    });

    it('audita o registro sem o tipo de gatilho nem as notas', async () => {
      // O tipo de gatilho é dado de saúde. A auditoria prova que houve
      // registro; o conteúdo fica só no repositório.
      await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'ads_exposure', notes: 'anúncio no meio do jogo' })
        .expect(201);

      const entrada = harness.deps.audit.list().find((e) => e.action === 'JOURNAL_ENTRY_CREATED');
      expect(entrada).toBeDefined();
      expect(entrada?.metadata).toEqual({ hasNotes: true });
      expect(JSON.stringify(entrada)).not.toContain('ads_exposure');
      expect(JSON.stringify(entrada)).not.toContain('anúncio');
    });

    it('registrar gatilho NÃO aciona contato de apoio', async () => {
      await criarContatoVerificado(harness);
      await request(harness.app)
        .post('/api/v1/journal')
        .set(auth())
        .send({ triggerType: 'craving', intensity: 10 })
        .expect(201);
      await harness.drain();

      expect(smsDePanico(harness)).toHaveLength(0);
    });
  });

  describe('GET /journal', () => {
    it('lista com paginação, do mais recente para o mais antigo', async () => {
      for (const tipo of ['craving', 'anxiety', 'social_pressure']) {
        await request(harness.app)
          .post('/api/v1/journal')
          .set(auth())
          .send({ triggerType: tipo })
          .expect(201);
      }

      const pagina = await request(harness.app)
        .get('/api/v1/journal?limit=2&offset=0')
        .set(auth())
        .expect(200);

      expect(pagina.body.total).toBe(3);
      expect(pagina.body.entries).toHaveLength(2);
      expect(pagina.body.limit).toBe(2);
    });
  });

  describe('Metas — progresso linear', () => {
    const diasAtras = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

    it('calcula a sequência atual a partir da data de início', async () => {
      await request(harness.app)
        .post('/api/v1/goals')
        .set(auth())
        .send({ targetDaysFree: 90, startedAt: diasAtras(12) })
        .expect(201);

      const progresso = await request(harness.app)
        .get('/api/v1/goals/progress')
        .set(auth())
        .expect(200);

      expect(progresso.body.currentStreakDays).toBe(12);
      expect(progresso.body.targetDays).toBe(90);
    });

    it('não devolve pontos, níveis nem conquistas', async () => {
      await request(harness.app)
        .post('/api/v1/goals')
        .set(auth())
        .send({ targetDaysFree: 30 })
        .expect(201);

      const progresso = await request(harness.app)
        .get('/api/v1/goals/progress')
        .set(auth())
        .expect(200);

      expect(Object.keys(progresso.body).sort()).toEqual([
        'currentStreakDays',
        'currentStreakStartedAt',
        'longestStreakDays',
        'targetDays',
      ]);
    });

    it('recaída declarada zera a sequência atual e PRESERVA a melhor', async () => {
      await request(harness.app)
        .post('/api/v1/goals')
        .set(auth())
        .send({ targetDaysFree: 90, startedAt: diasAtras(40) })
        .expect(201);

      const depois = await request(harness.app)
        .post('/api/v1/goals/lapse')
        .set(auth())
        .send({})
        .expect(200);

      expect(depois.body.currentStreakDays).toBe(0);
      // O histórico não é apagado por um dia ruim.
      expect(depois.body.longestStreakDays).toBe(40);
    });

    it('acionar o botão de pânico NÃO zera a sequência', async () => {
      // Pedir ajuda é o comportamento que o produto quer incentivar. Se
      // zerasse o progresso, o produto puniria exatamente o que ensina.
      await criarContatoVerificado(harness);
      await request(harness.app)
        .post('/api/v1/goals')
        .set(auth())
        .send({ targetDaysFree: 90, startedAt: diasAtras(15) })
        .expect(201);

      await request(harness.app)
        .post('/api/v1/panic')
        .set(auth())
        .send({ message: 'quase recaí hoje', triggerType: 'hold' })
        .expect(200);
      await harness.drain();

      const progresso = await request(harness.app)
        .get('/api/v1/goals/progress')
        .set(auth())
        .expect(200);

      expect(progresso.body.currentStreakDays).toBe(15);
    });

    it('recusa data no futuro', async () => {
      await request(harness.app)
        .post('/api/v1/goals')
        .set(auth())
        .send({ targetDaysFree: 30, startedAt: new Date(Date.now() + 86400000).toISOString() })
        .expect(400);
    });

    it('404 quando não há meta definida', async () => {
      await request(harness.app).get('/api/v1/goals/progress').set(auth()).expect(404);
    });
  });
});
