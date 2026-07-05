import * as Sentry from '@sentry/node';
import { getOrUnknown } from './requestIdContext.js';

let enabled = false;
let serviceName = 'service';

function initGlitchTip(name: string): void {
  serviceName = name;
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    console.warn(`[${name}] GlitchTip: SENTRY_DSN no definido (observabilidad desactivada)`);
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || `${name}@1.0.0`,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
  });

  enabled = true;
  console.log(`[${name}] GlitchTip/Sentry inicializado`);
}

function getServiceName(): string {
  return serviceName;
}

function isGlitchTipEnabled(): boolean {
  return enabled;
}

function enrichError(err: Error): Error {
  const requestId = getOrUnknown();
  if (!err.message.includes('[requestId=')) {
    err.message = `[requestId=${requestId}] ${err.message}`;
  }
  return err;
}

function captureException(error: unknown, context?: string): void {
  if (!enabled) return;

  Sentry.withScope((scope) => {
    scope.setTag('request_id', getOrUnknown());
    scope.setTag('service', serviceName);
    if (context) scope.setExtra('context', context);

    if (error instanceof Error) {
      Sentry.captureException(enrichError(error));
      return;
    }

    Sentry.captureMessage(`[requestId=${getOrUnknown()}] ${String(error)}`, 'error');
  });
}

function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!enabled) return;

  Sentry.withScope((scope) => {
    scope.setTag('request_id', getOrUnknown());
    scope.setTag('service', serviceName);
    Sentry.captureMessage(`[requestId=${getOrUnknown()}] ${message}`, level);
  });
}

async function flushGlitchTip(timeoutMs = 2000): Promise<boolean> {
  if (!enabled) return true;
  return Sentry.flush(timeoutMs);
}

export {
  initGlitchTip,
  getServiceName,
  isGlitchTipEnabled,
  captureException,
  captureMessage,
  flushGlitchTip,
};
