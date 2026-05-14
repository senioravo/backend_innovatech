const express = require('express');
const authOrchestrationController = require('../controllers/auth-orchestration-controller');

const router = express.Router();

router.post('/register', authOrchestrationController.register);
router.post('/login', authOrchestrationController.login);
router.post('/logout', authOrchestrationController.logout);
router.get('/roles', authOrchestrationController.getRoles);
router.get('/roles/simple', authOrchestrationController.getRolesSimple);
router.put('/usuarios/:id/rol', authOrchestrationController.updateUserRole);
router.get('/health', authOrchestrationController.health);

module.exports = router;
