// @ts-nocheck
import express from 'express';
import publicSessionRoutes from '../routes/publicSessionRoutes.js';
import authPublicOrchestrationRoutes from '../routes/authPublicOrchestrationRoutes.js';
import authProtectedOrchestrationRoutes from '../routes/authProtectedOrchestrationRoutes.js';
import frontendProyectosRoutes from '../routes/frontendProyectosRoutes.js';
import protectedProjectManagerRoutes from '../routes/protectedProjectManagerRoutes.js';
export {};

/**
 * Capa de presentación: router HTTP del BFF (montado bajo API_GATEWAY_PREFIX).
 * Orden: sesión pública → auth → agregados front (/proyectos) → reenvío PM.
 */
const gatewayRouter = express.Router();

gatewayRouter.use(publicSessionRoutes);
gatewayRouter.use('/auth', authPublicOrchestrationRoutes);
gatewayRouter.use('/auth', authProtectedOrchestrationRoutes);
gatewayRouter.use(frontendProyectosRoutes);
gatewayRouter.use(frontendKpiRoutes);
gatewayRouter.use(protectedProjectManagerRoutes);

export default gatewayRouter;;z