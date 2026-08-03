import request from 'supertest';
import { createTestHarness, signToken, type TestHarness } from './helpers';

describe('POST /api/v1/contacts', () => {
  let h: TestHarness;

  beforeEach(() => {
    h = createTestHarness();
  });

  const auth = () => ({ Authorization: `Bearer ${h.token}` });

  it('exige autenticação', async () => {
    await request(h.app)
      .post('/api/v1/contacts')
      .send({ displayName: 'Cláudia', channel: 'sms', destination: '+5511999998888' })
      .expect(401);
  });

  it('cria contato pendente, mascara o destino e envia o convite por SMS', async () => {
    const res = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({
        displayName: 'Cláudia',
        relationship: 'mãe',
        channel: 'sms',
        destination: '11999998888',
        priority: 1,
      })
      .expect(201);

    expect(res.body.contact.status).toBe('pending');
    // O destino completo NUNCA volta na resposta.
    expect(res.body.contact.destinationMasked).toContain('*');
    expect(JSON.stringify(res.body.contact)).not.toContain('11999998888');
    expect(res.body.verification.verificationToken).toEqual(expect.any(String));
    expect(res.body.verification.devCode).toMatch(/^\d{6}$/);

    // Convite enviado ao contato, com número normalizado para E.164.
    expect(h.sms.sent).toHaveLength(1);
    expect(h.sms.sent[0]?.to).toBe('+5511999998888');
    expect(h.sms.sent[0]?.body).toContain('Codigo de confirmacao');
  });

  it('recusa canal e destino inválidos', async () => {
    await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({ displayName: 'X', channel: 'telegrama', destination: '+5511999998888' })
      .expect(400);

    const res = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({ displayName: 'X', channel: 'email', destination: 'nao-e-email' })
      .expect(400);

    expect(res.body.error.message).toContain('E-mail');
  });

  it('recusa campos desconhecidos no payload', async () => {
    await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({
        displayName: 'Cláudia',
        channel: 'sms',
        destination: '+5511999998888',
        isAdmin: true,
      })
      .expect(400);
  });

  it('recusa contato duplicado no mesmo canal', async () => {
    const payload = { displayName: 'Cláudia', channel: 'sms', destination: '+5511999998888' };
    await request(h.app).post('/api/v1/contacts').set(auth()).send(payload).expect(201);
    const res = await request(h.app).post('/api/v1/contacts').set(auth()).send(payload).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('devolve deep link do WhatsApp sem enviar mensagem pelo servidor', async () => {
    const res = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({
        displayName: 'Pedro',
        channel: 'whatsapp_deeplink',
        destination: '+5511911112222',
      })
      .expect(201);

    expect(res.body.verification.manualDeliveryUrl).toContain('https://wa.me/5511911112222');
    // Nenhum SMS/e-mail parte do servidor nesse canal (ADR-006).
    expect(h.sms.sent).toHaveLength(0);
    expect(h.email.sent).toHaveLength(0);

    // O canal não passa por verificação: emitir um código que voltasse ao próprio
    // usuário permitiria a ele "consentir" no lugar do contato.
    expect(res.body.contact.status).toBe('manual_only');
    expect(res.body.verification.required).toBe(false);
    expect(res.body.verification.devCode).toBeUndefined();
    expect(res.body.verification.verificationToken).toBeUndefined();
  });

  it('recusa verificar um contato de canal manual', async () => {
    const criado = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({ displayName: 'Pedro', channel: 'whatsapp_deeplink', destination: '+5511911112222' })
      .expect(201);

    const res = await request(h.app)
      .post(`/api/v1/contacts/${criado.body.contact.id}/verify`)
      .set(auth())
      .send({ verificationToken: 'x'.repeat(20), code: '123456' })
      .expect(409);

    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('POST /api/v1/contacts/:id/verify', () => {
  let h: TestHarness;

  beforeEach(() => {
    h = createTestHarness();
  });

  const auth = () => ({ Authorization: `Bearer ${h.token}` });

  async function criarPendente() {
    const res = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth())
      .send({ displayName: 'Cláudia', channel: 'sms', destination: '+5511999998888' })
      .expect(201);
    return res.body as {
      contact: { id: string };
      verification: { verificationToken: string; devCode: string };
    };
  }

  it('verifica o contato com o código correto e grava o consentimento', async () => {
    const { contact, verification } = await criarPendente();

    const res = await request(h.app)
      .post(`/api/v1/contacts/${contact.id}/verify`)
      .set(auth())
      .send({ verificationToken: verification.verificationToken, code: verification.devCode })
      .expect(200);

    expect(res.body.contact.status).toBe('verified');
    expect(res.body.contact.consentAt).toEqual(expect.any(String));
    expect(res.body.contact.consentVersion).toBe('v1');

    const acoes = h.deps.audit.list().map((e) => e.action);
    expect(acoes).toContain('CONTACT_CREATED');
    expect(acoes).toContain('CONTACT_VERIFIED');
  });

  it('recusa código incorreto e mantém o contato pendente', async () => {
    const { contact, verification } = await criarPendente();

    const res = await request(h.app)
      .post(`/api/v1/contacts/${contact.id}/verify`)
      .set(auth())
      .send({ verificationToken: verification.verificationToken, code: '000000' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');

    const lista = await request(h.app).get('/api/v1/contacts').set(auth()).expect(200);
    expect(lista.body.contacts[0].status).toBe('pending');
  });

  it('recusa código com formato inválido', async () => {
    const { contact, verification } = await criarPendente();

    await request(h.app)
      .post(`/api/v1/contacts/${contact.id}/verify`)
      .set(auth())
      .send({ verificationToken: verification.verificationToken, code: 'abc' })
      .expect(400);
  });

  it('bloqueia após 5 tentativas erradas', async () => {
    const { contact, verification } = await criarPendente();

    for (let i = 0; i < 5; i += 1) {
      await request(h.app)
        .post(`/api/v1/contacts/${contact.id}/verify`)
        .set(auth())
        .send({ verificationToken: verification.verificationToken, code: '000000' })
        .expect(400);
    }

    const res = await request(h.app)
      .post(`/api/v1/contacts/${contact.id}/verify`)
      .set(auth())
      .send({ verificationToken: verification.verificationToken, code: verification.devCode })
      .expect(429);

    expect(res.body.error.code).toBe('RATE_LIMITED');
  });

  it('não permite verificar contato de outro usuário', async () => {
    const { contact, verification } = await criarPendente();
    const tokenDeOutro = signToken('33333333-3333-4333-8333-333333333333');

    // Mesmo com o token de verificação correto, o contato pertence a outro dono.
    const res = await request(h.app)
      .post(`/api/v1/contacts/${contact.id}/verify`)
      .set({ Authorization: `Bearer ${tokenDeOutro}` })
      .send({ verificationToken: verification.verificationToken, code: verification.devCode })
      .expect(404);

    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/v1/contacts/:id', () => {
  it('revoga o contato e ele deixa de aparecer na lista', async () => {
    const h = createTestHarness();
    const auth = { Authorization: `Bearer ${h.token}` };

    const criado = await request(h.app)
      .post('/api/v1/contacts')
      .set(auth)
      .send({ displayName: 'Cláudia', channel: 'sms', destination: '+5511999998888' })
      .expect(201);

    await request(h.app).delete(`/api/v1/contacts/${criado.body.contact.id}`).set(auth).expect(200);

    const lista = await request(h.app).get('/api/v1/contacts').set(auth).expect(200);
    expect(lista.body.contacts).toHaveLength(0);

    const acoes = h.deps.audit.list().map((e) => e.action);
    expect(acoes).toContain('CONTACT_REVOKED');
  });
});
