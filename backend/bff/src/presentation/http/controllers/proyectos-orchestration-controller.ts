/**
 * Controller de orquestación de proyectos y tareas en el BFF.
 * Combina datos de project-manager con contexto de sesión y usuarios de ms-auth.
 */
import proyectosOrchestrationService from '../../../application/proyectos/proyectosOrchestrationService.js';

const proyectosOrchestrationController = {
  /**
   * GET listado de proyectos con usuario de sesión, permisos y assignees resueltos.
   * @param {import('express').Request} req - Request con usuario autenticado.
   * @param {import('express').Response} res - Response Express donde se serializa el listado adaptado.
   * @param {import('express').NextFunction} next - Callback para delegar errores al manejador global.
   * @returns {Promise<void>}
   */
  async listProyectos(req, res, next) {
    try {
      const payload = await proyectosOrchestrationService.listProyectos(req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET tareas de un proyecto con assignees resueltos y resumen por estado.
   * @param {import('express').Request} req - Request con `params.id` (identificador del proyecto).
   * @param {import('express').Response} res - Response Express donde se serializa tareas y summary.
   * @param {import('express').NextFunction} next - Callback para delegar errores al manejador global.
   * @returns {Promise<void>}
   */
  async listTareas(req, res, next) {
    try {
      const payload = await proyectosOrchestrationService.listTareasByProyecto(req.params.id, req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
};

export default proyectosOrchestrationController;
