export {};
const projectManagerUpstreamClient = require('../../infrastructure/clients/projectManagerUpstreamClient');

/**
 * Capa de aplicación: orquestación hacia **project-manager** (reenvío HTTP).
 */
const projectManagerOrchestrationService = {
  forward(req) {
    return projectManagerUpstreamClient.forwardRequest(req);
  }
};

module.exports = projectManagerOrchestrationService;
