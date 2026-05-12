// AS-TASK-02: Integrar con API Gateway
// Rutas de autenticación y autorización

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// AS-TASK-07: Importar middleware de autenticación
const { verifyToken } = require('../middleware/auth.middleware');

// Endpoints de autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);

// AS-TASK-07: Logout requiere token válido
router.post('/logout', verifyToken, authController.logout);

// Endpoints de roles
router.get('/roles', authController.getRoles);
// AS-TASK-10: Endpoint simplificado que retorna solo nombres de roles
router.get('/roles/simple', authController.getRolesSimple);
router.put('/usuarios/:id/rol', authController.updateUserRole);

// Health check
router.get('/health', authController.health);

module.exports = router;
