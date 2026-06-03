// @ts-nocheck
export {};
// AS-TASK-14: Middleware de métricas con Prometheus
// Responsabilidad: Capturar métricas de performance y operaciones
// Principio SOLID: Single Responsibility - Solo maneja captura de métricas

const promClient = require('prom-client');

/**
 * Configuración de Prometheus Client
 * - Registro de métricas por defecto (CPU, memoria, event loop)
 * - Métricas custom para Auth microservice
 */

// Crear registro de métricas
const register = new promClient.Registry();

// Configurar métricas por defecto de Node.js (CPU, memoria, GC, event loop)
promClient.collectDefaultMetrics({
  register,
  prefix: 'auth_service_',
  labels: { taskId: 'AS-TASK-14' }
});

/**
 * Métrica 1: Contador de peticiones HTTP por endpoint
 * Etiquetas: method, route, statusCode, taskId
 */
const httpRequestsTotal = new promClient.Counter({
  name: 'auth_http_requests_total',
  help: 'Total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status_code', 'taskId'],
  registers: [register]
});

/**
 * Métrica 2: Histograma de latencia de respuesta
 * Buckets: 0.1s, 0.5s, 1s, 2s, 5s, 10s
 * Etiquetas: method, route, statusCode, taskId
 */
const httpRequestDuration = new promClient.Histogram({
  name: 'auth_http_request_duration_seconds',
  help: 'Duración de peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code', 'taskId'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

/**
 * Métrica 3: Contador de errores de autenticación/autorización
 * Etiquetas: error_type, route, taskId
 * Tipos de error:
 * - auth_failed: Credenciales inválidas (login fallido)
 * - token_invalid: Token JWT inválido o expirado
 * - token_missing: Token no proporcionado
 * - insufficient_permissions: Rol insuficiente
 * - user_not_found: Usuario no encontrado
 */
const authErrorsTotal = new promClient.Counter({
  name: 'auth_errors_total',
  help: 'Total de errores de autenticación y autorización',
  labelNames: ['error_type', 'route', 'taskId'],
  registers: [register]
});

/**
 * Métrica 4: Contador de operaciones críticas exitosas
 * Etiquetas: operation, taskId
 * Operaciones: REGISTER, LOGIN, LOGOUT, ROLE_CHANGE
 */
const criticalOperationsTotal = new promClient.Counter({
  name: 'auth_critical_operations_total',
  help: 'Total de operaciones críticas realizadas',
  labelNames: ['operation', 'success', 'taskId'],
  registers: [register]
});

/**
 * Métrica 5: Gauge de usuarios activos (tokens válidos en blacklist)
 * No tiene etiquetas dinámicas
 */
const activeUsersGauge = new promClient.Gauge({
  name: 'auth_active_users',
  help: 'Número de usuarios con sesión activa (tokens no blacklisted)',
  labelNames: ['taskId'],
  registers: [register]
});

/**
 * Normalizar rutas dinámicas para evitar cardinalidad alta
 * Ejemplo: /usuarios/123/rol → /usuarios/:id/rol
 * @param {string} path - Ruta original
 * @returns {string} - Ruta normalizada
 */
function normalizePath(path) {
  // Reemplazar IDs numéricos por :id
  let normalized = path.replace(/\/\d+/g, '/:id');
  
  // Reemplazar UUIDs por :uuid
  normalized = normalized.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '/:uuid'
  );
  
  return normalized;
}

/**
 * Middleware de métricas de Prometheus
 * Registra automáticamente:
 * - Contador de requests por endpoint
 * - Latencia de respuesta (histograma)
 * - Errores de autenticación/autorización
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar método res.json para capturar statusCode
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  const captureMetrics = () => {
    const duration = (Date.now() - startTime) / 1000; // Convertir a segundos
    const statusCode = res.statusCode;
    const method = req.method;
    const route = normalizePath(req.path);
    
    // Métrica 1: Incrementar contador de requests
    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
      taskId: 'AS-TASK-14'
    });
    
    // Métrica 2: Registrar duración de request (histograma)
    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
        taskId: 'AS-TASK-14'
      },
      duration
    );
    
    // Métrica 3: Registrar errores de autenticación/autorización
    if (statusCode === 401 || statusCode === 403) {
      let errorType = 'unknown';
      
      // Determinar tipo de error según el path y status
      if (statusCode === 401 && route.includes('/login')) {
        errorType = 'auth_failed';
      } else if (statusCode === 401) {
        errorType = 'token_invalid_or_missing';
      } else if (statusCode === 403) {
        errorType = 'insufficient_permissions';
      }
      
      authErrorsTotal.inc({
        error_type: errorType,
        route,
        taskId: 'AS-TASK-14'
      });
    }
  };
  
  // Sobrescribir res.json
  res.json = function(body) {
    captureMetrics();
    return originalJson(body);
  };
  
  // Sobrescribir res.send
  res.send = function(body) {
    captureMetrics();
    return originalSend(body);
  };
  
  next();
};

/**
 * Registrar operación crítica en métricas
 * @param {string} operation - Nombre de la operación (REGISTER, LOGIN, LOGOUT, ROLE_CHANGE)
 * @param {boolean} success - Si la operación fue exitosa
 */
function recordCriticalOperation(operation, success) {
  criticalOperationsTotal.inc({
    operation,
    success: success.toString(),
    taskId: 'AS-TASK-14'
  });
}

/**
 * Actualizar gauge de usuarios activos
 * @param {number} count - Número de usuarios activos
 */
function updateActiveUsers(count) {
  activeUsersGauge.set(
    { taskId: 'AS-TASK-14' },
    count
  );
}

/**
 * Obtener registro de métricas (para endpoint /metrics)
 * @returns {Object} - Registro de Prometheus
 */
function getRegister() {
  return register;
}

/**
 * Obtener métricas en formato Prometheus
 * @returns {Promise<string>} - Métricas en formato texto
 */
async function getMetrics() {
  return register.metrics();
}

module.exports = {
  metricsMiddleware,
  recordCriticalOperation,
  updateActiveUsers,
  getRegister,
  getMetrics
};
