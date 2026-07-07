/**
 * Controller de orquestación hacia **project-manager** en el BFF.
 * Reenvía peticiones HTTP y serializa la respuesta upstream (204, JSON o vacío).
 */
import projectManagerOrchestrationService from '../../../application/projectManager/projectManagerOrchestrationService.js';

const projectManagerOrchestrationController = {
  /**
   * Reenvía la petición entrante al microservicio project-manager y devuelve su respuesta.
   * Normaliza 204 a `{ ok: true }` con status 200 para compatibilidad con el frontend.
   * @param {import('express').Request} req - Request original (método, path, query, body y headers).
   * @param {import('express').Response} res - Response Express donde se escribe status y cuerpo upstream.
   * @param {import('express').NextFunction} next - Callback para delegar errores al manejador global.
   * @returns {Promise<void>}
   */
  async forward(req, res, next) {
    try {
      const { status, data } = await projectManagerOrchestrationService.forward(req);
      if (status === 204) {
        return res.status(200).json({ ok: true });
      }
      if (data === undefined) {
        return res.status(status).end();
      }
      return res.status(status).json(data);
    } catch (err) {
      next(err);
    }
  }
};

export default projectManagerOrchestrationController;
