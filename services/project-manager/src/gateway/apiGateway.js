const express = require('express');
const projectRoutes = require('../routes/projectRoutes');
const proyectosRoutes = require('../routes/proyectosRoutes');

const gatewayRouter = express.Router();

gatewayRouter.use('/proyectos', proyectosRoutes);
gatewayRouter.use('/projects', projectRoutes);

module.exports = gatewayRouter;
