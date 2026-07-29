/** Tipos de domínio compartilhados entre módulos. */

export type ContactChannel = 'sms' | 'email' | 'push' | 'whatsapp_deeplink';
export type ContactStatus = 'pending' | 'verified' | 'revoked';
export type TriggerType = 'tap' | 'hold';
export type PanicEventStatus = 'queued' | 'dispatching' | 'partial' | 'delivered' | 'failed';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'skipped';

export interface User {
  id: string;
  displayName: string;
  /** Em produção esta coluna é criptografada (envelope encryption). */
  email: string;
  phone: string;
  locale: string;
  timezone: string;
  pushTokens: string[];
  createdAt: string;
  deletedAt: string | null;
}

export interface Contact {
  id: string;
  userId: string;
  displayName: string;
  relationship: string | null;
  channel: ContactChannel;
  /** Criptografado em repouso. Nunca exposto na API — só a versão mascarada. */
  destination: string;
  destinationHash: string;
  status: ContactStatus;
  priority: number;
  verificationTokenHash: string | null;
  verificationCodeHash: string | null;
  verificationExpiresAt: string | null;
  verificationAttempts: number;
  consentAt: string | null;
  consentVersion: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface PanicEvent {
  id: string;
  userId: string;
  triggerType: TriggerType;
  /** Conteúdo sensível: criptografado em repouso, nunca registrado em log. */
  message: string | null;
  location: { lat: number; lon: number } | null;
  status: PanicEventStatus;
  riskFlag: boolean;
  idempotencyKey: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PanicNotification {
  id: string;
  panicEventId: string;
  contactId: string;
  channel: ContactChannel;
  status: NotificationStatus;
  attempts: number;
  providerMessageId: string | null;
  lastError: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
}
