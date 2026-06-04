export {};
const express = require('express');
const jwtAuthMiddleware = require('../middlewares/jwtAuthMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');
const projectManagerOrchestrationController = require('../controllers/project-manager-orchestration-controller');

const forward = (req, res, next) =>
  projectManagerOrchestrationController.forward(req, res, next);

/**
 * BFF-TASK-06 + BFF-TASK-07: mismo contrato de roles que Project-manager antes de reenviar.
 */
const router = express.Router();

router.use(jwtAuthMiddleware);

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

module.exports = router;
