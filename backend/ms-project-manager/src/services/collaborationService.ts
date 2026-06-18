// @ts-nocheck
import collaborationRepository from '../repositories/collaborationRepository.js';
import resourceAvailabilityService from './resourceAvailabilityService.js';
import { ValidationError } from '../utils/errorHandler.js';

class CollaborationService {
  async assertTaskAccess(projectId, taskId, userId) {
    await resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  async listComments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listComments(taskId);
    return rows.map((r) => ({
      id: r.id,
      taskId: r.task_id,
      userId: r.user_id,
      content: r.content,
      createdAt: r.created_at
    }));
  }

  async addComment(projectId, taskId, userId, body) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const content = String(body?.content || '').trim();
    if (content.length < 2) {
      throw new ValidationError(['El comentario debe tener al menos 2 caracteres']);
    }
    const row = await collaborationRepository.addComment(taskId, userId, content);
    return {
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at
    };
  }

  async listAttachments(projectId, taskId, userId) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const rows = await collaborationRepository.listAttachments(taskId);
    return rows.map((r) => ({
      id: r.id,
      taskId: r.task_id,
      userId: r.user_id,
      documentName: r.document_name,
      documentUrl: r.document_url,
      createdAt: r.created_at
    }));
  }

  async addAttachment(projectId, taskId, userId, body) {
    await this.assertTaskAccess(projectId, taskId, userId);
    const documentName = String(body?.documentName || body?.name || '').trim();
    const documentUrl = String(body?.documentUrl || body?.url || '').trim();
    if (!documentName || !documentUrl) {
      throw new ValidationError(['documentName y documentUrl son obligatorios']);
    }
    const row = await collaborationRepository.addAttachment(
      taskId,
      userId,
      documentName,
      documentUrl
    );
    return {
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      documentName: row.document_name,
      documentUrl: row.document_url,
      createdAt: row.created_at
    };
  }

  async listNotifications(userId) {
    const rows = await collaborationRepository.listNotifications(userId);
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.created_at
    }));
  }

  async notifyUser(userId, type, title, message) {
    return collaborationRepository.createNotification(userId, type, title, message);
  }

  async markNotificationRead(notificationId, userId) {
    const row = await collaborationRepository.markNotificationRead(notificationId, userId);
    if (!row) throw new ValidationError(['Notificación no encontrada']);
    return { id: row.id, read: row.read };
  }
}

export default new CollaborationService();
