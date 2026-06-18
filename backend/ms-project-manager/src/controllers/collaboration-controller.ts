// @ts-nocheck
import collaborationService from '../services/collaborationService.js';

const collaborationController = {
  async listComments(req, res, next) {
    try {
      const data = await collaborationService.listComments(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json({ comments: data });
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
      const data = await collaborationService.listAttachments(
        req.params.projectId,
        req.params.taskId,
        req.user.id
      );
      res.json({ attachments: data });
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
      const data = await collaborationService.listNotifications(req.user.id);
      res.json({ notifications: data });
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
