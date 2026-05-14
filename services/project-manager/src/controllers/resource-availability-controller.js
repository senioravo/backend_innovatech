const resourceAvailabilityService = require('../services/resourceAvailabilityService');

/**
 * Respuestas HTTP para comprobar disponibilidad sin mutar el recurso.
 */
const resourceAvailabilityController = {
  checkProject(req, res, next) {
    try {
      const project = resourceAvailabilityService.assertProjectAvailable(
        req.params.id,
        req.user.id
      );
      res.json({
        disponible: true,
        recurso: 'proyecto',
        id: project.id
      });
    } catch (error) {
      next(error);
    }
  },

  checkTask(req, res, next) {
    try {
      const task = resourceAvailabilityService.assertTaskAvailable(req.params.id, req.user.id);
      res.json({
        disponible: true,
        recurso: 'tarea',
        id: task.id,
        projectId: task.projectId
      });
    } catch (error) {
      next(error);
    }
  },

  checkTaskInProject(req, res, next) {
    try {
      const task = resourceAvailabilityService.assertTaskInProject(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json({
        disponible: true,
        recurso: 'tarea',
        id: task.id,
        proyectoId: task.projectId
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = resourceAvailabilityController;
