/**
 * Router interno de ms-project-manager: monta rutas de projects, tasks, consultations y notifications.
 */
import express from 'express';
import projectRoutes from '../routes/projectRoutes.js';
import taskRoutes from '../routes/taskRoutes.js';
import consultationRoutes from '../routes/consultationRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';

const gatewayRouter = express.Router();

gatewayRouter.use('/tasks', taskRoutes);
gatewayRouter.use('/projects', projectRoutes);
gatewayRouter.use('/consultations', consultationRoutes);
gatewayRouter.use('/notifications', notificationRoutes);

export default gatewayRouter;;