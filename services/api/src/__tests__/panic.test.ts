import request from 'supertest';
import {
  createTestHarness,
  criarContatoVerificado,
  emailDePanico,
  signToken,
  smsDePanico,
  type TestHarness,
} from './helpers';

describe('POST /api/v1/panic', () => {
  let h: TestHarness;

  beforeEach(() => {
    h = createTestHarness();
  });

  it('exige autenticação', async () => {
    const res = await request(h.app).post('/api/v1/panic').send({ triggerType: 'tap' }).expect(401);

    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejeita token de usuário inexistente', async () => {
    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${signToken('99999999-9999-4999-8999-999999999999')}`)
      .send({ triggerType: 'tap' })
      .expect(401);

    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('valida o triggerType', async () => {
    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'longpress' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].campo).toBe('triggerType');
  });

  it('rejeita mensagem acima de 280 caracteres', async () => {
    await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap', message: 'a'.repeat(281) })
      .expect(400);
  });

  it('aciona, registra o evento e enfileira notificações aos contatos verificados', async () => {
    await criarContatoVerificado(h, { channel: 'sms', destination: '+5511999998888' });
    await criarContatoVerificado(h, {
      channel: 'email',
      destination: 'pedro@example.com',
      displayName: 'Pedro',
    });

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({
        message: 'Preciso de ajuda agora',
        location: { lat: -23.55052, lon: -46.633308 },
        triggerType: 'hold',
      })
      .expect(200);

    expect(res.body.eventId).toEqual(expect.any(String));
    expect(res.body.status).toBe('queued');
    expect(res.body.recipients).toHaveLength(2);
    expect(res.body.disclaimer).toContain('não é serviço de emergência');
    expect(res.body.supportChannels).toEqual(
      expect.arrayContaining([expect.objectContaining({ phone: '188' })]),
    );

    await h.drain();

    // O SMS foi enviado pelo provedor, com o texto em PT-BR e sem acentos (GSM-7).
    expect(smsDePanico(h)).toHaveLength(1);
    expect(smsDePanico(h)[0]?.to).toBe('+5511999998888');
    expect(smsDePanico(h)[0]?.body).toContain('Preciso de ajuda agora');

    expect(emailDePanico(h)).toHaveLength(1);
    expect(emailDePanico(h)[0]?.text).toContain('O QUE COSTUMA AJUDAR');

    // Status consolidado do evento após o despacho.
    const detalhe = await request(h.app)
      .get(`/api/v1/panic/${res.body.eventId}`)
      .set('Authorization', `Bearer ${h.token}`)
      .expect(200);

    expect(detalhe.body.status).toBe('delivered');
    expect(detalhe.body.recipients.every((r: { status: string }) => r.status === 'sent')).toBe(
      true,
    );
  });

  it('não notifica contato pendente (double opt-in)', async () => {
    await request(h.app)
      .post('/api/v1/contacts')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ displayName: 'Tia Lia', channel: 'sms', destination: '+5511977776666' })
      .expect(201);

    // O convite de verificação foi enviado, mas o contato ainda não confirmou.

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap' })
      .expect(200);

    await h.drain();

    expect(res.body.recipients).toHaveLength(0);
    expect(res.body.warnings).toContain('NO_VERIFIED_CONTACTS');
    expect(smsDePanico(h)).toHaveLength(0);
  });

  it('sinaliza risco e omite o conteúdo da mensagem no SMS', async () => {
    await criarContatoVerificado(h);

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'hold', message: 'não aguento mais viver assim' })
      .expect(200);

    await h.drain();

    expect(res.body.warnings).toContain('RISK_SIGNAL_DETECTED');
    expect(smsDePanico(h)[0]?.body).not.toContain('aguento mais viver');
    expect(smsDePanico(h)[0]?.body).toContain('ligue 192');
  });

  it('respeita o Idempotency-Key e não duplica o fan-out', async () => {
    await criarContatoVerificado(h);
    const chave = 'idem-123-abc';

    const primeira = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .set('Idempotency-Key', chave)
      .send({ triggerType: 'tap' })
      .expect(200);

    const segunda = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .set('Idempotency-Key', chave)
      .send({ triggerType: 'tap' })
      .expect(200);

    await h.drain();

    expect(segunda.body.eventId).toBe(primeira.body.eventId);
    expect(smsDePanico(h)).toHaveLength(1);
  });

  it('trata Idempotency-Key fora da janela de 60 s como novo acionamento', async () => {
    await criarContatoVerificado(h);
    const chave = 'idem-antiga';

    const primeira = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .set('Idempotency-Key', chave)
      .send({ triggerType: 'tap' })
      .expect(200);

    // Envelhece o evento além da janela, simulando reuso da chave dias depois.
    const antigo = await h.deps.panic.findEventById(primeira.body.eventId);
    await h.deps.panic.updateEvent({
      ...antigo!,
      createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    });

    const segunda = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .set('Idempotency-Key', chave)
      .send({ triggerType: 'tap' })
      .expect(200);

    await h.drain();

    // Precisa ser um acionamento NOVO: devolver o antigo diria "seu apoio foi
    // avisado" sem que ninguém tivesse sido avisado agora.
    expect(segunda.body.eventId).not.toBe(primeira.body.eventId);
    expect(smsDePanico(h)).toHaveLength(2);
  });

  it('aplica limite de 5 acionamentos por hora com Retry-After', async () => {
    for (let i = 0; i < 5; i += 1) {
      await request(h.app)
        .post('/api/v1/panic')
        .set('Authorization', `Bearer ${h.token}`)
        .send({ triggerType: 'tap' })
        .expect(200);
    }

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap' })
      .expect(429);

    expect(res.body.error.code).toBe('RATE_LIMITED');
    expect(res.headers['retry-after']).toBeDefined();
    // Texto acolhedor, não técnico (PANIC_BUTTON_DESIGN.md §4).
    expect(res.body.error.message).toContain('188');
  });

  it('marca o acionamento como resolvido', async () => {
    const criado = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap' })
      .expect(200);

    const res = await request(h.app)
      .post(`/api/v1/panic/${criado.body.eventId}/resolve`)
      .set('Authorization', `Bearer ${h.token}`)
      .expect(200);

    expect(res.body.resolvedAt).toEqual(expect.any(String));
  });

  it('não permite acessar acionamento de outro usuário', async () => {
    const criado = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap' })
      .expect(200);

    // O evento existe, mas pertence a outro dono: respondemos 404 para não
    // confirmar sequer a existência do recurso.
    const res = await request(h.app)
      .get(`/api/v1/panic/${criado.body.eventId}`)
      .set('Authorization', `Bearer ${signToken('22222222-2222-4222-8222-222222222222')}`)
      .expect(404);

    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('não inclui contato de WhatsApp entre os notificados, e sim como envio manual', async () => {
    await request(h.app)
      .post('/api/v1/contacts')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ displayName: 'Pedro', channel: 'whatsapp_deeplink', destination: '+5511911112222' })
      .expect(201);

    const res = await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'tap', message: 'preciso conversar' })
      .expect(200);

    await h.drain();

    // Ninguém foi notificado pelo servidor: o app não pode dizer "avisado".
    expect(res.body.recipients).toHaveLength(0);
    expect(res.body.warnings).toContain('NO_VERIFIED_CONTACTS');
    expect(res.body.manualContacts).toHaveLength(1);
    expect(res.body.manualContacts[0].deepLink).toContain('https://wa.me/5511911112222');
    expect(h.sms.sent).toHaveLength(0);
  });

  it('registra o acionamento no log de auditoria com a cadeia íntegra', async () => {
    await criarContatoVerificado(h);
    await request(h.app)
      .post('/api/v1/panic')
      .set('Authorization', `Bearer ${h.token}`)
      .send({ triggerType: 'hold', message: 'segredo clínico' })
      .expect(200);

    await h.drain();

    const acoes = h.deps.audit.list().map((e) => e.action);
    expect(acoes).toContain('PANIC_TRIGGERED');
    expect(acoes).toContain('PANIC_NOTIFICATION_SENT');
    expect(h.deps.audit.verifyChain().valid).toBe(true);

    // A auditoria não pode conter o conteúdo da mensagem.
    expect(JSON.stringify(h.deps.audit.list())).not.toContain('segredo clínico');
  });
});
