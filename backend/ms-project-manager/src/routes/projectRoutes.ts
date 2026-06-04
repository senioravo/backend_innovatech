// @ts-nocheck
export {};
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const projectController = require('../controllers/project-controller');
const resourceAvailabilityController = require('../controllers/resource-availability-controller');
const taskController = require('../controllers/task-controller');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  projectController.listProjects
);

router.get(
  '/:projectId/tasks/:taskId/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  resourceAvailabilityController.checkTaskInProject
);
router.get(
  '/:projectId/tasks/:taskId',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  taskController.getTask
);
router.patch(
  '/:projectId/tasks/:taskId/status',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  taskController.patchTaskStatus
);
router.get(
  '/:projectId/tasks',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  taskController.listTasksForProject
);
router.post(
  '/:projectId/tasks',
  requireRole('Gestor', 'Profesional'),
  taskController.createTask
);

router.get(
  '/:id/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  resourceAvailabilityController.checkProject
);

router.get(
  '/:id',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  projectController.getProject
);

router.post('/', requireRole('Gestor'), projectController.createProject);

router.put('/:id', requireRole('Gestor', 'Profesional'), projectController.updateProject);

router.patch(
  '/:id/assignee',
  requireRole('Gestor', 'Profesional'),
  projectController.assignAssignee
);

router.delete('/:id', requireRole('Gestor'), projectController.deleteProject);

module.exports = router;
