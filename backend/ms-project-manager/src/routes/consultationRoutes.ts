// @ts-nocheck
export {};
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const consultationController = require('../controllers/consultation-controller');

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
router.get(
  '/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  consultationController.getTaskDashboard
);

module.exports = router;
