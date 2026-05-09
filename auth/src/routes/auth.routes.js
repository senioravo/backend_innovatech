// AS-TASK-02: Integrar con API Gateway
// Rutas de autenticación y autorización

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Endpoints de autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Endpoints de roles
router.get('/roles', authController.getRoles);
router.put('/usuarios/:id/rol', authController.updateUserRole);

// Health check
router.get('/health', authController.health);

module.exports = router;
