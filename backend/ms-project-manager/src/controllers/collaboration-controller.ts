/**
 * Controller HTTP de colaboración.
 * Expone comentarios, adjuntos y notificaciones asociados a tareas y usuarios.
 */
import collaborationService from '../services/collaborationService.js';
import {
  commentsListResponseDto,
  attachmentsListResponseDto,
  notificationsListResponseDto
} from '../dtos/collaborationDto.js';

const collaborationController = {
  /**
   * GET /api/v1/projects/:projectId/tasks/:taskId/comments — Lista comentarios de una tarea.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async listComments(req, res, next) {
    try {
      const comments = await collaborationService.listComments(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json(commentsListResponseDto(comments));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/projects/:projectId/tasks/:taskId/comments — Agrega comentario a una tarea.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async addComment(req, res, next) {
    try {
      const data = await collaborationService.addComment(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        req.body
      );
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/projects/:projectId/tasks/:taskId/attachments — Lista adjuntos de una tarea.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async listAttachments(req, res, next) {
    try {
      const attachments = await collaborationService.listAttachments(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json(attachmentsListResponseDto(attachments));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/projects/:projectId/tasks/:taskId/attachments — Registra adjunto en una tarea.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async addAttachment(req, res, next) {
    try {
      const data = await collaborationService.addAttachment(
        req.params.projectId,
        req.params.taskId,
        req.user.id,
        req.body
      );
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/notifications — Lista notificaciones del usuario autenticado.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async listNotifications(req, res, next) {
    try {
      const notifications = await collaborationService.listNotifications(req.user.id);
      res.json(notificationsListResponseDto(notifications));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/notifications/:id/read — Marca notificación como leída.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async markNotificationRead(req, res, next) {
    try {
      const data = await collaborationService.markNotificationRead(
        req.params.id,
        req.user.id
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
};

export default collaborationController;
