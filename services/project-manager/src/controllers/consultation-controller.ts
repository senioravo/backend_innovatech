// @ts-nocheck
export {};
const consultationService = require('../services/consultationService');

const consultationController = {
  async getTaskDashboard(req, res, next) {
    try {
      const payload = await consultationService.getTaskDashboardForUser(req.user.id);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = consultationController;
