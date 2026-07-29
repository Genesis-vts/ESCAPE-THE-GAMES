import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ProviderSendError, type ProviderResult, type SmsMessage, type SmsProvider } from './types';

/**
 * Adaptador de SMS via Twilio.
 *
 * CREDENCIAIS (nunca no código — apenas variáveis de ambiente, ver `.env.example`):
 *   TWILIO_ACCOUNT_SID          -> SID da conta (console.twilio.com)
 *   TWILIO_AUTH_TOKEN           -> token de autenticação
 *   TWILIO_FROM_NUMBER          -> remetente em E.164, ex.: +5511999999999
 *   TWILIO_MESSAGING_SERVICE_SID-> alternativa recomendada ao número fixo
 *
 * INSTALAÇÃO DO SDK (não é dependência do scaffold para permitir rodar offline):
 *   npm install twilio --workspace services/api
 *
 * Sem as credenciais, `createProviders()` devolve o adaptador de console e nenhum
 * SMS real é enviado — comportamento padrão em desenvolvimento e em teste.
 */
export class TwilioSmsProvider implements SmsProvider {
  readonly name = 'twilio';

  // Tipo `unknown` porque o SDK é carregado sob demanda; ver comentário em `getClient`.
  private client: unknown = null;

  private async getClient(): Promise<TwilioLikeClient> {
    if (this.client) return this.client as TwilioLikeClient;

    let factory: (sid: string, token: string) => TwilioLikeClient;
    try {
      // Import dinâmico: o SDK só é exigido quando há credenciais configuradas.
      factory = require('twilio');
    } catch {
      throw new ProviderSendError(
        'SDK da Twilio não instalado. Rode: npm install twilio --workspace services/api',
        this.name,
        false,
      );
    }

    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new ProviderSendError(
        'TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN ausentes no ambiente.',
        this.name,
        false,
      );
    }

    this.client = factory(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    return this.client as TwilioLikeClient;
  }

  async send(message: SmsMessage): Promise<ProviderResult> {
    const client = await this.getClient();

    // O remetente vem do Messaging Service quando disponível (melhor entregabilidade
    // e failover de número), caindo para o número fixo em último caso.
    const remetente = env.TWILIO_MESSAGING_SERVICE_SID
      ? { messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID }
      : { from: env.TWILIO_FROM_NUMBER };

    try {
      const resposta = await client.messages.create({
        to: message.to,
        body: message.body, // já transliterado para GSM-7 em templates.ts
        ...remetente,
      });

      // Atenção: não registre `to` nem `body` — são PII (SECURITY_AND_COMPLIANCE.md §5.5).
      logger.info('sms_enviado', { provider: this.name, providerMessageId: resposta.sid });

      return { providerMessageId: resposta.sid, provider: this.name };
    } catch (erro) {
      const detalhe = erro instanceof Error ? erro.message : 'erro desconhecido';
      const status = (erro as { status?: number }).status;
      // 4xx do provedor (número inválido, bloqueado) não deve ser retentado.
      const retryable = !status || status >= 500 || status === 429;
      throw new ProviderSendError(`Falha ao enviar SMS: ${detalhe}`, this.name, retryable);
    }
  }
}

/** Forma mínima do cliente Twilio usada aqui — evita depender dos tipos do SDK. */
interface TwilioLikeClient {
  messages: {
    create(params: {
      to: string;
      body: string;
      from?: string | undefined;
      messagingServiceSid?: string | undefined;
    }): Promise<{ sid: string }>;
  };
}
