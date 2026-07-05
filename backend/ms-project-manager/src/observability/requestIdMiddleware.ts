import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import {
  extractRequestIdFromHeaders,
  runWithRequestId,
  REQUEST_ID_HEADER,
} from './requestIdContext.js';
import { isGlitchTipEnabled } from './glitchtip.js';

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
