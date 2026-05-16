const express = require('express');
const publicSessionRoutes = require('../routes/publicSessionRoutes');
const authPublicOrchestrationRoutes = require('../routes/authPublicOrchestrationRoutes');
const authProtectedOrchestrationRoutes = require('../routes/authProtectedOrchestrationRoutes');
const frontendProyectosRoutes = require('../routes/frontendProyectosRoutes');
const protectedProjectManagerRoutes = require('../routes/protectedProjectManagerRoutes');

/**
 * Capa de presentación: router HTTP del BFF (montado bajo API_GATEWAY_PREFIX).
 * Orden: sesión pública → auth → agregados front (/proyectos) → reenvío PM.
 */
const gatewayRouter = express.Router();

gatewayRouter.use(publicSessionRoutes);
gatewayRouter.use('/auth', authPublicOrchestrationRoutes);
gatewayRouter.use('/auth', authProtectedOrchestrationRoutes);
gatewayRouter.use(frontendProyectosRoutes);
gatewayRouter.use(protectedProjectManagerRoutes);

module.exports = gatewayRouter;
