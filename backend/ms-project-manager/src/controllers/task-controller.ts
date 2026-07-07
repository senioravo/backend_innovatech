/**
 * Controller HTTP de tareas.
 * Serializa entidades con taskToDto y registra auditoría en operaciones de escritura.
 */
import taskService from '../services/taskService.js';
import { taskToDto } from '../dtos/taskDto.js';
import { auditFromRequest } from '../utils/auditLog.js';

const taskController = {
  /**
   * GET /api/v1/projects/:projectId/tasks — Lista tareas de un proyecto.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async listTasksForProject(req, res, next) {
    try {
      const tasks = await taskService.listTasksByProject(
        req.params.projectId,
        req.user.id,
        req.user.role
      );
      res.json({ tasks: tasks.map(taskToDto) });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/projects/:projectId/tasks — Crea una tarea y audita TASK_CREATE.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTaskFromRequest(
        req.params.projectId,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'TASK_CREATE',
        resource: 'task',
        resourceId: task.id,
        projectId: req.params.projectId
      });

      res.status(201).json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/projects/:projectId/tasks/:taskId/status — Actualiza estado y audita TASK_STATUS_UPDATE.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async patchTaskStatus(req, res, next) {
    try {
      const task = await taskService.updateTaskStatusFromRequest(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'TASK_STATUS_UPDATE',
        resource: 'task',
        resourceId: req.params.taskId,
        projectId: req.params.projectId,
        meta: { status: req.body.status }
      });

      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/projects/:projectId/tasks/:taskId — Detalle de tarea en proyecto.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getTask(req, res, next) {
    try {
      const task = await taskService.getTask(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/tasks/:id — Actualiza tarea y audita TASK_UPDATE.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTaskFromRequest(req.params.id, req.user.id, req.body);

      auditFromRequest(req, {
        action: 'TASK_UPDATE',
        resource: 'task',
        resourceId: req.params.id,
        meta: { fields: Object.keys(req.body) }
      });

      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/tasks/:id/assignee — Asigna responsable y audita TASK_ASSIGNEE.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async assignAssignee(req, res, next) {
    try {
      const task = await taskService.assignAssigneeFromRequest(
        req.params.id,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'TASK_ASSIGNEE',
        resource: 'task',
        resourceId: req.params.id,
        meta: { assigneeId: req.body.assigneeId }
      });

      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/tasks/:id — Elimina tarea y audita TASK_DELETE.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);

      auditFromRequest(req, {
        action: 'TASK_DELETE',
        resource: 'task',
        resourceId: req.params.id
      });

      res.status(200).json({ ok: true });
    } catch (error) {
      next(error);
    }
  }
};

export default taskController;
