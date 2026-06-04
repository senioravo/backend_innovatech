"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../../config');
const { joinUrl, upstreamJson } = require('../http/httpUpstream');
function pickForwardHeaders(req) {
    const out = {};
    if (req.headers.authorization) {
        out.Authorization = req.headers.authorization;
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
module.exports = projectManagerUpstreamClient;
