export {};
const proyectosOrchestrationService = require('../../../application/proyectos/proyectosOrchestrationService');

const proyectosOrchestrationController = {
  async listProyectos(req, res, next) {
    try {
      const payload = await proyectosOrchestrationService.listProyectos(req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },

  async listTareas(req, res, next) {
    try {
      const payload = await proyectosOrchestrationService.listTareasByProyecto(req.params.id, req);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = proyectosOrchestrationController;
