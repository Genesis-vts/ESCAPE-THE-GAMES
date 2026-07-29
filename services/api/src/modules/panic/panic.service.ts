import type { Container } from '../../container';
import { env } from '../../config/env';
import type { Contact, PanicEvent, PanicNotification } from '../../domain/types';
import { AppError } from '../../errors/AppError';
import type { NotificationJob } from '../../notifications/queue';
import {
  DISCLAIMER_LONGO,
  buildWhatsappDeepLink,
  renderPanicEmail,
  renderPanicPush,
  renderPanicSms,
  type PanicTemplateInput,
} from '../../notifications/templates';
import { newId } from '../../utils/crypto';
import type { PanicRequestInput } from './panic.schema';

export interface RecipientView {
  contactId: string;
  displayName: string;
  channel: Contact['channel'];
  status: PanicNotification['status'];
  /** Presente apenas para whatsapp_deeplink: envio é manual pelo usuário. */
  whatsappDeepLink?: string;
}

export interface PanicTriggerResult {
  eventId: string;
  status: PanicEvent['status'];
  createdAt: string;
  recipients: RecipientView[];
  warnings: string[];
  disclaimer: string;
  /** Canais públicos de apoio, sempre devolvidos ao cliente. */
  supportChannels: { label: string; phone: string }[];
}

const CANAIS_DE_APOIO = [
  { label: 'CVV — apoio emocional 24h', phone: '188' },
  { label: 'SAMU — emergência médica', phone: '192' },
];

/**
 * Termos que sinalizam possível risco de autoagressão.
 *
 * TODO [CLINICAL]: esta lista é um marcador de escopo, NÃO um instrumento
 * validado. Critérios, sensibilidade aceitável e protocolo de escalonamento
 * precisam de definição clínica antes do lançamento (PANIC_BUTTON_DESIGN.md §6).
 */
const TERMOS_DE_RISCO = [
  'me matar',
  'suicid',
  'nao aguento mais viver',
  'não aguento mais viver',
  'acabar com tudo',
  'me machucar',
  'tirar minha vida',
];

export function detectarSinalDeRisco(mensagem: string | null | undefined): boolean {
  if (!mensagem) return false;
  const normalizada = mensagem.toLowerCase();
  return TERMOS_DE_RISCO.some((termo) => normalizada.includes(termo));
}

/**
 * Regras do botão de pânico.
 *
 * Ordem obrigatória (ARCHITECTURE.md §3.1): validar -> PERSISTIR evento ->
 * auditar -> enfileirar -> responder. O envio nunca acontece antes da escrita:
 * um acionamento não pode se perder porque um provedor demorou.
 */
export class PanicService {
  constructor(private readonly deps: Container) {}

  async trigger(
    userId: string,
    input: PanicRequestInput,
    idempotencyKey?: string,
  ): Promise<PanicTriggerResult> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    // Idempotência: reenvio do app (retry de rede) não gera novo fan-out.
    if (idempotencyKey) {
      const existente = await this.deps.panic.findEventByIdempotencyKey(userId, idempotencyKey);
      if (existente) return this.getEvent(userId, existente.id);
    }

    const riskFlag = detectarSinalDeRisco(input.message);

