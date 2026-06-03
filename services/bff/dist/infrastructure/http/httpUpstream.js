"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { UpstreamError } = require('../../utils/errorHandler');
function joinUrl(base, pathWithQuery) {
    const b = String(base).replace(/\/$/, '');
    const p = String(pathWithQuery).startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
    return `${b}${p}`;
}
async function parseResponseBody(res) {
    if (res.status === 204)
        return undefined;
    const text = await res.text();
    if (!text)
        return undefined;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
        try {
            return JSON.parse(text);
        }
        catch {
            return { raw: text };
        }
    }
    return text;
}
/**
 * Petición HTTP JSON hacia un microservicio. Lanza UpstreamError si status no es 2xx.
 */
async function upstreamJson(url, { method = 'GET', headers = {}, body } = {}) {
    const h = { ...headers };
    const opts = { method, headers: h, redirect: 'manual' };
    if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
        opts.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (!h['Content-Type'] && !h['content-type']) {
            h['Content-Type'] = 'application/json';
        }
    }
    const res = await fetch(url, opts);
    const data = await parseResponseBody(res);
    if (!res.ok) {
        throw new UpstreamError(res.status, data);
    }
    return { status: res.status, data };
}
module.exports = { joinUrl, upstreamJson };
