export {};
const dotenv = require('dotenv');

dotenv.config();

const trimBase = (v, fallback) => (v || fallback || '').trim().replace(/\/$/, '');

module.exports = {
  PORT: parseInt(process.env.PORT || '3010', 10) || 3010,
  JWT_SECRET: process.env.JWT_SECRET || 'cambiar_en_produccion',
  API_GATEWAY_PREFIX: (process.env.API_GATEWAY_PREFIX || '/api/v1').trim() || '/api/v1',
  /** Base URL del microservicio auth (sin barra final). Ej: http://localhost:3001 */
  authServiceBaseUrl: trimBase(process.env.AUTH_SERVICE_BASE_URL, 'http://localhost:3001'),
  /** Prefijo de rutas expuesto por auth (coincide con auth/src/app.js). */
  authApiPrefix: (process.env.AUTH_API_PREFIX || '/api/auth').trim() || '/api/auth',
  /** Base URL del microservicio project-manager. */
  projectManagerBaseUrl: trimBase(process.env.PROJECT_MANAGER_BASE_URL, 'http://localhost:3002'),
  /** Prefijo API de project-manager (coincide con API_GATEWAY_PREFIX del PM). */
  projectManagerApiPrefix: (process.env.PROJECT_MANAGER_API_PREFIX || '/api/v1').trim() || '/api/v1'
};
