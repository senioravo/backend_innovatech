// @ts-nocheck
import express from 'express';
import * as authOrchestrationController from '../controllers/auth-orchestration-controller.js';

/** Rutas /api/auth/* públicas (sin JWT en el BFF). */
const router = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuario
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 * /api/v1/auth/roles:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener roles
 * /api/v1/auth/roles/simple:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener roles simples
 * /api/v1/auth/health:
 *   get:
 *     tags: [Health]
 *     summary: Health del auth desde BFF
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/register', authOrchestrationController.register);
router.post('/login', authOrchestrationController.login);
router.get('/roles', authOrchestrationController.getRoles);
router.get('/roles/simple', authOrchestrationController.getRolesSimple);
router.get('/health', authOrchestrationController.health);

export default router;