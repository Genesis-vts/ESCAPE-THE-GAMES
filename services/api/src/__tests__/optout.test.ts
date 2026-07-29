import { createHmac } from 'node:crypto';
import request from 'supertest';
import { env } from '../config/env';
import { buildOptOutToken, validateTwilioSignature } from '../utils/crypto';
import {
  createTestHarness,
  criarContatoVerificado,
  smsDePanico,
  type TestHarness,
} from './helpers';

describe('Descadastro do contato de apoio', () => {
  let h: TestHarness;

  beforeEach(() => {
    h = createTestHarness();
  });

  const auth = () => ({ Authorization: `Bearer ${h.token}` });

  it('inclui um link de descadastro assinado em toda mensagem enviada ao contato', async () => {
    await criarContatoVerificado(h, { channel: 'email', destination: 'claudia@example.com' });

    await request(h.app).post('/api/v1/panic').set(auth()).send({ triggerType: 'tap' }).expect(200);

    await h.drain();

    const email = h.email.sent.find((m) => m.subject.includes('pediu apoio agora'));
    // A promessa de saída não pode ser decorativa: precisa vir com token válido.
    expect(email?.text).toMatch(/\/opt-out\?c=ct_[\w-]+&t=[\w-]{32}/);
  });

  it('revoga o contato pelo link do e-mail, sem exigir login', async () => {
    const contactId = await criarContatoVerificado(h, {
      channel: 'email',
      destination: 'claudia@example.com',
    });
    const token = buildOptOutToken(contactId, env.JWT_SECRET);

    // Sem cabeçalho Authorization: quem nunca pediu contato não deve precisar de conta.
    const res = await request(h.app)
      .get('/api/v1/opt-out')
      .query({ c: contactId, t: token })
      .expect(200);

    expect(res.body.status).toBe('revoked');

    const lista = await request(h.app).get('/api/v1/contacts').set(auth()).expect(200);
    expect(lista.body.contacts).toHaveLength(0);

    const acoes = h.deps.audit.list().map((e) => e.action);
    expect(acoes).toContain('CONTACT_REVOKED');
  });

  it('recusa link com token inválido sem revelar se o contato existe', async () => {
    const contactId = await criarContatoVerificado(h);

    const res = await request(h.app)
      .get('/api/v1/opt-out')
      .query({ c: contactId, t: 'x'.repeat(32) })
      .expect(404);

    expect(res.body.error.code).toBe('NOT_FOUND');

    // Contato inexistente responde exatamente igual.
    const res2 = await request(h.app)
      .get('/api/v1/opt-out')
      .query({ c: 'ct_inexistente', t: 'x'.repeat(32) })
      .expect(404);

    expect(res2.body.error.message).toBe(res.body.error.message);
  });

  it('após o opt-out o contato não recebe mais acionamentos', async () => {
    const contactId = await criarContatoVerificado(h);
    const token = buildOptOutToken(contactId, env.JWT_SECRET);

    await request(h.app).get('/api/v1/opt-out').query({ c: contactId, t: token }).expect(200);

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set(auth())
      .send({ triggerType: 'hold' })
      .expect(200);

    await h.drain();

    expect(res.body.recipients).toHaveLength(0);
    expect(res.body.warnings).toContain('NO_VERIFIED_CONTACTS');
    expect(smsDePanico(h)).toHaveLength(0);
  });

  it('o bloqueio é permanente: novo cadastro do mesmo destino é recusado', async () => {
    const contactId = await criarContatoVerificado(h, { destination: '+5511999998888' });
    const token = buildOptOutToken(contactId, env.JWT_SECRET);

    await request(h.app).get('/api/v1/opt-out').query({ c: contactId, t: token }).expect(200);

    const res = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({ displayName: 'Cláudia', channel: 'sms', destination: '+5511999998888' })
      .expect(403);

    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Webhook de SMS entrante (resposta SAIR)', () => {
  let h: TestHarness;

  beforeEach(() => {
    h = createTestHarness();
  });

  it('revoga o contato quando o destinatário responde SAIR', async () => {
    await criarContatoVerificado(h, { destination: '+5511999998888' });

    await request(h.app)
      .post('/api/v1/webhooks/sms/inbound')
      .type('form')
      .send({ From: '+5511999998888', Body: 'SAIR' })
      .expect(200);

    const lista = await request(h.app)
      .get('/api/v1/contacts')
      .set({ Authorization: `Bearer ${h.token}` })
      .expect(200);

    expect(lista.body.contacts).toHaveLength(0);
  });

  it.each(['sair', 'PARAR', 'Stop', 'cancelar', 'sair.'])(
    'aceita a variação "%s" como pedido de saída',
    async (corpo) => {
      const local = createTestHarness();
      await criarContatoVerificado(local, { destination: '+5511977776666' });

      await request(local.app)
        .post('/api/v1/webhooks/sms/inbound')
        .type('form')
        .send({ From: '+5511977776666', Body: corpo })
        .expect(200);

      const lista = await request(local.app)
        .get('/api/v1/contacts')
        .set({ Authorization: `Bearer ${local.token}` })
        .expect(200);

      expect(lista.body.contacts).toHaveLength(0);
    },
  );

  it('ignora mensagem que não é pedido de saída', async () => {
    await criarContatoVerificado(h, { destination: '+5511999998888' });

    await request(h.app)
      .post('/api/v1/webhooks/sms/inbound')
      .type('form')
      .send({ From: '+5511999998888', Body: 'obrigada, já falei com ele' })
      .expect(200);

    const lista = await request(h.app)
      .get('/api/v1/contacts')
      .set({ Authorization: `Bearer ${h.token}` })
      .expect(200);

    expect(lista.body.contacts).toHaveLength(1);
    expect(lista.body.contacts[0].status).toBe('verified');
  });

  it('rejeita webhook com assinatura inválida quando o auth token está configurado', async () => {
    process.env.TWILIO_AUTH_TOKEN = 'token-ficticio-de-teste';
    // `env` é lido no boot; recarregamos os módulos para a nova configuração valer.
    jest.resetModules();
    const { createApp } = await import('../app');
    const { createContainer } = await import('../container');
    const app = createApp(createContainer());

    try {
      const res = await request(app)
        .post('/api/v1/webhooks/sms/inbound')
        .type('form')
        .set('X-Twilio-Signature', 'assinatura-forjada')
        .send({ From: '+5511999998888', Body: 'SAIR' })
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    } finally {
      delete process.env.TWILIO_AUTH_TOKEN;
      jest.resetModules();
    }
  });
});

describe('validateTwilioSignature', () => {
  const url = 'https://api.example.com/api/v1/webhooks/sms/inbound';
  const authToken = 'token-ficticio-de-teste';
  const params = { From: '+5511999998888', Body: 'SAIR', MessageSid: 'SM123' };

  /**
   * Implementação de referência do algoritmo documentado pela Twilio, escrita
   * aqui de forma independente: URL completa + cada par chave/valor ordenado por
   * chave, HMAC-SHA1 com o auth token, em base64.
   *
   * Não usamos um vetor "oficial" fixo porque não temos como verificá-lo neste
   * ambiente — e um vetor errado daria falsa confiança. As propriedades abaixo
   * (assinatura válida aceita, qualquer adulteração rejeitada) são o que importa.
   */
  function assinar(u: string, p: Record<string, string>, segredo: string): string {
    const payload = Object.keys(p)
      .sort()
      .reduce((acc, k) => acc + k + p[k], u);
    return createHmac('sha1', segredo).update(payload, 'utf8').digest('base64');
  }

  it('aceita assinatura correta, independente da ordem dos campos no corpo', () => {
    const assinatura = assinar(url, params, authToken);
    expect(validateTwilioSignature(url, params, assinatura, authToken)).toBe(true);

    const outraOrdem = { MessageSid: 'SM123', Body: 'SAIR', From: '+5511999998888' };
    expect(validateTwilioSignature(url, outraOrdem, assinatura, authToken)).toBe(true);
  });

  it('rejeita adulteração de qualquer parte da requisição', () => {
    const assinatura = assinar(url, params, authToken);

    // Corpo alterado — o caso que importa: forjar um "SAIR" de outro número.
    expect(
      validateTwilioSignature(url, { ...params, From: '+5511900000000' }, assinatura, authToken),
    ).toBe(false);
    // URL alterada (replay em outra rota).
    expect(validateTwilioSignature(`${url}/outra`, params, assinatura, authToken)).toBe(false);
    // Segredo diferente.
    expect(validateTwilioSignature(url, params, assinatura, 'outro-segredo')).toBe(false);
    // Assinatura vazia ou lixo.
    expect(validateTwilioSignature(url, params, '', authToken)).toBe(false);
    expect(validateTwilioSignature(url, params, 'lixo', authToken)).toBe(false);
  });
});
