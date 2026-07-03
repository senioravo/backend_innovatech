const config = require('../../config');
const { createInternalHttpClient } = require('../http/internalHttpClient');

let httpClient;

/**
 * Cliente HTTP singleton con circuit breaker hacia ms-project-manager.
 * @returns {ReturnType<typeof createInternalHttpClient>}
 */
function getClient() {
  if (!httpClient) {
    httpClient = createInternalHttpClient({
      serviceName: 'project-manager',
      failureThreshold: config.circuitBreaker.failureThreshold,
      resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
      successThreshold: config.circuitBreaker.successThreshold,
      defaultTimeoutMs: config.internalRequestTimeoutMs
    });
  }
  return httpClient;
}

/**
 * Une base URL y path evitando dobles barras.
 * @param {string} base - URL base del servicio
 * @param {string} path - Ruta relativa
 * @returns {string}
 */
function joinUrl(base, path) {
  return `${String(base).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Reenvía headers de autenticación del request entrante al servicio upstream.
 * @param {import('express').Request} req
 * @returns {Record<string, string>}
 */
function authHeaders(req) {
  const out: Record<string, string> = {};
  if (req.headers.authorization) out.Authorization = req.headers.authorization;
  if (req.headers['x-user-id']) out['X-User-Id'] = req.headers['x-user-id'];
  if (req.headers['x-user-email']) out['X-User-Email'] = req.headers['x-user-email'];
  if (req.headers['x-user-role']) out['X-User-Role'] = req.headers['x-user-role'];
  return out;
}

/**
 * Cliente interno hacia ms-project-manager para consultas de KPI.
 */
const projectManagerClient = {
  /**
   * Dashboard de tareas desde project-manager (consultations).
   * @param {import('express').Request} req
   * @returns {Promise<{ tasks?: unknown[]; countByStatus?: Record<string, number>; total?: number }>}
   */
  async getTaskDashboard(req) {
    const url = joinUrl(
      config.projectManagerBaseUrl,
      `${config.projectManagerApiPrefix}/consultations/dashboard`
    );
    return getClient().fetchJson('GET', url, { headers: authHeaders(req) });
  },

  /**
   * Lista proyectos del usuario autenticado.
   * @param {import('express').Request} req
   * @returns {Promise<{ projects?: unknown[] }>}
   */
  async listProjects(req) {
    const url = joinUrl(config.projectManagerBaseUrl, `${config.projectManagerApiPrefix}/projects`);
    return getClient().fetchJson('GET', url, { headers: authHeaders(req) });
  },

  /**
   * Verifica conectividad con project-manager (health + estado del circuit breaker).
   * @returns {Promise<{ reachable: boolean; circuit: string; response?: unknown; reason?: string }>}
   */
  async getDependencyStatus() {
    const url = joinUrl(config.projectManagerBaseUrl, '/health');
    try {
      const body = await getClient().fetchJson('GET', url);
      return { reachable: true, circuit: getClient().getBreakerState().state, response: body };
    } catch (err) {
      return {
        reachable: false,
        circuit: getClient().getBreakerState().state,
        reason: err.message
      };
    }
  }
};

module.exports = projectManagerClient;
