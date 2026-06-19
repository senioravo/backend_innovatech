// @ts-nocheck
export {};
const kpiService = require('../../application/kpiService');

const kpiController = {
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
