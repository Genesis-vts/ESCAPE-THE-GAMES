import { z } from 'zod';
import type { Container } from '../../container';
import { env } from '../../config/env';
import type { Contact, ContactChannel } from '../../domain/types';
import { AppError } from '../../errors/AppError';
import {
  buildWhatsappDeepLink,
  renderVerificationEmail,
  renderVerificationSms,
} from '../../notifications/templates';
import { logger } from '../../utils/logger';
import {
  maskDestination,
  newId,
  normalizePhone,
  randomNumericCode,
  randomToken,
  safeEqual,
  sha256,
} from '../../utils/crypto';
import type { CreateContactInput, VerifyContactInput } from './contacts.schema';

const MAX_TENTATIVAS_VERIFICACAO = 5;

export interface ContactPublicView {
  id: string;
  displayName: string;
  relationship: string | null;
  channel: ContactChannel;
  destinationMasked: string;
  status: Contact['status'];
  priority: number;
  consentAt: string | null;
  consentVersion: string | null;
  createdAt: string;
  /** Só para o canal whatsapp_deeplink: link que o usuário abre manualmente. */
  whatsappDeepLink?: string;
}

export interface CreateContactResult {
  contact: ContactPublicView;
  verification: {
    verificationToken: string;
    expiresAt: string;
    channel: ContactChannel;
    /** Presente apenas fora de produção, para facilitar o desenvolvimento. */
    devCode?: string;
    /** Instrução quando o canal não permite envio automático pelo servidor. */
    manualDeliveryUrl?: string;
  };
}

/**
 * Regras de cadastro e verificação da rede de apoio.
 *
 * Princípio inegociável (PANIC_BUTTON_DESIGN.md §3.2): contato só entra no
 * fan-out do botão de pânico depois de confirmar o código — double opt-in.
 */
export class ContactsService {
  constructor(private readonly deps: Container) {}

  async create(userId: string, input: CreateContactInput): Promise<CreateContactResult> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    const total = await this.deps.contacts.countByUser(userId);
    if (total >= env.MAX_CONTACTS_PER_USER) {
      throw new AppError(
        'CONFLICT',
        `Limite de ${env.MAX_CONTACTS_PER_USER} contatos por usuário atingido.`,
      );
    }

    const destination = normalizarDestino(input.channel, input.destination);
    const destinationHash = sha256(destination, 'contact-destination');

    // Opt-out é permanente e vale para qualquer usuário (antiabuso).
    if (await this.deps.contacts.isBlocked(destinationHash)) {
      throw new AppError(
        'FORBIDDEN',
        'Este contato pediu para não receber mensagens da plataforma.',
      );
    }

    const jaExiste = (await this.deps.contacts.listByUser(userId)).some(
      (c) => c.destinationHash === destinationHash && c.channel === input.channel,
    );
    if (jaExiste) {
      throw new AppError('CONFLICT', 'Este contato já está cadastrado neste canal.');
    }

    const code = randomNumericCode(6);
    const verificationToken = randomToken();
    const expiresAt = new Date(
      Date.now() + env.CONTACT_VERIFICATION_TTL_MINUTES * 60_000,
    ).toISOString();

    const contact: Contact = {
      id: newId('ct'),
      userId,
      displayName: input.displayName,
      relationship: input.relationship ?? null,
      channel: input.channel,
      destination,
      destinationHash,
      status: 'pending',
      priority: input.priority ?? 5,
      // Código e token só existem em hash — ver SECURITY_AND_COMPLIANCE.md §5.1.
      verificationCodeHash: sha256(code, saltDoContato(destination)),
      verificationTokenHash: sha256(verificationToken, 'contact-token'),
      verificationExpiresAt: expiresAt,
      verificationAttempts: 0,
      consentAt: null,
      consentVersion: null,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    };

