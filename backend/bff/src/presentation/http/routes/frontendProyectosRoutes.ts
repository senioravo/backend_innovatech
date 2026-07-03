import express from 'express';
import jwtAuthMiddleware from '../middlewares/jwtAuthMiddleware.js';
import requireRole from '../middlewares/requireRoleMiddleware.js';
import proyectosOrchestrationController from '../controllers/proyectos-orchestration-controller.js';

/**
 * BFF-TASK-08 / 09 / 10: contrato en español para el frontend.
 */
const router = express.Router();

router.use(jwtAuthMiddleware);

/**
 * @openapi
 * /api/v1/proyectos:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos para frontend
 * /api/v1/proyectos/{id}/tareas:
 *   get:
 *     tags: [Projects]
 *     summary: Listar tareas de un proyecto para frontend
 */
router.get(
  '/proyectos',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  proyectosOrchestrationController.listProyectos
);

router.get(
  '/proyectos/:id/tareas',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  proyectosOrchestrationController.listTareas
);

export default router;