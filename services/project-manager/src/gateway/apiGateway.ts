// @ts-nocheck
export {};
const express = require('express');
const projectRoutes = require('../routes/projectRoutes');
const taskRoutes = require('../routes/taskRoutes');
const consultationRoutes = require('../routes/consultationRoutes');

const gatewayRouter = express.Router();

gatewayRouter.use('/tasks', taskRoutes);
gatewayRouter.use('/projects', projectRoutes);
gatewayRouter.use('/consultations', consultationRoutes);

module.exports = gatewayRouter;
