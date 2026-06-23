// @ts-nocheck
export {};
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const kpiController = require('../controllers/kpiController');

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/kpis/dashboard:
 *   get:
 *     tags: [KPIs]
 *     summary: Dashboard de progreso de tareas y proyectos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs agregados del usuario
 */
router.get(
  '/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  kpiController.getDashboard
);

module.exports = router;
