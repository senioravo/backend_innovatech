const express = require('express');
const authOrchestrationRoutes = require('../routes/authOrchestrationRoutes');
const projectManagerOrchestrationRoutes = require('../routes/projectManagerOrchestrationRoutes');

/**
 * Capa de presentación: router HTTP del BFF (montado bajo API_GATEWAY_PREFIX).
 */
const gatewayRouter = express.Router();

gatewayRouter.use('/auth', authOrchestrationRoutes);
gatewayRouter.use(projectManagerOrchestrationRoutes);

module.exports = gatewayRouter;
