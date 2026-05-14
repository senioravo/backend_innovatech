const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');
const { NotFoundError } = require('../utils/errorHandler');

/**
 * Validación centralizada de disponibilidad de recursos (existencia + pertenencia al usuario).
 * No comprueba existencia en otros microservicios (p. ej. usuarios).
 */
const resourceAvailabilityService = {
  assertProjectAvailable(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    const project = projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) throw new NotFoundError('Proyecto no encontrado');
    return project;
  },

  assertTaskAvailable(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    const task = taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  },

  assertTaskInProject(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId y userId son requeridos');
    }
    const task = taskRepository.findByProjectIdAndTaskId(projectId, taskId, userId);
    if (!task) throw new NotFoundError('Tarea no encontrada en el proyecto');
    return task;
  }
};

module.exports = resourceAvailabilityService;
