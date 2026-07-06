/**
 * Cliente HTTP del BFF hacia ms-auth.
 * Reenvía Authorization en rutas protegidas y usa upstreamJson con X-Request-Id.
 */
import config from '../../config/index.js';
import { joinUrl, upstreamJson } from '../http/httpUpstream.js';

/**
 * Extrae headers a reenviar al microservicio auth (Bearer token).
 * @param {import('express').Request} req
 * @returns {Record<string, string>}
 */
function pickForwardHeaders(req) {
  const out: Record<string, string> = {};
  if (req.headers.authorization) {
    out.Authorization = req.headers.authorization;
  }
  return out;
}

const authUpstreamClient = {
  /**
   * Construye URL absoluta hacia ms-auth.
   * @param {string} path - Ruta relativa bajo authApiPrefix
   * @returns {string}
   */
  _url(path) {
    return joinUrl(config.authServiceBaseUrl, `${config.authApiPrefix}${path}`);
  },

  /** @param {object} body - Datos de registro */
  register(body) {
    return upstreamJson(this._url('/register'), { method: 'POST', body });
  },

  /** @param {object} body - email y password */
  login(body) {
    return upstreamJson(this._url('/login'), { method: 'POST', body });
  },

  /** @param {import('express').Request} req - Request con Authorization */
  logout(req) {
    return upstreamJson(this._url('/logout'), {
      method: 'POST',
      headers: pickForwardHeaders(req)
    });
  },

  /** Lista roles con permisos desde ms-auth */
  getRoles() {
    return upstreamJson(this._url('/roles'), { method: 'GET' });
  },

  /** Lista nombres de roles (endpoint simple) */
  getRolesSimple() {
    return upstreamJson(this._url('/roles/simple'), { method: 'GET' });
  },

  /**
   * Actualiza rol de usuario (solo directivo/gestor vía auth).
   * @param {string|number} userId
   * @param {object} body - { rol | role }
   * @param {import('express').Request} req
   */
  updateUserRole(userId, body, req) {
    return upstreamJson(this._url(`/usuarios/${encodeURIComponent(userId)}/rol`), {
      method: 'PUT',
      body,
      headers: pickForwardHeaders(req)
    });
  },

  /** Health check de ms-auth */
  health() {
    return upstreamJson(this._url('/health'), { method: 'GET' });
  },

  /**
   * Obtiene usuario por id (requiere token).
   * @param {string|number} userId
   * @param {import('express').Request} req
   */
  getUserById(userId, req) {
    return upstreamJson(this._url(`/usuarios/${encodeURIComponent(userId)}`), {
      method: 'GET',
      headers: pickForwardHeaders(req)
    });
  }
};

export default authUpstreamClient;
