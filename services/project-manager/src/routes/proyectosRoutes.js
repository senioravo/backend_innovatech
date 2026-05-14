const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const projectController = require('../controllers/project-controller');
const taskController = require('../controllers/task-controller');

const router = express.Router();

router.use(authMiddleware);
router.get(
  '/',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  projectController.listProjects
);
router.post('/', requireRole('Gestor'), projectController.createProject);

router.get(
  '/:projectId/tasks/:taskId',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  taskController.getTask
);
router.post(
  '/:projectId/tasks',
  requireRole('Gestor', 'Profesional'),
  taskController.createTask
);

router.delete('/:id', requireRole('Gestor'), projectController.deleteProject);

module.exports = router;