    await this.deps.contacts.create(contact);

    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'CONTACT_CREATED',
      entityType: 'contact',
      entityId: contact.id,
      metadata: { channel: contact.channel, priority: contact.priority },
    });

    const manualDeliveryUrl = await this.enviarConvite(contact, user.displayName, code);

    return {
      contact: toPublicView(contact),
      verification: {
        verificationToken,
        expiresAt,
        channel: contact.channel,
        ...(env.isProduction ? {} : { devCode: code }),
        ...(manualDeliveryUrl ? { manualDeliveryUrl } : {}),
      },
    };
  }

  async list(userId: string): Promise<ContactPublicView[]> {
    const contatos = await this.deps.contacts.listByUser(userId);
    return contatos.map(toPublicView);
  }

  async verify(
    userId: string,
    contactId: string,
    input: VerifyContactInput,
  ): Promise<ContactPublicView> {
    const contact = await this.carregarDoUsuario(userId, contactId);

    if (contact.status === 'verified') return toPublicView(contact);
    if (contact.status === 'revoked') {
      throw new AppError('CONFLICT', 'Este contato foi removido e não pode ser verificado.');
    }

    const expirado =
      !contact.verificationExpiresAt || new Date(contact.verificationExpiresAt) < new Date();
    if (expirado) {
      throw AppError.validation('Código expirado. Peça um novo código.');
    }

    if (contact.verificationAttempts >= MAX_TENTATIVAS_VERIFICACAO) {
      throw new AppError('RATE_LIMITED', 'Muitas tentativas. Solicite um novo código.', {
        headers: { 'Retry-After': '900' },
      });
    }

    const tokenOk =
      !!contact.verificationTokenHash &&
      safeEqual(sha256(input.verificationToken, 'contact-token'), contact.verificationTokenHash);
    const codigoOk =
      !!contact.verificationCodeHash &&
      safeEqual(
        sha256(input.code, saltDoContato(contact.destination)),
        contact.verificationCodeHash,
      );

    if (!tokenOk || !codigoOk) {
      await this.deps.contacts.update({
        ...contact,
        verificationAttempts: contact.verificationAttempts + 1,
      });
      this.deps.audit.append({
        actorId: userId,
        actorType: 'user',
        action: 'CONTACT_VERIFY_FAILED',
        entityType: 'contact',
        entityId: contact.id,
        metadata: { attempts: contact.verificationAttempts + 1 },
      });
      throw AppError.validation('Código de verificação inválido.');
    }

    const verificado = await this.deps.contacts.update({
      ...contact,
      status: 'verified',
      consentAt: new Date().toISOString(),
      consentVersion: env.CONSENT_VERSION,
      verificationCodeHash: null,
      verificationTokenHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0,
    });

    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'CONTACT_VERIFIED',
      entityType: 'contact',
      entityId: contact.id,
      metadata: { channel: contact.channel, consentVersion: env.CONSENT_VERSION },
    });

    return toPublicView(verificado);
  }

  async resendCode(
    userId: string,
    contactId: string,
  ): Promise<CreateContactResult['verification']> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized();

    const contact = await this.carregarDoUsuario(userId, contactId);
    if (contact.status !== 'pending') {
      throw new AppError('CONFLICT', 'Só é possível reenviar código para contato pendente.');
    }

    const code = randomNumericCode(6);
    const verificationToken = randomToken();
    const expiresAt = new Date(
      Date.now() + env.CONTACT_VERIFICATION_TTL_MINUTES * 60_000,
    ).toISOString();

    const atualizado = await this.deps.contacts.update({
      ...contact,
      verificationCodeHash: sha256(code, saltDoContato(contact.destination)),
      verificationTokenHash: sha256(verificationToken, 'contact-token'),
      verificationExpiresAt: expiresAt,
      verificationAttempts: 0,
    });

    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'CONTACT_CODE_RESENT',
      entityType: 'contact',
      entityId: contact.id,
      metadata: { channel: contact.channel },
    });

    const manualDeliveryUrl = await this.enviarConvite(atualizado, user.displayName, code);

    return {
      verificationToken,
      expiresAt,
      channel: contact.channel,
      ...(env.isProduction ? {} : { devCode: code }),
      ...(manualDeliveryUrl ? { manualDeliveryUrl } : {}),
    };
  }

  /**
   * Revoga o contato. `origin` distingue remoção pelo usuário do opt-out do
   * próprio contato — no opt-out o destino entra em bloqueio permanente.
   */
  async revoke(
    userId: string,
    contactId: string,
    origin: 'user' | 'sms_reply' | 'email_link' = 'user',
  ): Promise<{ id: string; status: 'revoked' }> {
    const contact = await this.carregarDoUsuario(userId, contactId);

    await this.deps.contacts.update({
      ...contact,
      status: 'revoked',
      revokedAt: new Date().toISOString(),
    });

    if (origin !== 'user') {
      await this.deps.contacts.block(contact.destinationHash);
    }

    this.deps.audit.append({
      actorId: userId,
      actorType: origin === 'user' ? 'user' : 'contact',
      action: 'CONTACT_REVOKED',
      entityType: 'contact',
      entityId: contact.id,
      metadata: { origin, channel: contact.channel },
    });

    return { id: contact.id, status: 'revoked' };
  }

  private async carregarDoUsuario(userId: string, contactId: string): Promise<Contact> {
    const contact = await this.deps.contacts.findById(contactId);
    // Verificação de propriedade: nunca confie apenas no id vindo da URL.
    if (!contact || contact.userId !== userId) throw AppError.notFound('Contato não encontrado.');
    return contact;
  }

  /**
   * Envia o convite de verificação pelo canal do contato.
   *
   * Falha de provedor NÃO derruba o cadastro: o contato fica pendente e o app
   * oferece "reenviar código". Retorna uma URL quando a entrega é manual
   * (WhatsApp, que no MVP é apenas deep link — ver ADR-006).
   */
  private async enviarConvite(
    contact: Contact,
    userDisplayName: string,
    code: string,
  ): Promise<string | undefined> {
    const input = {
      userDisplayName,
      contactDisplayName: contact.displayName,
      code,
      ttlMinutes: env.CONTACT_VERIFICATION_TTL_MINUTES,
      optOutUrl: `${env.WEB_BASE_URL}/opt-out?c=${contact.id}`,
    };

    try {
      switch (contact.channel) {
        case 'sms':
          await this.deps.providers.sms.send({
            to: contact.destination,
            body: renderVerificationSms(input),
          });
          return undefined;
        case 'email': {
          const email = renderVerificationEmail(input);
          await this.deps.providers.email.send({
            to: contact.destination,
            subject: email.subject,
            text: email.text,
            html: email.html,
          });
          return undefined;
        }
        case 'push':
          await this.deps.providers.push.send({
            tokens: [contact.destination],
            title: 'Convite para ser contato de apoio',
            body: `${userDisplayName} indicou você. Código: ${code}`,
            data: { type: 'contact_verification', contactId: contact.id },
          });
          return undefined;
        case 'whatsapp_deeplink':
          // Sem WhatsApp Business API, o servidor não envia nada: devolvemos o
          // deep link para o usuário enviar manualmente. TODO [LEGAL]
          return buildWhatsappDeepLink(contact.destination, renderVerificationSms(input));
      }
    } catch (erro) {
      logger.warn('convite_contato_falhou', {
        contactId: contact.id,
        channel: contact.channel,
        detalhe: erro instanceof Error ? erro.message : 'desconhecido',
      });
      return undefined;
    }
  }
}

