/**
 * Controller HTTP de consultas y reportes.
 * Expone dashboard de tareas, KPIs y exportación de reportes según rol del usuario.
 */
import consultationService from '../services/consultationService.js';
import { normalizeExportFormat } from '../dtos/consultationDto.js';

const consultationController = {
  /**
   * GET /api/v1/consultations/dashboard — Dashboard de tareas del usuario o vista global.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getTaskDashboard(req, res, next) {
    try {
      const payload = await consultationService.getTaskDashboardForUser(req.user.id, req.user.role);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/consultations/kpis — KPIs de avance, recursos y productividad.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getKpis(req, res, next) {
    try {
      const payload = await consultationService.getKpisForUser(req.user.id, req.user.role);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/consultations/reports/export — Exporta reporte CSV o JSON como descarga.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async exportReport(req, res, next) {
    try {
      const format = normalizeExportFormat(req.query.format);
      const { contentType, body } = await consultationService.exportReport(
        req.user.id,
        format,
        req.user.role
      );
      const ext = format === 'json' ? 'json' : 'csv';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="reporte-innovatech.${ext}"`);
      res.send(body);
    } catch (error) {
      next(error);
    }
  }
};

export default consultationController;
