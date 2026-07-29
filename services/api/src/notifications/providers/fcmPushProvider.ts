import { logger } from '../../utils/logger';
import {
  ProviderSendError,
  type ProviderResult,
  type PushMessage,
  type PushProvider,
} from './types';

/**
 * Adaptador de push via Firebase Cloud Messaging (FCM), que também entrega em iOS
 * quando a chave APNs está configurada no projeto Firebase.
 *
 * CREDENCIAIS (variáveis de ambiente — ver `.env.example`):
 *   FCM_SERVICE_ACCOUNT_PATH -> caminho do JSON da service account (arquivo NÃO versionado)
 *   FCM_PROJECT_ID           -> id do projeto Firebase
 *
 * INSTALAÇÃO DO SDK:
 *   npm install firebase-admin --workspace services/api
 *
 * Regras de conteúdo (PANIC_BUTTON_DESIGN.md §5.4): a notificação NÃO carrega
 * conteúdo sensível — apenas quem acionou e o `eventId`. O texto completo é lido
 * dentro do app, após autenticação.
 */
export class FcmPushProvider implements PushProvider {
  readonly name = 'fcm';
  private app: unknown = null;

  private async getMessaging(): Promise<FirebaseLikeMessaging> {
    let admin: FirebaseLikeAdmin;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      admin = require('firebase-admin');
    } catch {
      throw new ProviderSendError(
        'SDK firebase-admin não instalado. Rode: npm install firebase-admin --workspace services/api',
        this.name,
        false,
      );
    }

    // Sem service account não há como assinar as requisições ao FCM.
    if (!process.env.FCM_SERVICE_ACCOUNT_PATH) {
      throw new ProviderSendError(
        'FCM_SERVICE_ACCOUNT_PATH ausente no ambiente.',
        this.name,
        false,
      );
    }

    if (!this.app) {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FCM_PROJECT_ID,
      });
    }
    return admin.messaging();
  }

  async send(message: PushMessage): Promise<ProviderResult> {
    if (message.tokens.length === 0) {
      throw new ProviderSendError('Nenhum token de push registrado.', this.name, false);
    }

    const messaging = await this.getMessaging();

    try {
      const resposta = await messaging.sendEachForMulticast({
        tokens: message.tokens,
        notification: { title: message.title, body: message.body },
        data: message.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', 'interruption-level': 'time-sensitive' } } },
      });

      logger.info('push_enviado', {
        provider: this.name,
        sucesso: resposta.successCount,
        falha: resposta.failureCount,
      });

      return { providerMessageId: `fcm_${Date.now()}`, provider: this.name };
    } catch (erro) {
      const detalhe = erro instanceof Error ? erro.message : 'erro desconhecido';
      throw new ProviderSendError(`Falha ao enviar push: ${detalhe}`, this.name, true);
    }
  }
}

interface FirebaseLikeMessaging {
  sendEachForMulticast(msg: Record<string, unknown>): Promise<{
    successCount: number;
    failureCount: number;
  }>;
}

interface FirebaseLikeAdmin {
  initializeApp(options: Record<string, unknown>): unknown;
  credential: { applicationDefault(): unknown };
  messaging(): FirebaseLikeMessaging;
}
