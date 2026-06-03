"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config');
const { createInternalHttpClient } = require('../lib/internalHttpClient');
let httpClient;
function getAuthHttpClient() {
    if (!httpClient) {
        httpClient = createInternalHttpClient({
            serviceName: 'auth-service',
            failureThreshold: config.circuitBreaker.failureThreshold,
            resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
            successThreshold: config.circuitBreaker.successThreshold,
            defaultTimeoutMs: config.internalRequestTimeoutMs
        });
    }
    return httpClient;
}
/**
 * Estado del Auth vía llamada interna a /health (opcional si AUTH_SERVICE_URL está definida).
 * La llamada pasa por circuit breaker.
 */
async function getAuthDependencyStatus() {
    const base = config.AUTH_SERVICE_URL?.trim();
    if (!base) {
        return { configured: false };
    }
    const client = getAuthHttpClient();
    const url = `${base.replace(/\/$/, '')}/health`;
    try {
        const body = await client.fetchJson('GET', url);
        return {
            configured: true,
            reachable: true,
            circuit: client.getBreakerState().state,
            response: body
        };
    }
    catch (err) {
        return {
            configured: true,
            reachable: false,
            circuit: client.getBreakerState().state,
            reason: err.name === 'CircuitBreakerOpenError' ? 'circuit_open' : err.message
        };
    }
}
module.exports = {
    getAuthDependencyStatus,
    getAuthHttpClient
};
