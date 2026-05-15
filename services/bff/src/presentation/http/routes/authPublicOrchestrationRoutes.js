const express = require('express');
const authOrchestrationController = require('../controllers/auth-orchestration-controller');

/** Rutas /api/auth/* públicas (sin JWT en el BFF). */
const router = express.Router();

router.post('/register', authOrchestrationController.register);
router.post('/login', authOrchestrationController.login);
router.get('/roles', authOrchestrationController.getRoles);
router.get('/roles/simple', authOrchestrationController.getRolesSimple);
router.get('/health', authOrchestrationController.health);

module.exports = router;
