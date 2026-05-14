const dotenv = require('dotenv');

dotenv.config();

const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

module.exports = {
  PORT: process.env.PORT || 3002,
  JWT_SECRET: process.env.JWT_SECRET || 'cambiar_en_produccion',
  API_GATEWAY_PREFIX: process.env.API_GATEWAY_PREFIX || '/api/v1',
  AUTH_SERVICE_URL: (process.env.AUTH_SERVICE_URL || '').trim(),
  internalRequestTimeoutMs: int(process.env.INTERNAL_REQUEST_TIMEOUT_MS, 5000),
  circuitBreaker: {
    failureThreshold: int(process.env.CB_FAILURE_THRESHOLD, 5),
    resetTimeoutMs: int(process.env.CB_RESET_TIMEOUT_MS, 30000),
    successThreshold: int(process.env.CB_SUCCESS_THRESHOLD, 1)
  }
};
