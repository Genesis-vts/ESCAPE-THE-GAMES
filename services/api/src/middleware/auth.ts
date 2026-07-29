import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

/**
 * Autenticação por JWT (Bearer).
 *
 * MVP: HS256 com segredo compartilhado (`JWT_SECRET`), TTL curto (15 min).
 * v1: OIDC com RS256 e JWKS — trocar apenas a verificação abaixo.
 * Ver SECURITY_AND_COMPLIANCE.md §5.3.
 *
 * Todas as rotas de `/api/v1` passam por aqui, exceto `/health` e `/auth/*`.
 */
export interface AccessTokenClaims {
  sub: string;
  roles?: string[];
  jti?: string;
  iss?: string;
}

export function requireAuth() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.header('authorization') ?? '';
    const [esquema, token] = header.split(' ');

    if (!esquema || esquema.toLowerCase() !== 'bearer' || !token) {
      next(AppError.unauthorized('Cabeçalho Authorization ausente ou malformado.'));
      return;
    }

    try {
      const claims = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        algorithms: ['HS256'],
      }) as AccessTokenClaims;

      if (!claims.sub) {
        next(AppError.unauthorized('Token sem identificação de usuário (claim "sub").'));
        return;
      }

      req.auth = { userId: claims.sub, roles: claims.roles ?? ['user'], jti: claims.jti };
      next();
    } catch (erro) {
      const expirado = erro instanceof jwt.TokenExpiredError;
      next(AppError.unauthorized(expirado ? 'Token expirado.' : 'Token inválido.'));
    }
  };
}

/** Autorização por papel. Usar depois de `requireAuth`. */
export function requireRole(...papeis: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(AppError.unauthorized());
      return;
    }
    if (!papeis.some((p) => req.auth?.roles.includes(p))) {
      next(AppError.forbidden('Seu perfil não tem acesso a este recurso.'));
      return;
    }
    next();
  };
}

/** Helper para os controllers: garante o userId autenticado. */
export function getUserId(req: Request): string {
  if (!req.auth?.userId) throw AppError.unauthorized();
  return req.auth.userId;
}
