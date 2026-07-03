import collaborationService from '../services/collaborationService.js';
import {
  commentsListResponseDto,
  attachmentsListResponseDto,
  notificationsListResponseDto
} from '../dtos/collaborationDto.js';

const collaborationController = {
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

  async listNotifications(req, res, next) {
    try {
      const notifications = await collaborationService.listNotifications(req.user.id);
      res.json(notificationsListResponseDto(notifications));
    } catch (error) {
      next(error);
    }
  },

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
