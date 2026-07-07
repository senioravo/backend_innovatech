/**
 * Controller de orquestación KPI en el BFF.
 * Agrega datos del dashboard desde ms-kpi y los adapta al contrato del frontend.
 */
import kpiOrchestrationService from '../../../application/kpi/kpiOrchestrationService.js';

const kpiOrchestrationController = {
  /**
   * GET dashboard KPI: resumen, proyectos y tareas recientes para el usuario autenticado.
   * @param {import('express').Request} req - Request con usuario autenticado (JWT o headers del gateway).
   * @param {import('express').Response} res - Response Express donde se serializa el payload adaptado.
   * @param {import('express').NextFunction} next - Callback para delegar errores al manejador global.
   * @returns {Promise<void>}
   */
  async getDashboard(req, res, next) {
    try {
      const payload = await kpiOrchestrationService.getDashboard(req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
};

export default kpiOrchestrationController;
