export {};
const kpiOrchestrationService = require('../../../application/kpi/kpiOrchestrationService');

const kpiOrchestrationController = {
  async getDashboard(req, res, next) {
    try {
      const payload = await kpiOrchestrationService.getDashboard(req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = kpiOrchestrationController;
