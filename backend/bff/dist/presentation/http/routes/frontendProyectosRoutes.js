"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const jwtAuthMiddleware = require('../middlewares/jwtAuthMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');
const proyectosOrchestrationController = require('../controllers/proyectos-orchestration-controller');
/**
 * BFF-TASK-08 / 09 / 10: contrato en español para el frontend.
 */
const router = express.Router();
router.use(jwtAuthMiddleware);
/**
 * @openapi
 * /api/v1/proyectos:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos para frontend
 * /api/v1/proyectos/{id}/tareas:
 *   get:
 *     tags: [Projects]
 *     summary: Listar tareas de un proyecto para frontend
 */
router.get('/proyectos', requireRole('Gestor', 'Profesional', 'Directivo'), proyectosOrchestrationController.listProyectos);
router.get('/proyectos/:id/tareas', requireRole('Gestor', 'Profesional', 'Directivo'), proyectosOrchestrationController.listTareas);
module.exports = router;
