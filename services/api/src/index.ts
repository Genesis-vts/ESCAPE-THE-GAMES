import { createApp } from './app';
import { env } from './config/env';
import { createContainer } from './container';
import { logger } from './utils/logger';

/**
 * Bootstrap HTTP com desligamento gracioso.
 *
 * No shutdown: paramos de aceitar conexões, mas ESPERAMOS a fila esvaziar —
 * derrubar o processo com notificações de pânico pendentes é inaceitável.
 */
function main(): void {
  const deps = createContainer();
  const app = createApp(deps);

  const server = app.listen(env.PORT, () => {
    logger.info('api_iniciada', { porta: env.PORT, ambiente: env.NODE_ENV });
  });

  const encerrar = (sinal: string) => {
    logger.info('encerrando', { sinal });
    server.close(async () => {
      try {
        await deps.queue.drain();
        logger.info('fila_esvaziada');
      } catch (erro) {
        logger.error('falha_ao_esvaziar_fila', {
          detalhe: erro instanceof Error ? erro.message : 'desconhecido',
        });
      }
      process.exit(0);
    });

    // Rede de segurança: não ficar preso indefinidamente.
    setTimeout(() => process.exit(1), 15_000).unref();
  };

  process.on('SIGTERM', () => encerrar('SIGTERM'));
  process.on('SIGINT', () => encerrar('SIGINT'));

  process.on('unhandledRejection', (motivo) => {
    logger.error('promessa_rejeitada', {
      detalhe: motivo instanceof Error ? motivo.message : String(motivo),
    });
  });
}

main();
