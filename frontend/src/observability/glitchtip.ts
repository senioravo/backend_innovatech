/**
 * Integración GlitchTip/Sentry para el frontend React.
 * Solo se activa cuando `VITE_SENTRY_DSN` está definido en el entorno de build.
 */
import * as Sentry from '@sentry/react';

let enabled = false;

/** Inicializa el SDK en el navegador. Debe llamarse antes de renderizar la app. */
export function initGlitchTip(): boolean {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn('[frontend] GlitchTip: VITE_SENTRY_DSN no definido (observabilidad desactivada)');
    }
    return false;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development',
    release: import.meta.env.VITE_SENTRY_RELEASE || 'frontend@1.0.0',
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
  });

  enabled = true;
  return true;
}

/** @returns {boolean} true si GlitchTip está activo */
export function isGlitchTipEnabled(): boolean {
  return enabled;
}

/**
 * Reporta una excepción a GlitchTip Issues.
 * @param {unknown} error
 * @param {Record<string, unknown>} [extra]
 */
export function captureHttpError(
  status: number,
  message: string,
  extra?: Record<string, unknown>
): void {
  if (!enabled) return;
  const level = status >= 500 ? 'error' : 'warning';
  Sentry.withScope((scope) => {
    scope.setTag('http_status', String(status));
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureMessage(`HTTP ${status}: ${message}`, level);
  });
}

export function captureException(error: unknown, extra?: Record<string, unknown>): void {
  if (!enabled) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}

export { Sentry };
