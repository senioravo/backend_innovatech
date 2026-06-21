// @ts-nocheck
import consultationService from '../services/consultationService.js';

const consultationController = {
  async getTaskDashboard(req, res, next) {
    try {
      const payload = await consultationService.getTaskDashboardForUser(req.user.id, req.user.role);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },

  async getKpis(req, res, next) {
    try {
      const payload = await consultationService.getKpisForUser(req.user.id, req.user.role);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },

  async exportReport(req, res, next) {
    try {
      const format = String(req.query.format || 'csv').toLowerCase();
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
