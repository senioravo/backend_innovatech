import projectManagerOrchestrationService from '../../../application/projectManager/projectManagerOrchestrationService.js';

const projectManagerOrchestrationController = {
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