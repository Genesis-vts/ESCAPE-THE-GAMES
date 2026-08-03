import { newId } from '../../utils/crypto';
import type {
  EmailMessage,
  EmailProvider,
  ProviderResult,
  PushMessage,
  PushProvider,
  SmsMessage,
  SmsProvider,
} from './types';

/**
 * Adaptadores de console: escrevem a mensagem no stdout em vez de enviá-la.
 *
 * São o padrão em desenvolvimento e teste — assim o `/panic` funciona ponta a
 * ponta sem nenhuma credencial de provedor. NUNCA são selecionados quando
 * NODE_ENV=production (ver `createProviders`).
 */

function imprimir(canal: string, payload: Record<string, unknown>): void {
  // Em teste os adaptadores só acumulam em `sent` — sem poluir a saída do Jest.
  if (process.env.NODE_ENV === 'test') return;

  // Console explícito: é a "entrega" deste adaptador. Não passa pelo logger
  // porque aqui queremos justamente ver o conteúdo durante o desenvolvimento.
  console.log(`\n──── [${canal.toUpperCase()} · MOCK] ────`);
  for (const [chave, valor] of Object.entries(payload)) {
    console.log(`${chave}: ${typeof valor === 'string' ? valor : JSON.stringify(valor)}`);
  }
  console.log('──── fim ────\n');
}

export class ConsoleSmsProvider implements SmsProvider {
  readonly name = 'console-sms';
  readonly sent: SmsMessage[] = [];

  async send(message: SmsMessage): Promise<ProviderResult> {
    this.sent.push(message);
    imprimir('sms', { para: message.to, corpo: message.body });
    return { providerMessageId: newId('sm'), provider: this.name };
  }
}

export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console-email';
  readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<ProviderResult> {
    this.sent.push(message);
    imprimir('email', { para: message.to, assunto: message.subject, corpo: message.text });
    return { providerMessageId: newId('em'), provider: this.name };
  }
}

export class ConsolePushProvider implements PushProvider {
  readonly name = 'console-push';
  readonly sent: PushMessage[] = [];

  async send(message: PushMessage): Promise<ProviderResult> {
    this.sent.push(message);
    imprimir('push', {
      tokens: message.tokens.length,
      titulo: message.title,
      corpo: message.body,
      data: message.data,
    });
    return { providerMessageId: newId('pu'), provider: this.name };
  }
}
