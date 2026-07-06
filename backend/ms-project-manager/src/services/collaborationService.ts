/**
 * Servicio de colaboración en tareas.
 * Gestiona comentarios, adjuntos y notificaciones con control de acceso por proyecto/tarea.
 */
import collaborationRepository from '../repositories/collaborationRepository.js';
import resourceAvailabilityService from './resourceAvailabilityService.js';
import { ValidationError } from '../utils/errorHandler.js';
import {
  commentsToDto,
  commentToDto,
  attachmentsToDto,
  attachmentToDto,
  notificationsToDto,
  createCommentInputDto,
  createAttachmentInputDto,
  markNotificationReadResponseDto
} from '../dtos/collaborationDto.js';

class CollaborationService {
  /**
   * Verifica que el usuario tenga acceso a la tarea dentro del proyecto.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<void>}
   */
  async assertTaskAccess(projectId, taskId, userId) {
    await resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  /**
   * Lista comentarios de una tarea.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object[]>} Comentarios en formato DTO
   */
  async listComments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listComments(taskId);
    return commentsToDto(rows);
  }

  /**
   * Agrega un comentario a una tarea.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Body con content
   * @returns {Promise<object>} Comentario creado en formato DTO
   */
  async addComment(projectId, taskId, userId, body) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const { content } = createCommentInputDto(body);
    if (content.length < 2) {
      throw new ValidationError(['El comentario debe tener al menos 2 caracteres']);
    }
    const row = await collaborationRepository.addComment(taskId, userId, content);
    return commentToDto(row);
  }

  /**
   * Lista adjuntos de una tarea.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object[]>} Adjuntos en formato DTO
   */
  async listAttachments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listAttachments(taskId);
    return attachmentsToDto(rows);
  }

  /**
   * Registra un adjunto en una tarea.
   * @param {string|number} projectId - ID del proyecto
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del usuario autenticado
   * @param {Record<string, unknown>} body - Body con documentName y documentUrl
   * @returns {Promise<object>} Adjunto creado en formato DTO
   */
  async addAttachment(projectId, taskId, userId, body) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const { documentName, documentUrl } = createAttachmentInputDto(body);
    if (!documentName || !documentUrl) {
      throw new ValidationError(['documentName y documentUrl son obligatorios']);
    }
    const row = await collaborationRepository.addAttachment(
      taskId,
      userId,
      documentName,
      documentUrl
    );
    return attachmentToDto(row);
  }

  /**
   * Lista notificaciones del usuario autenticado.
   * @param {string|number} userId - ID del usuario
   * @returns {Promise<object[]>} Notificaciones en formato DTO
   */
  async listNotifications(userId) {
    const rows = await collaborationRepository.listNotifications(userId);
    return notificationsToDto(rows);
  }

  /**
   * Crea una notificación para un usuario (uso interno o eventos de dominio).
   * @param {string|number} userId - ID del destinatario
   * @param {string} type - Tipo de notificación (alert, milestone, etc.)
   * @param {string} title - Título visible
   * @param {string} message - Mensaje descriptivo
   * @returns {Promise<object>} Fila de notificación persistida
   */
  async notifyUser(userId, type, title, message) {
    return collaborationRepository.createNotification(userId, type, title, message);
  }

  /**
   * Marca una notificación como leída si pertenece al usuario.
   * @param {string|number} notificationId - ID de la notificación
   * @param {string|number} userId - ID del usuario autenticado
   * @returns {Promise<object>} Respuesta DTO con estado actualizado
   */
  async markNotificationRead(notificationId, userId) {
    const row = await collaborationRepository.markNotificationRead(notificationId, userId);
    if (!row) throw new ValidationError(['Notificación no encontrada']);
    return markNotificationReadResponseDto(row);
  }
}

export default new CollaborationService();
