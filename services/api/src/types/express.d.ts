import type { Logger } from '../utils/logger';

/** Campos injetados pelos middlewares `requestContext` e `auth`. */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      log: Logger;
      auth?: {
        userId: string;
        roles: string[];
        jti?: string;
      };
    }
  }
}

export {};
