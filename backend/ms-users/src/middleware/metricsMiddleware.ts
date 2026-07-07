/**
 * Middleware y utilidades Prometheus para métricas HTTP y CRUD de ms-users.
 */
import promClient from 'prom-client';

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'users_http_requests_total',
  help: 'Total de requests HTTP recibidas (ms-users)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'users_http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos (ms-users)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const crudOperationsTotal = new promClient.Counter({
  name: 'users_crud_operations_total',
  help: 'Total de operaciones CRUD de usuarios',
  labelNames: ['operation', 'status'],
  registers: [register]
});

/**
 * Registra contador e histograma de cada respuesta JSON.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  const originalJson = res.json;
  res.json = function (body) {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Incrementa el contador de operaciones CRUD de usuarios.
 * @param {string} operation - Tipo de operación (create, read, update, delete)
 * @param {string} status - Resultado (success, error)
 * @returns {void}
 */
const recordCrudOperation = (operation: string, status: string) => {
  crudOperationsTotal.inc({ operation, status });
};

/**
 * Exporta métricas Prometheus en formato texto.
 * @returns {Promise<string>} Métricas serializadas del registro
 */
const getMetrics = async () => {
  return await register.metrics();
};

export {
  metricsMiddleware,
  recordCrudOperation,
  getMetrics,
  register
};
