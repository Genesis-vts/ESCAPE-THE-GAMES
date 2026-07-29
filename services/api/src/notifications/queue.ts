import type { AuditLog } from '../audit/auditLog';
import type { ContactChannel } from '../domain/types';
import type { PanicRepository } from '../repositories/inMemory';
import { logger } from '../utils/logger';
import { ProviderSendError, type Providers } from './providers';

/**
 * Fila de notificações in-process com retry e backoff exponencial.
 *
 * MVP: suficiente para uma única instância e volume baixo.
 * v1 (ARCHITECTURE.md ADR-003): trocar por BullMQ sobre Redis mantendo esta
 * interface — os services só chamam `enqueue`.
 *
 * Garantia importante: o evento de pânico já está PERSISTIDO antes de qualquer
 * `enqueue`. Se o processo cair, as notificações pendentes são reconstruídas a
 * partir de `panic_notifications` (job de reconciliação — TODO backlog E4).
 */

export interface NotificationJob {
  notificationId: string;
  panicEventId: string;
  contactId: string;
  channel: ContactChannel;
  destination: string;
  payload:
    | { kind: 'sms'; body: string }
    | { kind: 'email'; subject: string; text: string; html: string }
    | { kind: 'push'; tokens: string[]; title: string; body: string; data: Record<string, string> };
}

export interface NotificationQueue {
  enqueue(jobs: NotificationJob[]): void;
  /** Aguarda o esvaziamento da fila. Usado em testes e no shutdown gracioso. */
  drain(): Promise<void>;
  size(): number;
}

export interface QueueOptions {
  /** Atrasos entre tentativas, em ms. Padrão: 2 s, 8 s, 30 s (design §7). */
  retryDelaysMs?: number[];
}

export class InProcessNotificationQueue implements NotificationQueue {
  private readonly pendentes: NotificationJob[] = [];
  private processando: Promise<void> | null = null;
  private readonly retryDelaysMs: number[];

  constructor(
    private readonly providers: Providers,
    private readonly panicRepo: PanicRepository,
    private readonly audit: AuditLog,
    options: QueueOptions = {},
  ) {
    this.retryDelaysMs = options.retryDelaysMs ?? [2000, 8000, 30000];
  }

  enqueue(jobs: NotificationJob[]): void {
    this.pendentes.push(...jobs);
    this.iniciar();
  }

  size(): number {
    return this.pendentes.length;
  }

  async drain(): Promise<void> {
    while (this.processando) {
      await this.processando;
    }
  }

  private iniciar(): void {
    if (this.processando) return;
    this.processando = this.loop()
      .catch((erro) => {
        logger.error('fila_falhou', {
          erro: erro instanceof Error ? erro.message : 'desconhecido',
        });
      })
      .finally(() => {
        this.processando = null;
        // Jobs enfileirados durante o loop reiniciam o processamento.
        if (this.pendentes.length > 0) this.iniciar();
      });
  }

  private async loop(): Promise<void> {
    while (this.pendentes.length > 0) {
      const job = this.pendentes.shift();
      if (!job) break;
      await this.processarComRetry(job);
    }
  }

  private async processarComRetry(job: NotificationJob): Promise<void> {
    const maxTentativas = this.retryDelaysMs.length;

    for (let tentativa = 1; tentativa <= maxTentativas; tentativa += 1) {
      try {
        const resultado = await this.despachar(job);
        await this.marcar(job, {
          status: 'sent',
          attempts: tentativa,
          providerMessageId: resultado.providerMessageId,
        });
        this.audit.append({
          actorId: 'system',
          actorType: 'system',
          action: 'PANIC_NOTIFICATION_SENT',
          entityType: 'panic_notification',
          entityId: job.notificationId,
          metadata: { channel: job.channel, provider: resultado.provider, attempts: tentativa },
        });
        return;
      } catch (erro) {
        const retryable = erro instanceof ProviderSendError ? erro.retryable : true;
        const detalhe = erro instanceof Error ? erro.message : 'erro desconhecido';
        const ultima = tentativa === maxTentativas || !retryable;

        logger.warn('notificacao_falhou', {
          notificationId: job.notificationId,
          channel: job.channel,
          tentativa,
          retryable,
          ultima,
        });

        if (ultima) {
          await this.marcar(job, { status: 'failed', attempts: tentativa, lastError: detalhe });
          this.audit.append({
            actorId: 'system',
            actorType: 'system',
            action: 'PANIC_NOTIFICATION_FAILED',
            entityType: 'panic_notification',
            entityId: job.notificationId,
            metadata: { channel: job.channel, attempts: tentativa, retryable },
          });
          return;
        }

        // Backoff exponencial com jitter, para não sincronizar retentativas.
        const base = this.retryDelaysMs[tentativa - 1] ?? 1000;
        const jitter = base > 0 ? Math.floor(Math.random() * Math.min(base * 0.2, 1000)) : 0;
        await esperar(base + jitter);
      }
    }
  }

  private async despachar(job: NotificationJob) {
    switch (job.payload.kind) {
      case 'sms':
        return this.providers.sms.send({ to: job.destination, body: job.payload.body });
      case 'email':
        return this.providers.email.send({
          to: job.destination,
          subject: job.payload.subject,
          text: job.payload.text,
          html: job.payload.html,
        });
      case 'push':
        return this.providers.push.send({
          tokens: job.payload.tokens,
          title: job.payload.title,
          body: job.payload.body,
          data: job.payload.data,
        });
    }
  }

  private async marcar(
    job: NotificationJob,
    patch: {
      status: 'sent' | 'failed';
      attempts: number;
      providerMessageId?: string;
      lastError?: string;
    },
  ): Promise<void> {
    const notificacoes = await this.panicRepo.listNotificationsByEvent(job.panicEventId);
    const atual = notificacoes.find((n) => n.id === job.notificationId);
    if (!atual) return;

    await this.panicRepo.updateNotification({
      ...atual,
      status: patch.status,
      attempts: patch.attempts,
      providerMessageId: patch.providerMessageId ?? atual.providerMessageId,
      lastError: patch.lastError ?? null,
      sentAt: patch.status === 'sent' ? new Date().toISOString() : atual.sentAt,
    });

    await this.atualizarStatusDoEvento(job.panicEventId);
  }

  /** Consolida o status do evento a partir do status de cada destinatário. */
  private async atualizarStatusDoEvento(panicEventId: string): Promise<void> {
    const evento = await this.panicRepo.findEventById(panicEventId);
    if (!evento) return;

    const notificacoes = await this.panicRepo.listNotificationsByEvent(panicEventId);
    const pendentes = notificacoes.filter((n) => n.status === 'queued');
    if (pendentes.length > 0) {
      if (evento.status === 'queued') {
        await this.panicRepo.updateEvent({ ...evento, status: 'dispatching' });
      }
      return;
    }

    const enviadas = notificacoes.filter((n) => n.status === 'sent' || n.status === 'delivered');
    const falhas = notificacoes.filter((n) => n.status === 'failed');

    let status: typeof evento.status = 'delivered';
    if (enviadas.length === 0 && falhas.length > 0) status = 'failed';
    else if (falhas.length > 0) status = 'partial';

    await this.panicRepo.updateEvent({ ...evento, status });
  }
}

function esperar(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
