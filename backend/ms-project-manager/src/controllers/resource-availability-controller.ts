/**
 * Controller HTTP de disponibilidad de recursos.
 * Verifica acceso a proyectos y tareas antes de operaciones sensibles.
 */
import resourceAvailabilityService from '../services/resourceAvailabilityService.js';
import {
  projectAvailabilityToDto,
  taskAvailabilityToDto
} from '../dtos/resourceAvailabilityDto.js';

const resourceAvailabilityController = {
  /**
   * GET /api/v1/projects/:id/availability — Verifica disponibilidad de un proyecto.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
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

  /**
   * GET /api/v1/tasks/:id/availability — Verifica disponibilidad de una tarea.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async checkTask(req, res, next) {
    try {
      const task = await resourceAvailabilityService.assertTaskAvailable(req.params.id, req.user.id);
      res.json(taskAvailabilityToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/projects/:projectId/tasks/:taskId/availability — Verifica tarea dentro de proyecto.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
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
