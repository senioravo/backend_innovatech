// @ts-nocheck
import taskService from '../services/taskService.js';
import { taskToDto } from '../dtos/taskDto.js';
import { auditFromRequest } from '../utils/auditLog.js';

const taskController = {
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

  async patchTaskStatus(req, res, next) {
    try {
      const task = await taskService.updateTaskStatusFromRequest(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        req.user.role,
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

  async getTask(req, res, next) {
    try {
      const task = await taskService.getTask(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        req.user.role
      );
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

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
