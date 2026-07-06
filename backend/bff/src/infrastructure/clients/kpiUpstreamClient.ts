/**
 * Cliente HTTP del BFF hacia ms-kpi.
 * Reenvía headers de identidad del usuario y usa upstreamJson con X-Request-Id.
 */
import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';

/**
 * Extrae headers a reenviar al microservicio KPI (auth e identidad del usuario).
 * @param {import('express').Request} req - Request entrante al BFF.
 * @returns {Record<string, string>} Headers listos para la petición upstream.
 */
function pickForwardHeaders(req) {
  const out: Record<string, string> = {};
  if (req.headers.authorization) out.Authorization = req.headers.authorization;
  if (req.headers['x-user-id']) out['X-User-Id'] = req.headers['x-user-id'];
  if (req.headers['x-user-email']) out['X-User-Email'] = req.headers['x-user-email'];
  if (req.headers['x-user-role']) out['X-User-Role'] = req.headers['x-user-role'];
  const ct = req.headers['content-type'];
  if (ct) out['Content-Type'] = ct;
  return out;
}

const kpiUpstreamClient = {
  /**
   * Obtiene el dashboard agregado de KPIs desde ms-kpi.
   * @param {import('express').Request} req - Request con headers de autenticación e identidad.
   * @returns {Promise<{ status: number; data?: object }>} Respuesta upstream con resumen, proyectos y tareas.
   */
  getDashboard(req) {
    const path = `${config.kpiApiPrefix}/kpis/dashboard`;
    return upstreamJson(joinUrl(config.kpiBaseUrl, path), {
      method: 'GET',
      headers: pickForwardHeaders(req)
    });
  }
};

export default kpiUpstreamClient;
