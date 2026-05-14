const express = require('express');
const projectRoutes = require('../routes/projectRoutes');
const taskRoutes = require('../routes/taskRoutes');

const gatewayRouter = express.Router();

gatewayRouter.use('/tasks', taskRoutes);
gatewayRouter.use('/projects', projectRoutes);

module.exports = gatewayRouter;
