const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const projectController = require('../controllers/project-controller');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  projectController.listProjects
);

router.get(
  '/:id',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  projectController.getProject
);

router.post(
  '/',
  requireRole('Gestor'),
  projectController.createProject
);

router.put(
  '/:id',
  requireRole('Gestor', 'Profesional'),
  projectController.updateProject
);

router.patch(
  '/:id/responsable',
  requireRole('Gestor', 'Profesional'),
  projectController.assignResponsable
);

router.delete(
  '/:id',
  requireRole('Gestor'),
  projectController.deleteProject
);

module.exports = router;
