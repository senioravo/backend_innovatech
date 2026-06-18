// @ts-nocheck
import express from 'express';
import jwtAuthMiddleware from '../middlewares/jwtAuthMiddleware.js';
import authOrchestrationController from '../controllers/auth-orchestration-controller.js';
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
export default router;
