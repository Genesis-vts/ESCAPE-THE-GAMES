import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

/**
 * Tratamento centralizado de erros.
 *
 * Nenhum controller monta resposta de erro: todos chamam `next(erro)`.
 * Em produção, erros inesperados nunca vazam mensagem interna nem stack trace
 * (SECURITY_AND_COMPLIANCE.md §5.4).
 */
export function errorHandler() {
  return (erro: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const log = req.log ?? logger;

    if (erro instanceof ZodError) {
      const details = erro.issues.map((i) => ({
        campo: i.path.join('.') || '(raiz)',
        mensagem: i.message,
      }));
      log.warn('validacao_falhou', { quantidade: details.length });
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos na requisição.', details },
      });
      return;
    }

    if (erro instanceof AppError) {
      for (const [chave, valor] of Object.entries(erro.headers ?? {})) {
        res.setHeader(chave, valor);
      }
      const nivel = erro.statusCode >= 500 ? 'error' : 'warn';
      log[nivel]('erro_de_dominio', { code: erro.code, status: erro.statusCode });
      res.status(erro.statusCode).json({
        error: {
          code: erro.code,
          message: erro.message,
          ...(erro.details ? { details: erro.details } : {}),
        },
      });
      return;
    }

    const detalhe = erro instanceof Error ? erro.message : 'erro desconhecido';
    log.error('erro_nao_tratado', {
      detalhe,
      ...(env.isProduction ? {} : { stack: erro instanceof Error ? erro.stack : undefined }),
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno. Tente novamente em instantes.',
        ...(env.isProduction ? {} : { details: { detalhe } }),
      },
    });
  };
}

export function notFoundHandler() {
  return (_req: Request, res: Response): void => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' },
    });
  };
}
