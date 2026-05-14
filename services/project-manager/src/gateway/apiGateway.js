const express = require('express');
const projectRoutes = require('../routes/projectRoutes');

const gatewayRouter = express.Router();

gatewayRouter.use('/projects', projectRoutes);

module.exports = gatewayRouter;
