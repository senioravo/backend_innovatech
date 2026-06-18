import express from 'express';
import * as internalController from '../controllers/internal.controller.js';
import { validateInternalToken } from '../middleware/internal.middleware.js';

const router = express.Router();

router.use(validateInternalToken);

/**
 * @openapi
 * /api/users/internal/by-email/{email}:
 *   get:
 *     tags: [Internal]
 *     summary: Obtener usuario con password (solo servicios internos)
 *     description: Requiere token interno de servicio (ms-auth)
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *       - in: header
 *         name: x-internal-token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario con hash de password
 *       401:
 *         description: Token interno inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/by-email/:email', internalController.getUserByEmailWithPassword);

/**
 * @openapi
 * /api/users/internal:
 *   post:
 *     tags: [Internal]
 *     summary: Crear usuario (solo servicios internos)
 *     description: Requiere token interno de servicio (ms-auth)
 *     parameters:
 *       - in: header
 *         name: x-internal-token
 *         required: true
 *         schema:
 *           type: string
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
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [gestor, profesional, directivo]
 *     responses:
 *       201:
 *         description: Usuario creado
 *       401:
 *         description: Token interno inválido
 */
router.post('/', internalController.createUserInternal);

export default router;
