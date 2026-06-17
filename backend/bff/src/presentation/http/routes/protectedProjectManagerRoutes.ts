// @ts-nocheck
import express from 'express';
import jwtAuthMiddleware from '../middlewares/jwtAuthMiddleware.js';
import requireRole from '../middlewares/requireRoleMiddleware.js';
import projectManagerOrchestrationController from '../controllers/project-manager-orchestration-controller.js';

const forward = (req, res, next) =>
  projectManagerOrchestrationController.forward(req, res, next);

/**
 * BFF-TASK-06 + BFF-TASK-07: mismo contrato de roles que Project-manager antes de reenviar.
 */
const router = express.Router();

router.use(jwtAuthMiddleware);

/**
 * @openapi
 * /api/v1/consultations/dashboard:
 *   get:
 *     tags: [Consultations]
 *     summary: Dashboard de tareas
 * /api/v1/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos
 *   post:
 *     tags: [Projects]
 *     summary: Crear proyecto
 * /api/v1/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Obtener proyecto
 *   put:
 *     tags: [Projects]
 *     summary: Actualizar proyecto
 *   delete:
 *     tags: [Projects]
 *     summary: Eliminar proyecto
 */
router.get(
  '/consultations/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);

router.get(
  '/projects/:projectId/tasks/:taskId/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.get(
  '/projects/:projectId/tasks/:taskId',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.patch(
  '/projects/:projectId/tasks/:taskId/status',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.get(
  '/projects/:projectId/tasks',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.post(
  '/projects/:projectId/tasks',
  requireRole('Gestor', 'Profesional'),
  forward
);

router.get(
  '/projects/:id/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.get(
  '/projects/:id',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.get('/projects', requireRole('Gestor', 'Profesional', 'Directivo'), forward);
router.post('/projects', requireRole('Gestor'), forward);
router.put('/projects/:id', requireRole('Gestor', 'Profesional'), forward);
router.patch('/projects/:id/assignee', requireRole('Gestor', 'Profesional'), forward);
router.delete('/projects/:id', requireRole('Gestor'), forward);

router.get(
  '/tasks/:id/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  forward
);
router.put('/tasks/:id', requireRole('Gestor', 'Profesional'), forward);
router.patch('/tasks/:id/assignee', requireRole('Gestor', 'Profesional'), forward);
router.delete('/tasks/:id', requireRole('Gestor'), forward);

export default router;