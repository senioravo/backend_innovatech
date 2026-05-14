const projectManagerUpstreamClient = require('../clients/projectManagerUpstreamClient');

/**
 * Orquestación hacia **project-manager**: reenvío transparente de rutas bajo /api/v1.
 */
const projectManagerOrchestrationService = {
  forward(req) {
    return projectManagerUpstreamClient.forwardRequest(req);
  }
};

module.exports = projectManagerOrchestrationService;
