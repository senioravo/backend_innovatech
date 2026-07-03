const kpiService = require('../../application/kpiService');

/**
 * Controlador HTTP del microservicio KPI.
 * Expone endpoints bajo /api/v1/kpis (montados vía apiGateway).
 */
const kpiController = {
  /**
   * GET /api/v1/kpis/dashboard — resumen de proyectos, tareas y métricas del usuario autenticado.
   * @param {import('express').Request} req - req.user.id desde authMiddleware
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getDashboard(req, res, next) {
    try {
      const payload = await kpiService.getDashboard(req.user.id, req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = kpiController;
