"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const jwtAuthMiddleware = require('../middlewares/jwtAuthMiddleware');
const authOrchestrationController = require('../controllers/auth-orchestration-controller');
/**
 * BFF-TASK-04 / BFF-TASK-05: sesión en raíz del prefijo API (front-friendly).
 * POST /login  → Auth Service
 * POST /logout → Auth Service (requiere JWT válido en el BFF)
 */
const router = express.Router();
/**
 * @openapi
 * /api/v1/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 * /api/v1/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 */
router.post('/login', authOrchestrationController.login);
router.post('/logout', jwtAuthMiddleware, authOrchestrationController.logout);
module.exports = router;
