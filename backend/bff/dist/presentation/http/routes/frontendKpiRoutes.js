"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const jwtAuthMiddleware = require('../middlewares/jwtAuthMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');
const kpiOrchestrationController = require('../controllers/kpi-orchestration-controller');
const router = express.Router();
router.use(jwtAuthMiddleware);
/**
 * @openapi
 * /api/v1/kpis/dashboard:
 *   get:
 *     tags: [KPIs]
 *     summary: Dashboard de progreso (contrato frontend)
 */
router.get('/kpis/dashboard', requireRole('Gestor', 'Profesional', 'Directivo'), kpiOrchestrationController.getDashboard);
module.exports = router;
