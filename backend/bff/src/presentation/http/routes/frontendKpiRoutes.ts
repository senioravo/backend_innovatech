// @ts-nocheck
import express from 'express';
import jwtAuthMiddleware from '../middlewares/jwtAuthMiddleware.js';
import requireRole from '../middlewares/requireRoleMiddleware.js';
import kpiOrchestrationController from '../controllers/kpi-orchestration-controller.js';

const router = express.Router();

router.use(jwtAuthMiddleware);

/**
 * @openapi
 * /api/v1/kpis/dashboard:
 *   get:
 *     tags: [KPIs]
 *     summary: Dashboard de progreso (contrato frontend)
 */
router.get(
  '/kpis/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  kpiOrchestrationController.getDashboard
);

export default router;
