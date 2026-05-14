const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const projectController = require('../controllers/project-controller');
const projectRoutes = require('../routes/projectRoutes');
const proyectosRoutes = require('../routes/proyectosRoutes');

const gatewayRouter = express.Router();

gatewayRouter.put(
  '/project/:id',
  authMiddleware,
  requireRole('Gestor', 'Profesional'),
  projectController.updateProject
);

gatewayRouter.use('/proyectos', proyectosRoutes);
gatewayRouter.use('/projects', projectRoutes);

module.exports = gatewayRouter;
