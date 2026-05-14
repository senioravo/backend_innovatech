const express = require('express');
const authOrchestrationRoutes = require('../routes/authOrchestrationRoutes');
const projectManagerOrchestrationRoutes = require('../routes/projectManagerOrchestrationRoutes');

const gatewayRouter = express.Router();

gatewayRouter.use('/auth', authOrchestrationRoutes);
gatewayRouter.use(projectManagerOrchestrationRoutes);

module.exports = gatewayRouter;
