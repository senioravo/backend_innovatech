"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { CircuitBreaker } = require('./circuitBreaker');
function createInternalHttpClient({ serviceName, failureThreshold, resetTimeoutMs, successThreshold, defaultTimeoutMs }) {
    const breaker = new CircuitBreaker({
        name: serviceName,
        failureThreshold,
        resetTimeoutMs,
        successThreshold
    });
    async function fetchJson(method, url, options = {}) {
        const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
        const headers = { Accept: 'application/json', ...options.headers };
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
                    }
                    catch {
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
            }
            catch (err) {
                clearTimeout(timer);
                throw err;
            }
        });
    }
    return { fetchJson, getBreakerState: () => breaker.getState() };
}
module.exports = { createInternalHttpClient };
