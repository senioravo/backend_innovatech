const taskService = require('../services/taskService');
const ValidationService = require('../services/validationService');
const { createTaskDto, taskToDto } = require('../dtos/taskDto');
const { ValidationError } = require('../utils/errorHandler');

const taskController = {
  createTask(req, res, next) {
    try {
      const validation = ValidationService.validateTaskInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const data = createTaskDto(req.body);
      const task = taskService.createTask(req.params.projectId, req.user.id, {
        title: data.title,
        description: typeof data.description === 'string' ? data.description : '',
        completed:
          data.completed !== undefined && data.completed !== null
            ? Boolean(data.completed)
            : false
      });

      res.status(201).json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  getTask(req, res, next) {
    try {
      const task = taskService.getTask(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  updateTask(req, res, next) {
    try {
      const validation = ValidationService.validateTaskUpdateInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const updates = {};
      if (req.body.title !== undefined || req.body.titulo !== undefined) {
        updates.title = String(req.body.title ?? req.body.titulo).trim();
      }
      if (req.body.description !== undefined || req.body.descripcion !== undefined) {
        updates.description = String(req.body.description ?? req.body.descripcion).trim();
      }
      if (req.body.completed !== undefined || req.body.completado !== undefined) {
        updates.completed = Boolean(req.body.completed ?? req.body.completado);
      }

      const task = taskService.updateTask(req.params.id, req.user.id, updates);
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  assignResponsable(req, res, next) {
    try {
      const validation = ValidationService.validateResponsableInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }
      const responsableId = String(req.body.responsableId ?? req.body.userId).trim();
      const task = taskService.assignResponsable(req.params.id, req.user.id, responsableId);
      res.json(taskToDto(task));
    } catch (error) {
      next(error);
    }
  },

  deleteTask(req, res, next) {
    try {
      taskService.deleteTask(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;
