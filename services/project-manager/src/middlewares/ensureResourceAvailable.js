const resourceAvailabilityService = require('../services/resourceAvailabilityService');

/**
 * Loads project if it exists and belongs to the user; sets req.availableProject.
 * @param {string} paramName - req.params key (e.g. 'id', 'projectId')
 */
function ensureProjectAvailable(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const projectId = req.params[paramName];
      req.availableProject = await resourceAvailabilityService.assertProjectAvailable(
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
 * Loads task if it exists for the user via project ownership; sets req.availableTask.
 */
function ensureTaskAvailable(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const taskId = req.params[paramName];
      req.availableTask = await resourceAvailabilityService.assertTaskAvailable(taskId, req.user.id);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Validates task within project; sets req.availableTask.
 */
function ensureTaskInProject(projectParam = 'projectId', taskParam = 'taskId') {
  return async (req, res, next) => {
    try {
      const projectId = req.params[projectParam];
      const taskId = req.params[taskParam];
      req.availableTask = await resourceAvailabilityService.assertTaskInProject(
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
