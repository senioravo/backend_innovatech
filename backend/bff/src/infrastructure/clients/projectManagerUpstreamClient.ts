/**
 * Cliente HTTP del BFF hacia **project-manager**.
 * Reenvía identidad del usuario, lista recursos y soporta proxy transparente de peticiones.
 */
import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';

/**
 * Extrae headers a reenviar al microservicio project-manager (auth e identidad del usuario).
 * Resuelve identidad desde headers del gateway, aliases legacy o `req.user`.
 * @param {import('express').Request} req - Request entrante al BFF.
 * @returns {Record<string, string>} Headers listos para la petición upstream.
 */
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

/**
 * Determina si debe enviarse cuerpo JSON en la petición upstream.
 * @param {string} method - Método HTTP (GET, POST, etc.).
 * @param {unknown} body - Cuerpo parseado del request entrante.
 * @returns {boolean} true si el body debe incluirse en la petición upstream.
 */
function shouldSendJsonBody(method, body) {
  if (method === 'GET' || method === 'HEAD') return false;
  if (body === undefined || body === null) return false;
  if (typeof body === 'object' && Object.keys(body).length === 0) return false;
  return true;
}

/**
 * Alias de pickForwardHeaders para rutas autenticadas de project-manager.
 * @param {import('express').Request} req - Request entrante al BFF.
 * @returns {Record<string, string>} Headers de autenticación e identidad.
 */
function authHeaders(req) {
  return pickForwardHeaders(req);
}

const projectManagerUpstreamClient = {
  /**
   * Lista proyectos desde project-manager.
   * @param {import('express').Request} req - Request con headers de autenticación.
   * @returns {Promise<{ status: number; data?: { projects?: object[] } }>}
   */
  listProjects(req) {
    const path = `${config.projectManagerApiPrefix}/projects`;
    return upstreamJson(joinUrl(config.projectManagerBaseUrl, path), {
      method: 'GET',
      headers: authHeaders(req)
    });
  },

  /**
   * Lista tareas de un proyecto desde project-manager.
   * @param {string|number} projectId - Identificador del proyecto.
   * @param {import('express').Request} req - Request con headers de autenticación.
   * @returns {Promise<{ status: number; data?: { tasks?: object[] } }>}
   */
  listTasksByProject(projectId, req) {
    const path = `${config.projectManagerApiPrefix}/projects/${encodeURIComponent(projectId)}/tasks`;
    return upstreamJson(joinUrl(config.projectManagerBaseUrl, path), {
      method: 'GET',
      headers: authHeaders(req)
    });
  },

  /**
   * Reenvía la petición tal cual path+query que recibe el BFF (mismo prefijo /api/v1 que en PM).
   * @param {import('express').Request} req - Request original (método, URL, body y headers).
   * @returns {Promise<{ status: number; data?: unknown }>} Respuesta upstream sin transformar.
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
