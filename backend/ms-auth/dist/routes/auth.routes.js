"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// AS-TASK-02: Integrar con API Gateway
// Rutas de autenticación y autorización
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// AS-TASK-07: Importar middleware de autenticación
const { verifyToken } = require('../middleware/auth.middleware');
// AS-TASK-12: Importar middleware de auditoría
const { auditMiddleware, auditCriticalOperation } = require('../middleware/auditMiddleware');
// AS-TASK-12: Aplicar auditoría a todas las rutas (excepto health check)
router.use((req, res, next) => {
    if (req.path !== '/health') {
        return auditMiddleware(req, res, next);
    }
    next();
});
// Endpoints de autenticación
router.post('/register', auditCriticalOperation('REGISTER'), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', auditCriticalOperation('LOGIN'), authController.login);
// AS-TASK-07: Logout requiere token válido
router.post('/logout', verifyToken, auditCriticalOperation('LOGOUT'), authController.logout);
// Endpoints de roles
router.get('/roles', authController.getRoles);

/**
 * @swagger
 * /api/auth/roles/simple:
 *   get:
 *     summary: Obtener lista simple de nombres de roles
 *     tags: [Roles]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de nombres de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["gestor", "profesional", "directivo"]
 */
//  Endpoint simplificado que retorna solo nombres de roles
router.get('/roles/simple', authController.getRolesSimple);

/**
 * @swagger
 * /api/auth/usuarios/{id}/rol:
 *   put:
 *     summary: Actualizar el rol de un usuario
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol]
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [gestor, profesional, directivo]
 *                 example: "profesional"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Rol inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/usuarios/:id/rol', auditCriticalOperation('ROLE_CHANGE'), authController.updateUserRole);
// Health check
router.get('/health', authController.health);
module.exports = router;
