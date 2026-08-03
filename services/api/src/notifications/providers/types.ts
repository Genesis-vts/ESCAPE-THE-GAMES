/**
 * Contratos dos provedores de notificação.
 *
 * Nenhum service conhece SDK de fornecedor: tudo passa por estas interfaces.
 * Isso permite (a) testar com dublês, (b) trocar de fornecedor sem tocar em
 * regra de negócio, (c) rodar localmente sem credenciais. Ver ARCHITECTURE.md ADR-007.
 */

export interface ProviderResult {
  /** Identificador da mensagem no provedor — usado para reconciliar entrega. */
  providerMessageId: string;
  provider: string;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface PushMessage {
  tokens: string[];
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface SmsProvider {
  readonly name: string;
  send(message: SmsMessage): Promise<ProviderResult>;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<ProviderResult>;
}

export interface PushProvider {
  readonly name: string;
  send(message: PushMessage): Promise<ProviderResult>;
}

export interface Providers {
  sms: SmsProvider;
  email: EmailProvider;
  push: PushProvider;
}

/** Erro de provedor: `retryable` decide se a fila tenta de novo. */
export class ProviderSendError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly retryable = true,
  ) {
    super(message);
    this.name = 'ProviderSendError';
  }
}
