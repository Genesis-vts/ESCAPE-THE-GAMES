import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ConsoleEmailProvider, ConsolePushProvider, ConsoleSmsProvider } from './consoleProvider';
import { FcmPushProvider } from './fcmPushProvider';
import { SendgridEmailProvider } from './sendgridEmailProvider';
import { TwilioSmsProvider } from './twilioSmsProvider';
import type { Providers } from './types';

/**
 * Fábrica de provedores.
 *
 * Seleção por presença de credencial no ambiente:
 *   - com credencial  -> adaptador real (Twilio / SendGrid / FCM)
 *   - sem credencial  -> adaptador de console (nada é enviado de verdade)
 *
 * Em produção, a ausência de credencial é ERRO FATAL: um botão de pânico que
 * apenas imprime no console é pior do que um que falha visivelmente.
 */
export function createProviders(): Providers {
  const temTwilio = Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
  const temSendgrid = Boolean(env.SENDGRID_API_KEY);
  const temFcm = Boolean(process.env.FCM_SERVICE_ACCOUNT_PATH);

  if (env.isProduction && !(temTwilio && temSendgrid)) {
    throw new Error(
      'Em produção, TWILIO_* e SENDGRID_API_KEY são obrigatórios. ' +
        'Configure os segredos no cofre antes de subir a aplicação.',
    );
  }

  if (!env.isTest) {
    logger.info('provedores_selecionados', {
      sms: temTwilio ? 'twilio' : 'console',
      email: temSendgrid ? 'sendgrid' : 'console',
      push: temFcm ? 'fcm' : 'console',
    });
  }

  return {
    sms: temTwilio ? new TwilioSmsProvider() : new ConsoleSmsProvider(),
    email: temSendgrid ? new SendgridEmailProvider() : new ConsoleEmailProvider(),
    push: temFcm ? new FcmPushProvider() : new ConsolePushProvider(),
  };
}

export * from './types';
export { ConsoleEmailProvider, ConsolePushProvider, ConsoleSmsProvider };
export { FcmPushProvider, SendgridEmailProvider, TwilioSmsProvider };
