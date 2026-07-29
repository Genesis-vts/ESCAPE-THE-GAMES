import { AuditLog } from './audit/auditLog';
import { env } from './config/env';
import type { User } from './domain/types';
import { createProviders, type Providers } from './notifications/providers';
import {
  InProcessNotificationQueue,
  type NotificationQueue,
  type QueueOptions,
} from './notifications/queue';
import {
  InMemoryContactRepository,
  InMemoryPanicRepository,
  InMemoryUserRepository,
  type ContactRepository,
  type PanicRepository,
  type UserRepository,
} from './repositories/inMemory';

/**
 * Composição das dependências da aplicação.
 *
 * `createApp(container)` recebe este objeto, o que permite aos testes injetar
 * dublês de provedor e uma fila sem atraso de retry. Nenhum módulo importa
 * singleton de repositório ou de provedor diretamente.
 */
export interface Container {
  users: UserRepository;
  contacts: ContactRepository;
  panic: PanicRepository;
  audit: AuditLog;
  providers: Providers;
  queue: NotificationQueue;
}

export interface ContainerOverrides extends Partial<Container> {
  queueOptions?: QueueOptions;
}

/** Usuário de demonstração — criado apenas fora de produção. */
export const DEMO_USER: User = {
  id: '11111111-1111-4111-8111-111111111111',
  displayName: 'Rafael',
  email: 'rafael@example.com',
  phone: '+5511988887777',
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  pushTokens: ['token-de-demonstracao'],
  createdAt: new Date('2026-01-10T12:00:00.000Z').toISOString(),
  deletedAt: null,
};

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const users = overrides.users ?? new InMemoryUserRepository();
  const contacts = overrides.contacts ?? new InMemoryContactRepository();
  const panic = overrides.panic ?? new InMemoryPanicRepository();
  const audit = overrides.audit ?? new AuditLog();
  const providers = overrides.providers ?? createProviders();
  const queue =
    overrides.queue ??
    new InProcessNotificationQueue(providers, panic, audit, overrides.queueOptions ?? {});

  // Semente de desenvolvimento: permite testar /panic sem cadastro prévio.
  // Em produção nenhum usuário é criado automaticamente.
  if (!env.isProduction) {
    void users.save({ ...DEMO_USER });
  }

  return { users, contacts, panic, audit, providers, queue };
}
