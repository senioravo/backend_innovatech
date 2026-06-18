// @ts-nocheck
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireRole from '../middlewares/roleMiddleware.js';
import consultationController from '../controllers/consultation-controller.js';
const router = express.Router();
router.use(authMiddleware);
/**
 * @openapi
 * /api/v1/consultations/dashboard:
 *   get:
 *     tags: [Consultations]
 *     summary: Obtener dashboard de tareas
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', requireRole('Gestor', 'Profesional', 'Directivo'), consultationController.getTaskDashboard);
export default router;
