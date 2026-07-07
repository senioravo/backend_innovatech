import authUpstreamClient from '../../infrastructure/clients/authUpstreamClient.js';

/**
 * Capa de aplicación: orquestación hacia **ms-auth** (sin reglas de dominio del BFF).
 * Cada método delega en authUpstreamClient y retorna `{ status, data }`.
 */
const authOrchestrationService = {
  /** @param {object} body - Datos de registro */
  register(body) {
    return authUpstreamClient.register(body);
  },

  /** @param {object} body - email y password */
  login(body) {
    return authUpstreamClient.login(body);
  },

  /** @param {import('express').Request} req - Request con Authorization */
  logout(req) {
    return authUpstreamClient.logout(req);
  },

  /** Roles con permisos desde ms-auth */
  getRoles() {
    return authUpstreamClient.getRoles();
  },

  /** Nombres de roles (endpoint simple) */
  getRolesSimple() {
    return authUpstreamClient.getRolesSimple();
  },

  /**
   * @param {string|number} userId
   * @param {object} body
   * @param {import('express').Request} req
   */
  updateUserRole(userId, body, req) {
    return authUpstreamClient.updateUserRole(userId, body, req);
  },

  health() {
    return authUpstreamClient.health();
  },

  /**
   * @param {string|number} userId
   * @param {import('express').Request} req
   */
  getUserById(userId, req) {
    return authUpstreamClient.getUserById(userId, req);
  }
};

export default authOrchestrationService;