/** Salt por destino: impede comparação de códigos entre contatos diferentes. */
function saltDoContato(destination: string): string {
  return `contact-code:${sha256(destination, 'salt')}`;
}

function normalizarDestino(channel: ContactChannel, destination: string): string {
  if (channel === 'email') {
    const resultado = z.string().email().safeParse(destination.toLowerCase());
    if (!resultado.success) throw AppError.validation('E-mail do contato inválido.');
    return resultado.data;
  }

  if (channel === 'sms' || channel === 'whatsapp_deeplink') {
    const e164 = normalizePhone(destination);
    if (!e164) {
      throw AppError.validation('Telefone inválido. Use o formato +55DDNNNNNNNNN ou DDD + número.');
    }
    return e164;
  }

  // push: o destino é o registration token do dispositivo do contato.
  if (destination.length < 10) throw AppError.validation('Token de push inválido.');
  return destination;
}

export function toPublicView(contact: Contact): ContactPublicView {
  const base: ContactPublicView = {
    id: contact.id,
    displayName: contact.displayName,
    relationship: contact.relationship,
    channel: contact.channel,
    destinationMasked: maskDestination(contact.channel, contact.destination),
    status: contact.status,
    priority: contact.priority,
    consentAt: contact.consentAt,
    consentVersion: contact.consentVersion,
    createdAt: contact.createdAt,
  };

  if (contact.channel === 'whatsapp_deeplink') {
    base.whatsappDeepLink = buildWhatsappDeepLink(contact.destination, '');
  }

  return base;
}
