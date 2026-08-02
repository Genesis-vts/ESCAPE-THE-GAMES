import type { Container } from '../../container';
import { env } from '../../config/env';
import type { Contact, PanicEvent, PanicNotification } from '../../domain/types';
import { AppError } from '../../errors/AppError';
import type { NotificationJob } from '../../notifications/queue';
import { ContactsService } from '../contacts/contacts.service';
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
}

/**
 * Contatos que o SERVIDOR não aciona (hoje, WhatsApp): devolvemos o link pronto
 * para o próprio usuário enviar. Ficam separados de `recipients` justamente para
 * o app não poder confundir "avisado" com "você pode avisar".
 */
export interface ManualContactView {
  contactId: string;
  displayName: string;
  channel: Contact['channel'];
  deepLink: string;
}

export interface PanicTriggerResult {
  eventId: string;
  status: PanicEvent['status'];
  createdAt: string;
  recipients: RecipientView[];
  manualContacts: ManualContactView[];
  warnings: string[];
  disclaimer: string;
  /** Canais públicos de apoio, sempre devolvidos ao cliente. */
  supportChannels: { label: string; phone: string }[];
  /**
   * Presente **apenas** quando um sinal de risco à vida foi detectado na
   * mensagem. Ausente no caso normal — o cliente não deve exibir alarme quando
   * não há sinal.
   */
  criticalRiskNotice?: string;
}

/**
 * Janela de idempotência: 60 s, conforme MVP_SPEC.md §5.1.
 *
 * A janela é essencial. Sem ela, uma chave reaproveitada pelo app dias depois
 * devolveria um acionamento antigo já "entregue" — o usuário veria "seu apoio
 * foi avisado" sem que ninguém tivesse sido avisado agora. Falha silenciosa que
 * parece sucesso é o pior modo de falha possível neste produto.
 */
const JANELA_IDEMPOTENCIA_MS = 60_000;

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
  'acabar com isso tudo',
  'me machucar',
  'me ferir',
  'tirar minha vida',
  'nao quero mais viver',
  'não quero mais viver',
  'sumir de vez',
  'desistir de tudo',
];

/**
 * Aviso devolvido ao usuário quando um sinal de risco é detectado.
 *
 * Texto obrigatório e literal: nomeia o limite do produto e entrega dois canais
 * públicos e gratuitos. Coberto por teste — não editar sem revisão clínica.
 */
export const AVISO_DE_RISCO_CRITICO =
  'ATENÇÃO: identificamos na sua mensagem sinais que podem indicar risco à sua ' +
  'vida. Nós não somos um serviço de emergência e não acionamos socorro. ' +
  'Por favor, ligue agora para o CVV (188), gratuito e sigiloso 24 horas, ou ' +
  'para o SAMU (192).';

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
      const existente = await this.deps.panic.findEventByIdempotencyKey(
        userId,
        idempotencyKey,
        JANELA_IDEMPOTENCIA_MS,
      );
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
        status: 'queued',
        attempts: 0,
        providerMessageId: null,
        lastError: null,
        sentAt: null,
        deliveredAt: null,
      };
      await this.deps.panic.createNotification(notificacao);
      notificacoes.push(notificacao);
      jobs.push(this.montarJob(evento, contato, notificacao, user.displayName, user.phone));
    }

    // 4) Enfileiramento assíncrono: a resposta HTTP não espera o provedor.
    if (jobs.length > 0) this.deps.queue.enqueue(jobs);

    const todos = await this.deps.contacts.listByUser(userId);
    const resultado = this.montarResultado(evento, notificacoes, todos);

    if (contatos.length === 0) {
      resultado.warnings.push('NO_VERIFIED_CONTACTS');
    }
    if (riskFlag) {
      // O app usa este aviso para exibir imediatamente os canais de apoio.
      resultado.warnings.push('RISK_SIGNAL_DETECTED');
      // Texto pronto para exibição, para o cliente não ter que compor a
      // mensagem mais delicada do produto a partir de um código de aviso.
      resultado.criticalRiskNotice = AVISO_DE_RISCO_CRITICO;
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
      optOutUrl: ContactsService.buildOptOutUrl(contato.id, env.JWT_SECRET, env.WEB_BASE_URL),
      eventId: evento.id,
      riskFlag: evento.riskFlag,
    };

    const base = {
      // Propaga a criticidade do evento para a fila (ver NotificationJob).
      ...(evento.riskFlag ? { priority: 'critical' as const } : {}),
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

    const recipients: RecipientView[] = notificacoes.map((n) => ({
      contactId: n.contactId,
      displayName: porId.get(n.contactId)?.displayName ?? 'Contato',
      channel: n.channel,
      status: n.status,
    }));

    const manualContacts: ManualContactView[] = contatos
      .filter((c) => c.status === 'manual_only')
      .map((c) => ({
        contactId: c.id,
        displayName: c.displayName,
        channel: c.channel,
        deepLink: buildWhatsappDeepLink(
          c.destination,
          `Preciso de apoio agora. ${evento.message ?? ''}`.trim(),
        ),
      }));

    return {
      eventId: evento.id,
      status: evento.status,
      createdAt: evento.createdAt,
      recipients,
      manualContacts,
      warnings: [],
      disclaimer: DISCLAIMER_LONGO,
      supportChannels: CANAIS_DE_APOIO,
    };
  }
}

function segundosEntre(inicio: string, fim: string): number {
  return Math.max(0, Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 1000));
}
