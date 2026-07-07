/**
 * Capa de aplicación: orquestación hacia **project-manager** (reenvío HTTP).
 * Delega en projectManagerUpstreamClient sin aplicar reglas de dominio adicionales.
 */
import projectManagerUpstreamClient from '../../infrastructure/clients/projectManagerUpstreamClient.js';

const projectManagerOrchestrationService = {
  /**
   * Reenvía la petición HTTP entrante al microservicio project-manager.
   * @param {import('express').Request} req - Request original del BFF (método, URL, body y headers).
   * @returns {Promise<{ status: number; data?: unknown }>} Respuesta upstream con código HTTP y cuerpo opcional.
   */
  forward(req) {
    return projectManagerUpstreamClient.forwardRequest(req);
  }
};

export default projectManagerOrchestrationService;
