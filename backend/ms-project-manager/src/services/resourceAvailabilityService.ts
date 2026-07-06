/**
 * Servicio de disponibilidad de recursos.
 * Centraliza comprobaciones de acceso a proyectos y tareas antes de operaciones de dominio.
 */
import projectRepository from '../repositories/projectRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/errorHandler.js';
import { canViewAllProjects } from '../utils/roleAccess.js';

const resourceAvailabilityService = {
  /**
   * Verifica que el proyecto exista y sea accesible para el usuario (o rol con visión global).
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} userId - ID del usuario autenticado
   * @param {string} [role] - Rol opcional para ampliar visibilidad
   * @returns {Promise<object>} Proyecto encontrado
   */
  async assertProjectAvailable(projectId, userId, role = undefined) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    if (canViewAllProjects(role)) {
      const project = await projectRepository.findById(projectId);
      if (!project) throw new NotFoundError('Project not found');
      return project;
    }
    const project = await projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  /**
   * Verifica que la tarea exista y pertenezca al usuario.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object>} Tarea encontrada
   */
  async assertTaskAvailable(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    const task = await taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  },

  /**
   * Verifica que el usuario sea el responsable asignado del proyecto.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object>} Proyecto si el usuario es responsable
   */
  async assertProjectResponsable(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');
    if (!project.assigneeId || project.assigneeId !== userId) {
      throw new ForbiddenError('Only the project responsable can perform this action');
    }
    return project;
  },

  /**
   * Verifica que la tarea exista dentro del proyecto y sea accesible al usuario.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object>} Tarea encontrada en el proyecto
   */
  async assertTaskInProject(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId and userId are required');
    }
    const task = await taskRepository.findByProjectIdAndTaskId(projectId, taskId, userId);
    if (!task) throw new NotFoundError('Task not found in this project');
    return task;
  }
};

export default resourceAvailabilityService;
