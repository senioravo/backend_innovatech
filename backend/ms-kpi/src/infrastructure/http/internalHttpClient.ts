/**
 * Cliente HTTP interno con circuit breaker para llamadas entre microservicios.
 * Envuelve fetch con timeout, headers de trazabilidad y protección ante fallos en cascada.
 */
const { CircuitBreaker } = require('./circuitBreaker');
const { getOutgoingRequestIdHeaders } = require('../../observability/requestIdContext');

/**
 * Crea un cliente HTTP interno con circuit breaker y timeout configurable.
 * @param {object} options - Opciones de configuración del cliente.
 * @param {string} options.serviceName - Nombre del servicio destino (identificador del breaker).
 * @param {number} options.failureThreshold - Fallos consecutivos antes de abrir el circuito.
 * @param {number} options.resetTimeoutMs - Milisegundos antes de intentar half-open tras abrir.
 * @param {number} options.successThreshold - Éxitos requeridos en half-open para cerrar el circuito.
 * @param {number} options.defaultTimeoutMs - Timeout por defecto de cada petición fetch.
 * @returns {{ fetchJson: Function; getBreakerState: Function }} Cliente con métodos de petición y estado del breaker.
 */
function createInternalHttpClient({
  serviceName,
  failureThreshold,
  resetTimeoutMs,
  successThreshold,
  defaultTimeoutMs
}) {
  const breaker = new CircuitBreaker({
    name: serviceName,
    failureThreshold,
    resetTimeoutMs,
    successThreshold
  });

  /**
   * Ejecuta una petición HTTP JSON protegida por el circuit breaker.
   * @param {string} method - Método HTTP (GET, POST, etc.).
   * @param {string} url - URL absoluta del recurso destino.
   * @param {Record<string, unknown>} [options={}] - Opciones adicionales de la petición.
   * @returns {Promise<unknown>} Cuerpo parseado como JSON o texto plano si no es JSON válido.
   * @throws {Error & { status?: number; body?: unknown }} Si la respuesta HTTP no es ok.
   * @throws {import('./circuitBreaker').CircuitBreakerOpenError} Si el circuit breaker está abierto.
   */
  async function fetchJson(method, url, options: Record<string, unknown> = {}) {
    const timeoutMs = (options.timeoutMs as number | undefined) ?? defaultTimeoutMs;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...getOutgoingRequestIdHeaders(),
      ...(options.headers as Record<string, string> | undefined)
    };
    if (options.body != null) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    return breaker.execute(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method,
          headers,
          body: options.body != null ? JSON.stringify(options.body) : undefined,
          signal: controller.signal
        });
        clearTimeout(timer);

        const text = await res.text();
        let parsed = text;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = text;
          }
        }

        if (!res.ok) {
          const err = new Error(`HTTP ${res.status}`) as Error & { status: number; body: unknown };
          err.status = res.status;
          err.body = parsed;
          throw err;
        }
        return parsed;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    });
  }

  return { fetchJson, getBreakerState: () => breaker.getState() };
}

module.exports = { createInternalHttpClient };