    const evento: PanicEvent = {
      id: newId('pe'),
      userId,
      triggerType: input.triggerType,
      message: input.message ?? null,
      location: input.location ? { lat: input.location.lat, lon: input.location.lon } : null,
      status: 'queued',
      riskFlag,
      idempotencyKey: idempotencyKey ?? null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    // 1) Persistência antes de qualquer envio (write-ahead).
    await this.deps.panic.createEvent(evento);

    // 2) Auditoria WORM. Sem PII: só enums e contadores.
    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'PANIC_TRIGGERED',
      entityType: 'panic_event',
      entityId: evento.id,
      metadata: {
        triggerType: evento.triggerType,
        temMensagem: Boolean(evento.message),
        temLocalizacao: Boolean(evento.location),
        riskFlag,
      },
    });

    // 3) Somente contatos verificados entram no fan-out (double opt-in).
    const contatos = await this.deps.contacts.listVerifiedByUser(userId);

    const notificacoes: PanicNotification[] = [];
    const jobs: NotificationJob[] = [];

    for (const contato of contatos) {
      const notificacao: PanicNotification = {
        id: newId('pn'),
        panicEventId: evento.id,
        contactId: contato.id,
        channel: contato.channel,
        // O canal de WhatsApp não é despachado pelo servidor: fica "skipped"
        // e o app abre o deep link para envio manual (ADR-006).
        status: contato.channel === 'whatsapp_deeplink' ? 'skipped' : 'queued',
        attempts: 0,
        providerMessageId: null,
        lastError: null,
        sentAt: null,
        deliveredAt: null,
      };
      await this.deps.panic.createNotification(notificacao);
      notificacoes.push(notificacao);

      if (notificacao.status === 'queued') {
        jobs.push(this.montarJob(evento, contato, notificacao, user.displayName, user.phone));
      }
    }

    // 4) Enfileiramento assíncrono: a resposta HTTP não espera o provedor.
    if (jobs.length > 0) this.deps.queue.enqueue(jobs);

    const resultado = this.montarResultado(evento, notificacoes, contatos);

    if (contatos.length === 0) {
      resultado.warnings.push('NO_VERIFIED_CONTACTS');
    }
    if (riskFlag) {
      // O app usa este aviso para exibir imediatamente os canais de apoio.
      resultado.warnings.push('RISK_SIGNAL_DETECTED');
    }

    return resultado;
  }

  async getEvent(userId: string, eventId: string): Promise<PanicTriggerResult> {
    const evento = await this.deps.panic.findEventById(eventId);
    if (!evento || evento.userId !== userId) {
      throw AppError.notFound('Acionamento não encontrado.');
    }
    const notificacoes = await this.deps.panic.listNotificationsByEvent(eventId);
    const contatos = await this.deps.contacts.listByUser(userId);
    return this.montarResultado(evento, notificacoes, contatos);
  }

  async resolve(userId: string, eventId: string): Promise<{ eventId: string; resolvedAt: string }> {
    const evento = await this.deps.panic.findEventById(eventId);
    if (!evento || evento.userId !== userId) {
      throw AppError.notFound('Acionamento não encontrado.');
    }

    const resolvedAt = evento.resolvedAt ?? new Date().toISOString();
    await this.deps.panic.updateEvent({ ...evento, resolvedAt });

    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'PANIC_RESOLVED',
      entityType: 'panic_event',
      entityId: evento.id,
      metadata: { duracaoSegundos: segundosEntre(evento.createdAt, resolvedAt) },
    });

    return { eventId: evento.id, resolvedAt };
  }

  private montarJob(
    evento: PanicEvent,
    contato: Contact,
    notificacao: PanicNotification,
    userDisplayName: string,
    userPhone: string,
  ): NotificationJob {
    const templateInput: PanicTemplateInput = {
      userDisplayName,
      userPhone,
      contactDisplayName: contato.displayName,
      timestamp: new Date(evento.createdAt),
      message: evento.message,
      location: evento.location,
      optOutUrl: `${env.WEB_BASE_URL}/opt-out?c=${contato.id}`,
      eventId: evento.id,
      riskFlag: evento.riskFlag,
    };

    const base = {
      notificationId: notificacao.id,
      panicEventId: evento.id,
      contactId: contato.id,
      channel: contato.channel,
      destination: contato.destination,
    };

    if (contato.channel === 'email') {
      const email = renderPanicEmail(templateInput);
      return {
        ...base,
        payload: { kind: 'email', subject: email.subject, text: email.text, html: email.html },
      };
    }

    if (contato.channel === 'push') {
      const push = renderPanicPush(templateInput);
      return {
        ...base,
        payload: {
          kind: 'push',
          tokens: [contato.destination],
          title: push.title,
          body: push.body,
          data: push.data,
        },
      };
    }

    return { ...base, payload: { kind: 'sms', body: renderPanicSms(templateInput) } };
  }

  private montarResultado(
    evento: PanicEvent,
    notificacoes: PanicNotification[],
    contatos: Contact[] = [],
  ): PanicTriggerResult {
    const porId = new Map(contatos.map((c) => [c.id, c]));

    const recipients: RecipientView[] = notificacoes.map((n) => {
      const contato = porId.get(n.contactId);
      const view: RecipientView = {
        contactId: n.contactId,
        displayName: contato?.displayName ?? 'Contato',
        channel: n.channel,
        status: n.status,
      };
      if (contato?.channel === 'whatsapp_deeplink') {
        view.whatsappDeepLink = buildWhatsappDeepLink(
          contato.destination,
          `Preciso de apoio agora. ${evento.message ?? ''}`.trim(),
        );
      }
      return view;
    });

    return {
      eventId: evento.id,
      status: evento.status,
      createdAt: evento.createdAt,
      recipients,
      warnings: [],
      disclaimer: DISCLAIMER_LONGO,
      supportChannels: CANAIS_DE_APOIO,
    };
  }
}

function segundosEntre(inicio: string, fim: string): number {
  return Math.max(0, Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 1000));
}
