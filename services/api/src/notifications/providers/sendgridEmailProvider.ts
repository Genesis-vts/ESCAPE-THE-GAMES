import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import {
  ProviderSendError,
  type EmailMessage,
  type EmailProvider,
  type ProviderResult,
} from './types';

/**
 * Adaptador de e-mail via SendGrid.
 *
 * CREDENCIAIS (somente por variável de ambiente — ver `.env.example`):
 *   SENDGRID_API_KEY    -> chave com permissão APENAS de "Mail Send"
 *   SENDGRID_FROM_EMAIL -> remetente com domínio autenticado (SPF/DKIM)
 *   SENDGRID_FROM_NAME  -> nome de exibição
 *
 * INSTALAÇÃO DO SDK:
 *   npm install @sendgrid/mail --workspace services/api
 *
 * Sem SENDGRID_API_KEY, `createProviders()` usa o adaptador de console.
 */
export class SendgridEmailProvider implements EmailProvider {
  readonly name = 'sendgrid';
  private configurado = false;

  private async getClient(): Promise<SendgridLikeClient> {
    let sdk: SendgridLikeClient;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      sdk = require('@sendgrid/mail');
    } catch {
      throw new ProviderSendError(
        'SDK do SendGrid não instalado. Rode: npm install @sendgrid/mail --workspace services/api',
        this.name,
        false,
      );
    }

    if (!env.SENDGRID_API_KEY) {
      throw new ProviderSendError('SENDGRID_API_KEY ausente no ambiente.', this.name, false);
    }

    if (!this.configurado) {
      sdk.setApiKey(env.SENDGRID_API_KEY);
      this.configurado = true;
    }
    return sdk;
  }

  async send(message: EmailMessage): Promise<ProviderResult> {
    const sdk = await this.getClient();

    try {
      const [resposta] = await sdk.send({
        to: message.to,
        from: { email: env.SENDGRID_FROM_EMAIL, name: env.SENDGRID_FROM_NAME },
        subject: message.subject,
        text: message.text,
        html: message.html,
        // Rastreamento de clique/abertura desligado: é dado comportamental
        // desnecessário para a finalidade (minimização — LGPD art. 6º, III).
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false },
        },
      });

      const providerMessageId = resposta?.headers?.['x-message-id'] ?? 'desconhecido';
      // Nunca registre `to`, `subject` ou corpo: PII.
      logger.info('email_enviado', { provider: this.name, providerMessageId });

      return { providerMessageId, provider: this.name };
    } catch (erro) {
      const detalhe = erro instanceof Error ? erro.message : 'erro desconhecido';
      const status = (erro as { code?: number }).code;
      const retryable = !status || status >= 500 || status === 429;
      throw new ProviderSendError(`Falha ao enviar e-mail: ${detalhe}`, this.name, retryable);
    }
  }
}

/** Forma mínima do SDK do SendGrid usada aqui. */
interface SendgridLikeClient {
  setApiKey(key: string): void;
  send(msg: Record<string, unknown>): Promise<[{ headers?: Record<string, string> }]>;
}
