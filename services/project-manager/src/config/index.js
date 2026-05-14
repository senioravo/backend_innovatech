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
  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  internalRequestTimeoutMs: int(process.env.INTERNAL_REQUEST_TIMEOUT_MS, 5000),
  circuitBreaker: {
    failureThreshold: int(process.env.CB_FAILURE_THRESHOLD, 5),
    resetTimeoutMs: int(process.env.CB_RESET_TIMEOUT_MS, 30000),
    successThreshold: int(process.env.CB_SUCCESS_THRESHOLD, 1)
  },
  /** Logs de auditoría centralizados (opcional). Sin ELASTICSEARCH_NODE solo se usa consola. */
  elasticsearch: {
    node: (process.env.ELASTICSEARCH_NODE || '').trim(),
    index: (process.env.ELASTICSEARCH_AUDIT_INDEX || 'project-manager-audit').trim(),
    apiKey: (process.env.ELASTICSEARCH_API_KEY || '').trim(),
    username: (process.env.ELASTICSEARCH_USERNAME || '').trim(),
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    tlsInsecure: process.env.ELASTICSEARCH_TLS_INSECURE === '1'
  },
  /** Prometheus: ENABLE_METRICS=0 desactiva /metrics y el middleware HTTP. */
  enableMetrics: process.env.ENABLE_METRICS !== '0',
  metricsPath: ((process.env.METRICS_PATH || '/metrics').trim() || '/metrics')
};
