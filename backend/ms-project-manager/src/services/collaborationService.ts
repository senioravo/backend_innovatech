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
  async assertTaskAccess(projectId, taskId, userId) {
    await resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  async listComments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listComments(taskId);
    return commentsToDto(rows);
  }

  async addComment(projectId, taskId, userId, body) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const { content } = createCommentInputDto(body);
    if (content.length < 2) {
      throw new ValidationError(['El comentario debe tener al menos 2 caracteres']);
    }
    const row = await collaborationRepository.addComment(taskId, userId, content);
    return commentToDto(row);
  }

  async listAttachments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listAttachments(taskId);
    return attachmentsToDto(rows);
  }

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

  async listNotifications(userId) {
    const rows = await collaborationRepository.listNotifications(userId);
    return notificationsToDto(rows);
  }

  async notifyUser(userId, type, title, message) {
    return collaborationRepository.createNotification(userId, type, title, message);
  }

  async markNotificationRead(notificationId, userId) {
    const row = await collaborationRepository.markNotificationRead(notificationId, userId);
    if (!row) throw new ValidationError(['Notificación no encontrada']);
    return markNotificationReadResponseDto(row);
  }
}

export default new CollaborationService();
