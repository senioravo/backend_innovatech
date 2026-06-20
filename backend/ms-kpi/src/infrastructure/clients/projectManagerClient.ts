// @ts-nocheck
export {};
const config = require('../../config');
const { createInternalHttpClient } = require('../http/internalHttpClient');

let httpClient;

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

function joinUrl(base, path) {
  return `${String(base).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function authHeaders(req) {
  const out = {};
  if (req.headers.authorization) out.Authorization = req.headers.authorization;
  if (req.headers['x-user-id']) out['X-User-Id'] = req.headers['x-user-id'];
  if (req.headers['x-user-email']) out['X-User-Email'] = req.headers['x-user-email'];
  if (req.headers['x-user-role']) out['X-User-Role'] = req.headers['x-user-role'];
  return out;
}

const projectManagerClient = {
  async getTaskDashboard(req) {
    const url = joinUrl(
      config.projectManagerBaseUrl,
      `${config.projectManagerApiPrefix}/consultations/dashboard`
    );
    return getClient().fetchJson('GET', url, { headers: authHeaders(req) });
  },

  async listProjects(req) {
    const url = joinUrl(config.projectManagerBaseUrl, `${config.projectManagerApiPrefix}/projects`);
    return getClient().fetchJson('GET', url, { headers: authHeaders(req) });
  },

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
