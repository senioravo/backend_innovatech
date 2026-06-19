"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const kpiRoutes = require('../routes/kpiRoutes');
const gatewayRouter = express.Router();
gatewayRouter.use('/kpis', kpiRoutes);
module.exports = gatewayRouter;
