const projectManagerOrchestrationService = require('../services/projectManagerOrchestrationService');

const projectManagerOrchestrationController = {
  async forward(req, res, next) {
    try {
      const { status, data } = await projectManagerOrchestrationService.forward(req);
      if (status === 204) {
        return res.status(204).send();
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

module.exports = projectManagerOrchestrationController;
