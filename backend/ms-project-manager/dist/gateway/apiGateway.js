// @ts-nocheck
import express from 'express';
import projectRoutes from '../routes/projectRoutes.js';
import taskRoutes from '../routes/taskRoutes.js';
import consultationRoutes from '../routes/consultationRoutes.js';
const gatewayRouter = express.Router();
gatewayRouter.use('/tasks', taskRoutes);
gatewayRouter.use('/projects', projectRoutes);
gatewayRouter.use('/consultations', consultationRoutes);
export default gatewayRouter;
;
