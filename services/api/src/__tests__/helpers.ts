import type { Express } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { createContainer, DEMO_USER, type Container } from '../container';
import {
  ConsoleEmailProvider,
  ConsolePushProvider,
  ConsoleSmsProvider,
} from '../notifications/providers';
import { InProcessNotificationQueue } from '../notifications/queue';

/**
 * Ambiente de teste: provedores de console (que guardam o que "enviaram") e
 * fila sem espera entre retentativas, para os testes rodarem em milissegundos.
 */
export interface TestHarness {
  app: Express;
  deps: Container;
  sms: ConsoleSmsProvider;
  email: ConsoleEmailProvider;
  push: ConsolePushProvider;
  token: string;
  /** Aguarda o processamento completo da fila de notificações. */
  drain: () => Promise<void>;
}

export function createTestHarness(): TestHarness {
  const sms = new ConsoleSmsProvider();
  const email = new ConsoleEmailProvider();
  const push = new ConsolePushProvider();
  const providers = { sms, email, push };

  const base = createContainer({ providers });
  const queue = new InProcessNotificationQueue(providers, base.panic, base.audit, {
    retryDelaysMs: [0, 0, 0],
  });
  const deps: Container = { ...base, queue };

  return {
    app: createApp(deps),
    deps,
    sms,
    email,
    push,
    token: signToken(DEMO_USER.id),
    drain: () => queue.drain(),
  };
}

export function signToken(userId: string, roles: string[] = ['user']): string {
  return jwt.sign({ sub: userId, roles }, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    expiresIn: '1h',
  });
}

/**
 * Filtra apenas as mensagens de ACIONAMENTO — os convites de verificação
 * também passam pelos mesmos provedores durante o cadastro do contato.
 */
export function smsDePanico(harness: TestHarness) {
  return harness.sms.sent.filter((m) => m.body.includes('acionou o botao de apoio'));
}

export function emailDePanico(harness: TestHarness) {
  return harness.email.sent.filter((m) => m.subject.includes('pediu apoio agora'));
}

/** Cadastra um contato e já o verifica — atalho usado nos testes de /panic. */
export async function criarContatoVerificado(
  harness: TestHarness,
  overrides: Partial<{ channel: string; destination: string; displayName: string }> = {},
): Promise<string> {
  const criacao = await request(harness.app)
    .post('/api/v1/contacts')
    .set('Authorization', `Bearer ${harness.token}`)
    .send({
      displayName: overrides.displayName ?? 'Cláudia',
      relationship: 'mãe',
      channel: overrides.channel ?? 'sms',
      destination: overrides.destination ?? '+5511999998888',
      priority: 1,
    })
    .expect(201);

  const { contact, verification } = criacao.body;

  await request(harness.app)
    .post(`/api/v1/contacts/${contact.id}/verify`)
    .set('Authorization', `Bearer ${harness.token}`)
    .send({ verificationToken: verification.verificationToken, code: verification.devCode })
    .expect(200);

  return contact.id;
}
