const taskService = require('../services/taskService');
const ValidationService = require('../services/validationService');
const { createTaskDto, taskToDto, pickTaskScheduleFields } = require('../dtos/taskDto');
const { normalizeTaskStatus } = require('../constants/taskStatuses');
const { ValidationError } = require('../utils/errorHandler');

const taskController = {
  async listTasksForProject(req, res, next) {
    try {
      const tasks = await taskService.listTasksByProject(req.params.projectId, req.user.id);
      res.json({ tasks: tasks.map(taskToDto) });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req, res, next) {
    try {
      const validation = ValidationService.validateTaskInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const data = createTaskDto(req.body);
      const schedule = pickTaskScheduleFields(req.body);
      const task = await taskService.createTask(req.params.projectId, req.user.id, {
        title: data.title,
        description: typeof data.description === 'string' ? data.description : '',
        completed:
          data.completed !== undefined && data.completed !== null
            ? Boolean(data.completed)
            : false,
        ...schedule
      });

      res.status(201).json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  async patchTaskStatus(req, res, next) {
    try {
      const validation = ValidationService.validateTaskStatusInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }
      const task = await taskService.updateTaskStatus(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        validation.normalized
      );
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
        req.user.id
      );
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const validation = ValidationService.validateTaskUpdateInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const updates = {};
      if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
        updates.title = String(req.body.title).trim();
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
        updates.description = String(req.body.description).trim();
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'completed')) {
        updates.completed = Boolean(req.body.completed);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
        const st = normalizeTaskStatus(req.body.status);
        updates.status = st;
        updates.completed = st === 'DONE';
      }
      Object.assign(updates, pickTaskScheduleFields(req.body));

      const task = await taskService.updateTask(req.params.id, req.user.id, updates);
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  async assignAssignee(req, res, next) {
    try {
      const validation = ValidationService.validateAssigneeInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }
      const assigneeId = String(req.body.assigneeId).trim();
      const task = await taskService.assignAssignee(req.params.id, req.user.id, assigneeId);
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;
