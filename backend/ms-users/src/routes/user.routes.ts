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
router.post('/', verifyToken, userController.createUser);
router.get('/', verifyToken, userController.listUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, requireRole(['gestor', 'directivo']), userController.deleteUser);

// Cambio de rol - solo gestores y directivos
router.put('/:id/role', verifyToken, requireRole(['gestor', 'directivo']), userController.changeUserRole);

// Búsqueda por email
router.get('/email/:email', verifyToken, userController.getUserByEmail);

module.exports = router;
