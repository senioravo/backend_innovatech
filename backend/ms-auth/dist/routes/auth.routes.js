// @ts-nocheck
// AS-TASK-02: Integrar con API Gateway
// Rutas de autenticación y autorización
import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
// AS-TASK-07: Importar middleware de autenticación
import { verifyToken } from '../middleware/auth.middleware.js';
// AS-TASK-12: Importar middleware de auditoría
import { auditMiddleware, auditCriticalOperation } from '../middleware/auditMiddleware.js';
// AS-TASK-12: Aplicar auditoría a todas las rutas (excepto health check)
router.use((req, res, next) => {
    if (req.path !== '/health') {
        return auditMiddleware(req, res, next);
    }
    next();
});
// Endpoints de autenticación (SOLO autenticación)
// NOTA: /register fue movido a ms-users (POST /api/users)
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@innovatech.cl
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', auditCriticalOperation('LOGIN'), authController.login);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *       401:
 *         description: Token inválido
 */
router.post('/logout', verifyToken, auditCriticalOperation('LOGOUT'), authController.logout);
/**
 * @openapi
 * /api/auth/roles:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener todos los roles disponibles
 *     responses:
 *       200:
 *         description: Lista de roles
 * /api/auth/roles/simple:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener nombres de roles (versión simple)
 *     responses:
 *       200:
 *         description: Lista simple de roles
 */
router.get('/roles', authController.getRoles);
router.get('/roles/simple', authController.getRolesSimple);
// NOTA: Endpoints de gestión de usuarios fueron movidos a ms-users:
// - GET /usuarios/:id → ms-users: GET /api/users/:id
// - PUT /usuarios/:id/rol → ms-users: PUT /api/users/:id/role
/**
 * @openapi
 * /api/auth/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check del microservicio auth
 *     responses:
 *       200:
 *         description: Servicio operativo
 */
router.get('/health', authController.health);
export default router;
