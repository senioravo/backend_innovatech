"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require('dotenv');
dotenv.config();
const int = (v, fallback) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
};
const trimBase = (v, fallback) => (v || fallback || '').trim().replace(/\/$/, '');
module.exports = {
    PORT: process.env.PORT || 3004,
    API_GATEWAY_PREFIX: process.env.API_GATEWAY_PREFIX || '/api/v1',
    projectManagerBaseUrl: trimBase(process.env.PROJECT_MANAGER_BASE_URL, 'http://localhost:3002'),
    projectManagerApiPrefix: (process.env.PROJECT_MANAGER_API_PREFIX || '/api/v1').trim() || '/api/v1',
    internalRequestTimeoutMs: int(process.env.INTERNAL_REQUEST_TIMEOUT_MS, 5000),
    circuitBreaker: {
        failureThreshold: int(process.env.CB_FAILURE_THRESHOLD, 5),
        resetTimeoutMs: int(process.env.CB_RESET_TIMEOUT_MS, 30000),
        successThreshold: int(process.env.CB_SUCCESS_THRESHOLD, 1)
    }
};
