// @ts-nocheck
export {};
// Rutas de usuarios

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { metricsMiddleware } = require('../middleware/metricsMiddleware');

// Aplicar middleware de métricas a todas las rutas
router.use(metricsMiddleware);

// CRUD de usuarios - requieren autenticación
/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@innovatech.cl
 *               password:
 *                 type: string
 *                 example: Secret123!
 *               rol:
 *                 type: string
 *                 enum: [gestor, profesional, directivo]
 *                 example: profesional
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Solicitud inválida
 */
router.post('/', verifyToken, userController.createUser);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [gestor, profesional, directivo]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', verifyToken, userController.listUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verifyToken, userController.getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               email:
 *                 type: string
 *                 example: juan.nuevo@innovatech.cl
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verifyToken, userController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', verifyToken, requireRole(['gestor', 'directivo']), userController.deleteUser);

// Cambio de rol - solo gestores y directivos
/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: Cambiar rol de usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 example: gestor
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id/role', verifyToken, requireRole(['gestor', 'directivo']), userController.changeUserRole);

// Búsqueda por email
/**
 * @openapi
 * /api/users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Buscar usuario por email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/email/:email', verifyToken, userController.getUserByEmail);

module.exports = router;
