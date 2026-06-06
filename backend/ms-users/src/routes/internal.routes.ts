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
 * GET /api/users/internal/by-email/:email
 * Buscar usuario por email incluyendo password (solo para ms-auth)
 */
router.get('/by-email/:email', internalController.getUserByEmailWithPassword);

/**
 * POST /api/users/internal
 * Crear usuario desde otro microservicio
 */
router.post('/', internalController.createUserInternal);

module.exports = router;
