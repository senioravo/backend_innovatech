// @ts-nocheck
import projectManagerUpstreamClient from '../../infrastructure/clients/projectManagerUpstreamClient.js';

/**
 * Capa de aplicación: orquestación hacia **project-manager** (reenvío HTTP).
 */
const projectManagerOrchestrationService = {
  forward(req) {
    return projectManagerUpstreamClient.forwardRequest(req);
  }
};

export default projectManagerOrchestrationService;