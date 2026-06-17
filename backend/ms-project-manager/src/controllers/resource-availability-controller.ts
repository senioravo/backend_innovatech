// @ts-nocheck
import resourceAvailabilityService from '../services/resourceAvailabilityService.js';

const resourceAvailabilityController = {
  async checkProject(req, res, next) {
    try {
      const project = await resourceAvailabilityService.assertProjectAvailable(
        req.params.id,
        req.user.id
      );
      res.json({
        available: true,
        resource: 'project',
        id: project.id
      });
    } catch (error) {
      next(error);
    }
  },

  async checkTask(req, res, next) {
    try {
      const task = await resourceAvailabilityService.assertTaskAvailable(req.params.id, req.user.id);
      res.json({
        available: true,
        resource: 'task',
        id: task.id,
        projectId: task.projectId
      });
    } catch (error) {
      next(error);
    }
  },

  async checkTaskInProject(req, res, next) {
    try {
      const task = await resourceAvailabilityService.assertTaskInProject(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json({
        available: true,
        resource: 'task',
        id: task.id,
        projectId: task.projectId
      });
    } catch (error) {
      next(error);
    }
  }
};

export default resourceAvailabilityController;;