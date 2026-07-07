/**
 * Configuración centralizada de ms-kpi.
 * Carga variables de entorno y expone valores tipados con valores por defecto seguros.
 */
const dotenv = require('dotenv');

dotenv.config();

/**
 * Parsea un entero desde variable de entorno con fallback.
 * @param {string|undefined} v - Valor crudo de process.env.
 * @param {number} fallback - Valor por defecto si el parseo falla.
 * @returns {number} Entero válido o fallback.
 */
const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Normaliza una URL base eliminando barra final y espacios.
 * @param {string|undefined} v - URL desde variable de entorno.
 * @param {string} fallback - URL por defecto si v está vacío.
 * @returns {string} URL base sin barra trailing.
 */
const trimBase = (v, fallback) => (v || fallback || '').trim().replace(/\/$/, '');

/**
 * Objeto de configuración exportado del microservicio KPI.
 * @type {{
 *   PORT: string|number;
 *   API_GATEWAY_PREFIX: string;
 *   projectManagerBaseUrl: string;
 *   projectManagerApiPrefix: string;
 *   internalRequestTimeoutMs: number;
 *   circuitBreaker: { failureThreshold: number; resetTimeoutMs: number; successThreshold: number };
 * }}
 */
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
