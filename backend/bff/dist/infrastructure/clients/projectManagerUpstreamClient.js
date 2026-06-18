// @ts-nocheck
import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';
function pickForwardHeaders(req) {
    const out = {};
    // Reenviar token JWT al microservicio
    if (req.headers.authorization) {
        out.Authorization = req.headers.authorization;
    }
    // Reenviar headers X-User-* para que PM los pueda usar
    if (req.headers['x-user-id']) {
        out['X-User-Id'] = req.headers['x-user-id'];
    }
    if (req.headers['x-user-email']) {
        out['X-User-Email'] = req.headers['x-user-email'];
    }
    if (req.headers['x-user-role']) {
        out['X-User-Role'] = req.headers['x-user-role'];
    }
    const ct = req.headers['content-type'];
    if (ct)
        out['Content-Type'] = ct;
    return out;
}
function shouldSendJsonBody(method, body) {
    if (method === 'GET' || method === 'HEAD')
        return false;
    if (body === undefined || body === null)
        return false;
    if (typeof body === 'object' && Object.keys(body).length === 0)
        return false;
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
;
