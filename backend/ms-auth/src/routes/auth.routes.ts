// @ts-nocheck
export {};
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

// Endpoints de autenticación (SOLO autenticación)
// NOTA: /register fue movido a ms-users (POST /api/users)
router.post('/login', auditCriticalOperation('LOGIN'), authController.login);

// AS-TASK-07: Logout requiere token válido
router.post('/logout', verifyToken, auditCriticalOperation('LOGOUT'), authController.logout);

// Endpoints de roles (solo lectura - información de configuración)
router.get('/roles', authController.getRoles);
// AS-TASK-10: Endpoint simplificado que retorna solo nombres de roles
router.get('/roles/simple', authController.getRolesSimple);

// NOTA: Endpoints de gestión de usuarios fueron movidos a ms-users:
// - GET /usuarios/:id → ms-users: GET /api/users/:id
// - PUT /usuarios/:id/rol → ms-users: PUT /api/users/:id/role

// Health check
router.get('/health', authController.health);

module.exports = router;

