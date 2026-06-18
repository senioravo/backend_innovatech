// @ts-nocheck
import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';
function pickForwardHeaders(req) {
    const out = {};
    if (req.headers.authorization) {
        out.Authorization = req.headers.authorization;
    }
    return out;
}
const authUpstreamClient = {
    _url(path) {
        return joinUrl(config.authServiceBaseUrl, `${config.authApiPrefix}${path}`);
    },
    register(body) {
        return upstreamJson(this._url('/register'), { method: 'POST', body });
    },
    login(body) {
        return upstreamJson(this._url('/login'), { method: 'POST', body });
    },
    logout(req) {
        return upstreamJson(this._url('/logout'), {
            method: 'POST',
            headers: pickForwardHeaders(req)
        });
    },
    getRoles() {
        return upstreamJson(this._url('/roles'), { method: 'GET' });
    },
    getRolesSimple() {
        return upstreamJson(this._url('/roles/simple'), { method: 'GET' });
    },
    updateUserRole(userId, body, req) {
        return upstreamJson(this._url(`/usuarios/${encodeURIComponent(userId)}/rol`), {
            method: 'PUT',
            body,
            headers: pickForwardHeaders(req)
        });
    },
    health() {
        return upstreamJson(this._url('/health'), { method: 'GET' });
    },
    getUserById(userId, req) {
        return upstreamJson(this._url(`/usuarios/${encodeURIComponent(userId)}`), {
            method: 'GET',
            headers: pickForwardHeaders(req)
        });
    }
};
export default authUpstreamClient;
;
