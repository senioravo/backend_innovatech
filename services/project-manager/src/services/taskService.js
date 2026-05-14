const taskRepository = require('../repositories/taskRepository');
const resourceAvailabilityService = require('./resourceAvailabilityService');
const { NotFoundError } = require('../utils/errorHandler');

class TaskService {
  createTask(projectId, userId, { title, description, completed }) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    resourceAvailabilityService.assertProjectAvailable(projectId, userId);

    const now = new Date().toISOString();
    return taskRepository.create({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      title,
      description: description ?? '',
      completed: Boolean(completed),
      responsableId: null,
      createdAt: now,
      updatedAt: now
    });
  }

  getTask(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId y userId son requeridos');
    }
    return resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  updateTask(taskId, userId, updates) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const task = taskRepository.update(taskId, userId, updates);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  }

  assignResponsable(taskId, userId, responsableId) {
    if (!taskId || !userId || !responsableId) {
      throw new Error('taskId, userId y responsableId son requeridos');
    }
    resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const task = taskRepository.update(taskId, userId, { responsableId });
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  }

  deleteTask(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const deleted = taskRepository.delete(taskId, userId);
    if (!deleted) throw new NotFoundError('Tarea no encontrada');
    return true;
  }
}

module.exports = new TaskService();
