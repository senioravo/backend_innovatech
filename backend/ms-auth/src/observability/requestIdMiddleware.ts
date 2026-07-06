/**
 * Middleware Express que asigna/propaga X-Request-Id y configura contexto Sentry.
 * Debe registrarse al inicio de la cadena de middlewares.
 */
import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import {
  extractRequestIdFromHeaders,
  runWithRequestId,
  REQUEST_ID_HEADER,
} from './requestIdContext.js';
import { isGlitchTipEnabled } from './glitchtip.js';

/**
 * Extrae o genera requestId, lo expone en response y req, y ejecuta next() en contexto ALS.
 * @param {Request} req - Request Express
 * @param {Response} res - Response Express (header X-Request-Id)
 * @param {NextFunction} next - Siguiente middleware
 */
function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = extractRequestIdFromHeaders(
    req.headers as Record<string, string | string[] | undefined>
  );

  res.setHeader('X-Request-Id', requestId);
  (req as Request & { requestId?: string }).requestId = requestId;

  runWithRequestId(requestId, () => {
    if (isGlitchTipEnabled()) {
      Sentry.setTag('request_id', requestId);
      Sentry.setContext('request', {
        requestId,
        method: req.method,
        path: req.path,
      });
    }
    next();
  });
}

export { requestIdMiddleware, REQUEST_ID_HEADER };
