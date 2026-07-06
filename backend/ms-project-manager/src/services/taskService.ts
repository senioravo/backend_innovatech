/**
 * Servicio de dominio de tareas.
 * Orquesta creación, actualización, asignación y eliminación con validación,
 * control de disponibilidad de recursos y notificaciones de colaboración.
 */
import taskRepository from '../repositories/taskRepository.js';
import resourceAvailabilityService from './resourceAvailabilityService.js';
import collaborationService from './collaborationService.js';
import ValidationService from './validationService.js';
import { createTaskDto, pickTaskScheduleFields } from '../dtos/taskDto.js';
import { isAllowedTaskStatusTransition,
  normalizeTaskStatus } from '../constants/taskStatuses.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

class TaskService {
  /**
   * Crea una tarea en un proyecto verificando disponibilidad del recurso.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} userId - ID del usuario autenticado
   * @param {object} payload - Datos de la tarea (title, description, completed, status, assigneeId, fechas)
   * @returns {Promise<object>} Tarea creada
   */
  async createTask(projectId, userId, payload) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    await resourceAvailabilityService.assertProjectAvailable(projectId, userId);

    return taskRepository.create({
      projectId,
      title: payload.title,
      description: payload.description ?? '',
      completed: Boolean(payload.completed),
      status: payload.status,
      assigneeId: payload.assigneeId ?? null,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null
    });
  }

  /**
   * Valida el body HTTP y delega en createTask.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Body del request
   * @returns {Promise<object>} Tarea creada
   */
  async createTaskFromRequest(projectId, userId, body) {
    const validation = ValidationService.validateTaskInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const data = createTaskDto(body);
    const schedule = pickTaskScheduleFields(body);
    return this.createTask(projectId, userId, {
      title: data.title,
      description: typeof data.description === 'string' ? data.description : '',
      completed:
        data.completed !== undefined && data.completed !== null
          ? Boolean(data.completed)
          : false,
      ...schedule
    });
  }

  /**
   * Valida cambio de estado desde body HTTP y delega en updateTaskStatus.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Body con campo status
   * @returns {Promise<object>} Tarea actualizada
   */
  async updateTaskStatusFromRequest(projectId, taskId, userId, body) {
    const validation = ValidationService.validateTaskStatusInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    return this.updateTaskStatus(projectId, taskId, userId, validation.normalized);
  }

  /**
   * Valida body de actualización parcial y delega en updateTask.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Campos a actualizar
   * @returns {Promise<object>} Tarea actualizada
   */
  async updateTaskFromRequest(taskId, userId, body) {
    const validation = ValidationService.validateTaskUpdateInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const updates: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(body, 'title')) {
      updates.title = String(body.title).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      updates.description = String(body.description).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, 'completed')) {
      updates.completed = Boolean(body.completed);
    }
    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      const st = normalizeTaskStatus(body.status);
      updates.status = st;
      updates.completed = st === 'DONE';
    }
    Object.assign(updates, pickTaskScheduleFields(body));

    return this.updateTask(taskId, userId, updates);
  }

  /**
   * Valida assigneeId del body y delega en assignAssignee.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Body con assigneeId
   * @returns {Promise<object>} Tarea con responsable asignado
   */
  async assignAssigneeFromRequest(taskId, userId, body) {
    const validation = ValidationService.validateAssigneeInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    return this.assignAssignee(taskId, userId, String(body.assigneeId).trim());
  }

  /**
   * Lista tareas de un proyecto según permisos de visibilidad del rol.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} userId - ID del usuario autenticado
   * @param {string} [role] - Rol del usuario para ampliar visibilidad
   * @returns {Promise<object[]>} Tareas del proyecto
   */
  async listTasksByProject(projectId, userId, role) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    await resourceAvailabilityService.assertProjectAvailable(projectId, userId, role);
    return taskRepository.findByProjectId(projectId);
  }

  /**
   * Obtiene una tarea verificando que pertenezca al proyecto y al usuario.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object>} Tarea encontrada
   */
  async getTask(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId and userId are required');
    }
    return resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  /**
   * Actualiza el estado de una tarea validando transiciones permitidas y notifica al usuario.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {string} status - Nuevo estado normalizado
   * @returns {Promise<object>} Tarea actualizada
   */
  async updateTaskStatus(projectId, taskId, userId, status) {
    if (!projectId || !taskId || !userId || !status) {
      throw new Error('projectId, taskId, userId and status are required');
    }
    const current = await resourceAvailabilityService.assertTaskInProject(
      projectId,
      taskId,
      userId
    );
    const from = normalizeTaskStatus(current.status ?? 'PENDING');
    if (!isAllowedTaskStatusTransition(from, status)) {
      throw new ValidationError([
        `Invalid status transition (${from} → ${status}). Allowed: same state or next step in order.`
      ]);
    }
    const completed = status === 'DONE';
    const task = await taskRepository.update(taskId, userId, { status, completed });
    if (!task) throw new NotFoundError('Task not found');

    try {
      await collaborationService.notifyUser(
        userId,
        status === 'DONE' ? 'milestone' : 'alert',
        status === 'DONE' ? 'Tarea completada' : 'Cambio de estado en tarea',
        `La tarea pasó de ${from} a ${status}.`
      );
    } catch {
      // Notificación best-effort si la tabla aún no existe
    }

    return task;
  }

  /**
   * Actualiza campos parciales de una tarea validando transiciones de estado.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} updates - Campos a persistir
   * @returns {Promise<object>} Tarea actualizada
   */
  async updateTask(taskId, userId, updates) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    const current = await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    if (updates.status !== undefined) {
      const from = normalizeTaskStatus(current.status ?? 'PENDING');
      const to = updates.status;
      if (!isAllowedTaskStatusTransition(from, to)) {
        throw new ValidationError([
          `Invalid status transition (${from} → ${to}). Allowed: same state or next step in order.`
        ]);
      }
      updates.completed = to === 'DONE';
    }
    const task = await taskRepository.update(taskId, userId, updates);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  /**
   * Asigna un responsable a la tarea tras verificar disponibilidad.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {string} assigneeId - ID del responsable a asignar
   * @returns {Promise<object>} Tarea actualizada
   */
  async assignAssignee(taskId, userId, assigneeId) {
    if (!taskId || !userId || !assigneeId) {
      throw new Error('taskId, userId and assigneeId are required');
    }
    await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const task = await taskRepository.update(taskId, userId, { assigneeId });
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  /**
   * Elimina una tarea verificando acceso del usuario.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async deleteTask(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const deleted = await taskRepository.delete(taskId, userId);
    if (!deleted) throw new NotFoundError('Task not found');
    return true;
  }
}

export default new TaskService();
