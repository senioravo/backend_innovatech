import resourceAvailabilityService from '../services/resourceAvailabilityService.js';
import {
  projectAvailabilityToDto,
  taskAvailabilityToDto
} from '../dtos/resourceAvailabilityDto.js';

const resourceAvailabilityController = {
  async checkProject(req, res, next) {
    try {
      const project = await resourceAvailabilityService.assertProjectAvailable(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.json(projectAvailabilityToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async checkTask(req, res, next) {
    try {
      const task = await resourceAvailabilityService.assertTaskAvailable(req.params.id, req.user.id);
      res.json(taskAvailabilityToDto(task));
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
      res.json(taskAvailabilityToDto(task));
    } catch (error) {
      next(error);
    }
  }
};

export default resourceAvailabilityController;
