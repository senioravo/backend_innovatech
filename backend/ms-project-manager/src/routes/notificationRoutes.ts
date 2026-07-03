import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireRole from '../middlewares/roleMiddleware.js';
import collaborationController from '../controllers/collaboration-controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  collaborationController.listNotifications
);

router.patch(
  '/:id/read',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  collaborationController.markNotificationRead
);

export default router;
