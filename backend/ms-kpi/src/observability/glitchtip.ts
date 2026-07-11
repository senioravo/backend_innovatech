/**
 * Integración GlitchTip/Sentry para captura de excepciones y mensajes.
 * Solo se activa cuando `SENTRY_DSN` está definido en el entorno.
 * Enriquece cada evento con `request_id` y nombre del servicio.
 */
import * as Sentry from '@sentry/node';
import { getOrUnknown } from './requestIdContext.js';

let enabled = false;
let serviceName = 'service';

/**
 * Inicializa el SDK de Sentry/GlitchTip para este servicio.
 * @param {string} name - Nombre lógico del microservicio (ej. `bff`, `ms-auth`)
 */
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

/** @returns {string} Nombre del servicio registrado en initGlitchTip */
function getServiceName(): string {
  return serviceName;
}

/** @returns {boolean} true si SENTRY_DSN fue configurado y el SDK está activo */
function isGlitchTipEnabled(): boolean {
  return enabled;
}

/**
 * Prefija el mensaje del error con el requestId actual para correlación en GlitchTip.
 * @param {Error} err - Error original
 * @returns {Error} Mismo error con mensaje enriquecido
 */
function enrichError(err: Error): Error {
  const requestId = getOrUnknown();
  if (!err.message.includes('[requestId=')) {
    err.message = `[requestId=${requestId}] ${err.message}`;
  }
  return err;
}

/**
 * Reporta una excepción a GlitchTip con tags de request_id y servicio.
 * @param {unknown} error - Error o valor a reportar
 * @param {string} [context] - Contexto adicional (ej. `GET /api/users`)
 */
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

/**
 * Envía un mensaje de log estructurado a GlitchTip.
 * @param {string} message - Texto del mensaje
 * @param {Sentry.SeverityLevel} [level='info'] - Nivel Sentry (info, warning, error, etc.)
 */
function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!enabled) return;

  Sentry.withScope((scope) => {
    scope.setTag('request_id', getOrUnknown());
    scope.setTag('service', serviceName);
    Sentry.captureMessage(`[requestId=${getOrUnknown()}] ${message}`, level);
  });
}

/**
 * Espera a que eventos pendientes se envíen antes de apagar el proceso.
 * @param {number} [timeoutMs=2000] - Tiempo máximo de espera en ms
 * @returns {Promise<boolean>} true si el flush completó a tiempo
 */
function captureHttpError(
  status: number,
  message: string,
  context?: string,
  extra?: Record<string, unknown>
): void {
  if (!enabled) return;

  const level: Sentry.SeverityLevel = status >= 500 ? 'error' : 'warning';

  Sentry.withScope((scope) => {
    scope.setTag('request_id', getOrUnknown());
    scope.setTag('service', serviceName);
    scope.setTag('http_status', String(status));
    if (context) scope.setExtra('context', context);
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureMessage(
      `[requestId=${getOrUnknown()}] HTTP ${status}: ${message}`,
      level
    );
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
  captureHttpError,
  flushGlitchTip,
};
