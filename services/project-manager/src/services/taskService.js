const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');
const { NotFoundError } = require('../utils/errorHandler');

class TaskService {
  createTask(projectId, userId, { title, description, completed }) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    const project = projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) throw new NotFoundError('Proyecto no encontrado');

    const now = new Date().toISOString();
    return taskRepository.create({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      title,
      description: description ?? '',
      completed: Boolean(completed),
      createdAt: now,
      updatedAt: now
    });
  }

  getTask(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId y userId son requeridos');
    }
    const task = taskRepository.findByProjectIdAndTaskId(projectId, taskId, userId);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  }

  updateTask(taskId, userId, updates) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    const task = taskRepository.update(taskId, userId, updates);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  }

  deleteTask(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    const deleted = taskRepository.delete(taskId, userId);
    if (!deleted) throw new NotFoundError('Tarea no encontrada');
    return true;
  }
}

module.exports = new TaskService();
