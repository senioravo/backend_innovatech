import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { metricsMiddleware } from '../middleware/metricsMiddleware.js';

const router = express.Router();

router.use(metricsMiddleware);

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
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
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
 *         description: Datos inválidos o email duplicado
 *       401:
 *         description: Token inválido
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *         description: Lista paginada de usuarios
 *       401:
 *         description: Token inválido
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token inválido
 */
router.get('/:id', verifyToken, userController.getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [gestor, profesional, directivo]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token inválido
 */
router.put('/:id', verifyToken, userController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Requiere rol gestor o directivo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verifyToken, requireRole(['gestor', 'directivo']), userController.deleteUser);

/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: Cambiar rol de usuario
 *     description: Requiere rol gestor o directivo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/role', verifyToken, requireRole(['gestor', 'directivo']), userController.changeUserRole);

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
 *           format: email
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/email/:email', verifyToken, userController.getUserByEmail);

export default router;
