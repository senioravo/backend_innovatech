const authUpstreamClient = require('../clients/authUpstreamClient');

/**
 * Orquestación hacia el microservicio **auth** (sin lógica de negocio en el BFF).
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
  }
};

module.exports = authOrchestrationService;
