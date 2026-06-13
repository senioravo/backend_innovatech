// @ts-nocheck
export {};
// Rutas internas - Solo para comunicación entre microservicios
// Responsabilidad: Definir endpoints internos protegidos

const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internal.controller');
const { validateInternalToken } = require('../middleware/internal.middleware');

// ⚠️ IMPORTANTE: Todas las rutas internas requieren autenticación de servicio
router.use(validateInternalToken);

/**
 * @openapi
 * /api/users/internal/by-email/{email}:
 *   get:
 *     tags: [Internal]
 *     summary: Buscar usuario por email (incluye password hash)
 *     description: Endpoint interno para comunicación entre microservicios.
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
router.get('/by-email/:email', internalController.getUserByEmailWithPassword);

/**
 * @openapi
 * /api/users/internal:
 *   post:
 *     tags: [Internal]
 *     summary: Crear usuario desde otro microservicio
 *     description: Endpoint interno para comunicación entre microservicios.
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Solicitud inválida
 */
router.post('/', internalController.createUserInternal);

module.exports = router;
