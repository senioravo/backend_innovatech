import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';

function pickForwardHeaders(req) {
  const out: Record<string, string> = {};
  const pick = (name: string) => {
    const v = req.headers[name];
    if (v == null) return undefined;
    return Array.isArray(v) ? String(v[0]) : String(v);
  };

  const auth = pick('authorization');
  if (auth) out.Authorization = auth;

  const userId = pick('x-user-id') ?? pick('id') ?? (req.user?.id != null ? String(req.user.id) : undefined);
  const userEmail = pick('x-user-email') ?? pick('email') ?? req.user?.email;
  const userRole = pick('x-user-role') ?? pick('rol') ?? req.user?.role;

  if (userId) out['X-User-Id'] = userId;
  if (userEmail) out['X-User-Email'] = userEmail;
  if (userRole) out['X-User-Role'] = userRole;

  const ct = pick('content-type');
  if (ct) out['Content-Type'] = ct;
  return out;
}

function shouldSendJsonBody(method, body) {
  if (method === 'GET' || method === 'HEAD') return false;
  if (body === undefined || body === null) return false;
  if (typeof body === 'object' && Object.keys(body).length === 0) return false;
  return true;
}

function authHeaders(req) {
  return pickForwardHeaders(req);
}

const projectManagerUpstreamClient = {
  listProjects(req) {
    const path = `${config.projectManagerApiPrefix}/projects`;
    return upstreamJson(joinUrl(config.projectManagerBaseUrl, path), {
      method: 'GET',
      headers: authHeaders(req)
    });
  },

  listTasksByProject(projectId, req) {
    const path = `${config.projectManagerApiPrefix}/projects/${encodeURIComponent(projectId)}/tasks`;
    return upstreamJson(joinUrl(config.projectManagerBaseUrl, path), {
      method: 'GET',
      headers: authHeaders(req)
    });
  },

  /**
   * Reenvía la petición tal cual path+query que recibe el BFF (mismo prefijo /api/v1 que en PM).
   */
  forwardRequest(req) {
    const pathAndQuery = req.originalUrl || req.url || '/';
    const url = joinUrl(config.projectManagerBaseUrl, pathAndQuery);
    const method = req.method || 'GET';
    const body = shouldSendJsonBody(method, req.body) ? req.body : undefined;
    return upstreamJson(url, {
      method,
      headers: pickForwardHeaders(req),
      body
    });
  }
};

export default projectManagerUpstreamClient;