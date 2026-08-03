import { AuditLog } from '../audit/auditLog';
import { InProcessNotificationQueue, type NotificationJob } from '../notifications/queue';
import {
  ConsoleEmailProvider,
  ConsolePushProvider,
  ProviderSendError,
  type ProviderResult,
  type SmsProvider,
} from '../notifications/providers';
import { InMemoryPanicRepository } from '../repositories/inMemory';
import type { PanicEvent, PanicNotification } from '../domain/types';

/** SMS que falha as N primeiras vezes — usado para exercitar o retry. */
class SmsInstavel implements SmsProvider {
  readonly name = 'sms-instavel';
  tentativas = 0;

  constructor(
    private readonly falhasAte: number,
    private readonly retryable = true,
  ) {}

  async send(): Promise<ProviderResult> {
    this.tentativas += 1;
    if (this.tentativas <= this.falhasAte) {
      throw new ProviderSendError('falha simulada', this.name, this.retryable);
    }
    return { providerMessageId: 'ok', provider: this.name };
  }
}

async function montar(sms: SmsProvider) {
  const repo = new InMemoryPanicRepository();
  const audit = new AuditLog();
  const queue = new InProcessNotificationQueue(
    { sms, email: new ConsoleEmailProvider(), push: new ConsolePushProvider() },
    repo,
    audit,
    { retryDelaysMs: [0, 0, 0] },
  );

  const evento: PanicEvent = {
    id: 'pe_1',
    userId: 'u1',
    triggerType: 'hold',
    message: null,
    location: null,
    status: 'queued',
    riskFlag: false,
    idempotencyKey: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  await repo.createEvent(evento);

  const notificacao: PanicNotification = {
    id: 'pn_1',
    panicEventId: 'pe_1',
    contactId: 'ct_1',
    channel: 'sms',
    status: 'queued',
    attempts: 0,
    providerMessageId: null,
    lastError: null,
    sentAt: null,
    deliveredAt: null,
  };
  await repo.createNotification(notificacao);

  const job: NotificationJob = {
    notificationId: 'pn_1',
    panicEventId: 'pe_1',
    contactId: 'ct_1',
    channel: 'sms',
    destination: '+5511999998888',
    payload: { kind: 'sms', body: 'teste' },
  };

  return { repo, audit, queue, job };
}

describe('InProcessNotificationQueue', () => {
  it('entrega na primeira tentativa e consolida o evento como delivered', async () => {
    const sms = new SmsInstavel(0);
    const { repo, queue, job, audit } = await montar(sms);

    queue.enqueue([job]);
    await queue.drain();

    const [notificacao] = await repo.listNotificationsByEvent('pe_1');
    expect(notificacao?.status).toBe('sent');
    expect(notificacao?.attempts).toBe(1);
    expect(notificacao?.sentAt).toEqual(expect.any(String));
    expect((await repo.findEventById('pe_1'))?.status).toBe('delivered');
    expect(audit.list().map((e) => e.action)).toContain('PANIC_NOTIFICATION_SENT');
  });

  it('retenta falha transitória e entrega na terceira tentativa', async () => {
    const sms = new SmsInstavel(2);
    const { repo, queue, job } = await montar(sms);

    queue.enqueue([job]);
    await queue.drain();

    expect(sms.tentativas).toBe(3);
    const [notificacao] = await repo.listNotificationsByEvent('pe_1');
    expect(notificacao?.status).toBe('sent');
    expect(notificacao?.attempts).toBe(3);
  });

  it('desiste após esgotar as tentativas e marca o evento como failed', async () => {
    const sms = new SmsInstavel(99);
    const { repo, queue, job, audit } = await montar(sms);

    queue.enqueue([job]);
    await queue.drain();

    expect(sms.tentativas).toBe(3);
    const [notificacao] = await repo.listNotificationsByEvent('pe_1');
    expect(notificacao?.status).toBe('failed');
    expect(notificacao?.lastError).toContain('falha simulada');
    expect((await repo.findEventById('pe_1'))?.status).toBe('failed');
    expect(audit.list().map((e) => e.action)).toContain('PANIC_NOTIFICATION_FAILED');
  });

  it('não retenta erro permanente do provedor (ex.: número inválido)', async () => {
    const sms = new SmsInstavel(99, false);
    const { repo, queue, job } = await montar(sms);

    queue.enqueue([job]);
    await queue.drain();

    // Uma única tentativa: retentar um 4xx só gasta dinheiro e atrasa o fallback.
    expect(sms.tentativas).toBe(1);
    expect((await repo.listNotificationsByEvent('pe_1'))[0]?.status).toBe('failed');
  });

  it('reporta a profundidade da fila e esvazia ao final', async () => {
    const sms = new SmsInstavel(0);
    const { queue, job } = await montar(sms);

    queue.enqueue([job, { ...job, notificationId: 'pn_2' }]);
    expect(queue.size()).toBeGreaterThan(0);

    await queue.drain();
    expect(queue.size()).toBe(0);
  });
});

describe('AuditLog', () => {
  it('detecta adulteração na cadeia de hashes', () => {
    const audit = new AuditLog();
    audit.append({
      actorId: 'u1',
      actorType: 'user',
      action: 'PANIC_TRIGGERED',
      entityType: 'panic_event',
      entityId: 'pe_1',
      metadata: { triggerType: 'hold' },
    });
    audit.append({
      actorId: 'u1',
      actorType: 'user',
      action: 'PANIC_RESOLVED',
      entityType: 'panic_event',
      entityId: 'pe_1',
      metadata: { duracaoSegundos: 30 },
    });

    expect(audit.verifyChain().valid).toBe(true);

    // Simula alteração indevida de um registro já gravado.
    const registros = audit.list() as unknown as { metadata: Record<string, unknown> }[];
    registros[0]!.metadata.triggerType = 'tap';

    const resultado = audit.verifyChain();
    expect(resultado.valid).toBe(false);
    expect(resultado.brokenAtSeq).toBe(1);
  });

  it('filtra registros por entidade', () => {
    const audit = new AuditLog();
    audit.append({
      actorId: 'u1',
      actorType: 'user',
      action: 'CONTACT_CREATED',
      entityType: 'contact',
      entityId: 'ct_1',
      metadata: {},
    });
    expect(audit.findByEntity('ct_1')).toHaveLength(1);
    expect(audit.findByEntity('ct_2')).toHaveLength(0);
  });
});
