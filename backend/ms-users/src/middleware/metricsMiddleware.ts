// @ts-nocheck
export {};
// Middleware de métricas con Prometheus
const promClient = require('prom-client');

// Registro de métricas
const register = new promClient.Registry();

// Métricas por defecto (CPU, memoria, etc.)
promClient.collectDefaultMetrics({ register });

// Contador de requests HTTP
const httpRequestsTotal = new promClient.Counter({
  name: 'users_http_requests_total',
  help: 'Total de requests HTTP recibidas (ms-users)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histograma de duración de requests
const httpRequestDuration = new promClient.Histogram({
  name: 'users_http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos (ms-users)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Contador de operaciones CRUD
const crudOperationsTotal = new promClient.Counter({
  name: 'users_crud_operations_total',
  help: 'Total de operaciones CRUD de usuarios',
  labelNames: ['operation', 'status'],
  registers: [register]
});

/**
 * Middleware para recolectar métricas de requests HTTP
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // Interceptar el método res.json para capturar el status code
  const originalJson = res.json;
  res.json = function (body) {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;
    const route = req.route ? req.route.path : req.path;

    // Registrar métricas
    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Registrar operación CRUD
 * @param {string} operation - create, read, update, delete
 * @param {string} status - success, error
 */
const recordCrudOperation = (operation, status) => {
  crudOperationsTotal.inc({ operation, status });
};

/**
 * Obtener métricas en formato Prometheus
 * @returns {Promise<string>} - Métricas en texto plano
 */
const getMetrics = async () => {
  return await register.metrics();
};

module.exports = {
  metricsMiddleware,
  recordCrudOperation,
  getMetrics,
  register
};
