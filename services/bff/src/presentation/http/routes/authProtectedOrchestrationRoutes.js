const express = require('express');
const jwtAuthMiddleware = require('../middlewares/jwtAuthMiddleware');
const authOrchestrationController = require('../controllers/auth-orchestration-controller');

/** Rutas /api/auth/* que exigen JWT válido antes de delegar en Auth. */
const router = express.Router();

router.use(jwtAuthMiddleware);

router.post('/logout', authOrchestrationController.logout);
router.put('/usuarios/:id/rol', authOrchestrationController.updateUserRole);

module.exports = router;
