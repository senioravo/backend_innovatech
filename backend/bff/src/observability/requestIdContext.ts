import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const store = new AsyncLocalStorage<{ requestId: string }>();

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

function headerValue(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = String(raw).trim();
  return trimmed || undefined;
}

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

function getRequestId(): string | undefined {
  return store.getStore()?.requestId;
}

function getOrUnknown(): string {
  return getRequestId() ?? 'unknown';
}

function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return store.run({ requestId }, fn);
}

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
