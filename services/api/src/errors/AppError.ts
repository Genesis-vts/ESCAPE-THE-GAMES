/**
 * Erros de domínio tipados. O `errorHandler` central converte estas instâncias
 * na resposta `{ error: { code, message, details? } }` — nenhum controller deve
 * montar resposta de erro manualmente.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'INTERNAL_ERROR';

const STATUS_POR_CODIGO: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PROVIDER_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;
  readonly headers?: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    options: { details?: unknown; headers?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = STATUS_POR_CODIGO[code];
    this.details = options.details;
    this.headers = options.headers;
    Error.captureStackTrace?.(this, AppError);
  }

  static unauthorized(message = 'Autenticação necessária.') {
    return new AppError('UNAUTHORIZED', message);
  }

  static forbidden(message = 'Acesso negado a este recurso.') {
    return new AppError('FORBIDDEN', message);
  }

  static notFound(message = 'Recurso não encontrado.') {
    return new AppError('NOT_FOUND', message);
  }

  static validation(message: string, details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, { details });
  }

  static rateLimited(message: string, retryAfterSeconds: number) {
    return new AppError('RATE_LIMITED', message, {
      headers: { 'Retry-After': String(retryAfterSeconds) },
      details: { retryAfterSeconds },
    });
  }
}
