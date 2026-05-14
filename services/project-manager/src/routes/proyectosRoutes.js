const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const projectController = require('../controllers/project-controller');

const router = express.Router();

router.use(authMiddleware);
router.post('/', requireRole('Gestor'), projectController.createProject);
router.delete('/:id', requireRole('Gestor'), projectController.deleteProject);

module.exports = router;
