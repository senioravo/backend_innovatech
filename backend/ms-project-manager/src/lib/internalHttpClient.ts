// @ts-nocheck
export {};
const { CircuitBreaker } = require('./circuitBreaker');

/**
 * Internal HTTP client with a per-dependency circuit breaker.
 * Use for calls to other microservices (same pattern for new clients).
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

  async function fetchJson(method, url, options = {}) {
    const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
    const headers = {
      Accept: 'application/json',
      ...options.headers
    };
    if (options.body !== undefined && options.body !== null) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    return breaker.execute(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method,
          headers,
          body:
            options.body !== undefined && options.body !== null
              ? typeof options.body === 'string'
                ? options.body
                : JSON.stringify(options.body)
              : undefined,
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
          const err = new Error(`HTTP ${res.status}`);
          err.status = res.status;
          err.body = parsed;
          throw err;
        }

        return parsed;
      } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          const timeoutErr = new Error(`Timeout interno (${timeoutMs}ms): ${url}`);
          timeoutErr.cause = err;
          throw timeoutErr;
        }
        throw err;
      }
    });
  }

  return {
    fetchJson,
    getBreakerState: () => breaker.getState()
  };
}

module.exports = { createInternalHttpClient };
