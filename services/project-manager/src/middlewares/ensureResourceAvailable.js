const resourceAvailabilityService = require('../services/resourceAvailabilityService');

/**
 * Carga el proyecto si existe y pertenece al usuario; expone req.availableProject.
 * @param {string} paramName - nombre del parámetro en req.params (p. ej. 'id', 'projectId')
 */
function ensureProjectAvailable(paramName = 'id') {
  return (req, res, next) => {
    try {
      const projectId = req.params[paramName];
      req.availableProject = resourceAvailabilityService.assertProjectAvailable(
        projectId,
        req.user.id
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Carga la tarea si existe y pertenece al usuario vía proyecto; expone req.availableTask.
 */
function ensureTaskAvailable(paramName = 'id') {
  return (req, res, next) => {
    try {
      const taskId = req.params[paramName];
      req.availableTask = resourceAvailabilityService.assertTaskAvailable(taskId, req.user.id);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Valida tarea dentro del proyecto; expone req.availableTask.
 */
function ensureTaskInProject(projectParam = 'projectId', taskParam = 'taskId') {
  return (req, res, next) => {
    try {
      const projectId = req.params[projectParam];
      const taskId = req.params[taskParam];
      req.availableTask = resourceAvailabilityService.assertTaskInProject(
        projectId,
        taskId,
        req.user.id
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  ensureProjectAvailable,
  ensureTaskAvailable,
  ensureTaskInProject
};
