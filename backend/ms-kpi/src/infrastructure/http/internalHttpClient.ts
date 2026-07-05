const { CircuitBreaker } = require('./circuitBreaker');
const { getOutgoingRequestIdHeaders } = require('../observability/requestIdContext');

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
