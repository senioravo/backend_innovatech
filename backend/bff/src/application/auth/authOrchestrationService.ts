// @ts-nocheck
import authUpstreamClient from '../../infrastructure/clients/authUpstreamClient.js';

/**
 * Capa de aplicación: orquestación hacia **auth** (sin reglas de dominio del BFF).
 */
const authOrchestrationService = {
  register(body) {
    return authUpstreamClient.register(body);
  },

  login(body) {
    return authUpstreamClient.login(body);
  },

  logout(req) {
    return authUpstreamClient.logout(req);
  },

  getRoles() {
    return authUpstreamClient.getRoles();
  },

  getRolesSimple() {
    return authUpstreamClient.getRolesSimple();
  },

  updateUserRole(userId, body, req) {
    return authUpstreamClient.updateUserRole(userId, body, req);
  },

  health() {
    return authUpstreamClient.health();
  },

  getUserById(userId, req) {
    return authUpstreamClient.getUserById(userId, req);
  }
};

export default authOrchestrationService;