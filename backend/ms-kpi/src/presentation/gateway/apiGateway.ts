/**
 * Router interno de ms-kpi: monta rutas bajo `/kpis`.
 */
const express = require('express');
const kpiRoutes = require('../routes/kpiRoutes');

const gatewayRouter = express.Router();
gatewayRouter.use('/kpis', kpiRoutes);

module.exports = gatewayRouter;
