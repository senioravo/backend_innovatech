/**
 * Contexto de correlación por request usando AsyncLocalStorage.
 * Propaga `X-Request-Id` entre middleware, handlers y llamadas HTTP salientes.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

/** Store ALS que mantiene el requestId del request HTTP actual */
const store = new AsyncLocalStorage<{ requestId: string }>();

/** Header canónico para identificador de request */
const REQUEST_ID_HEADER = 'x-request-id';
/** Header alternativo de correlación (fallback) */
const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Normaliza un valor de header HTTP a string trimmeado.
 * @param {string|string[]|undefined} value - Valor del header
 * @returns {string|undefined}
 */
function headerValue(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = String(raw).trim();
  return trimmed || undefined;
}

/**
 * Obtiene o genera un requestId desde headers entrantes.
 * Prioridad: X-Request-Id → X-Correlation-Id → UUID nuevo.
 * @param {Record<string, string|string[]|undefined>} headers - Headers HTTP del request
 * @returns {string} Identificador único del request
 */
function extractRequestIdFromHeaders(
  headers: Record<string, string | string[] | undefined>
): string {
  const fromRequest =
    headerValue(headers[REQUEST_ID_HEADER]) ??
    headerValue(headers['X-Request-Id']);
  const fromCorrelation =
    headerValue(headers[CORRELATION_ID_HEADER]) ??
    headerValue(headers['X-Correlation-Id']);
  return fromRequest ?? fromCorrelation ?? randomUUID();
}

/** @returns {string|undefined} requestId del contexto ALS actual, si existe */
function getRequestId(): string | undefined {
  return store.getStore()?.requestId;
}

/** @returns {string} requestId actual o `'unknown'` fuera de contexto HTTP */
function getOrUnknown(): string {
  return getRequestId() ?? 'unknown';
}

/**
 * Ejecuta una función dentro del contexto ALS del requestId dado.
 * @template T
 * @param {string} requestId - ID a asociar al contexto
 * @param {() => T} fn - Callback a ejecutar
 * @returns {T} Resultado de fn
 */
function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return store.run({ requestId }, fn);
}

/**
 * Headers para propagar el requestId en peticiones HTTP salientes.
 * @returns {Record<string, string>} `{ 'X-Request-Id': id }` o objeto vacío
 */
function getOutgoingRequestIdHeaders(): Record<string, string> {
  const requestId = getRequestId();
  if (!requestId) return {};
  return { 'X-Request-Id': requestId };
}

export {
  store,
  REQUEST_ID_HEADER,
  extractRequestIdFromHeaders,
  getRequestId,
  getOrUnknown,
  runWithRequestId,
  getOutgoingRequestIdHeaders,
};
