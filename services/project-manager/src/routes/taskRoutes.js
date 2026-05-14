const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const taskController = require('../controllers/task-controller');

const router = express.Router();

router.use(authMiddleware);
router.put('/:id', requireRole('Gestor', 'Profesional'), taskController.updateTask);
router.patch(
  '/:id/responsable',
  requireRole('Gestor', 'Profesional'),
  taskController.assignResponsable
);
router.delete('/:id', requireRole('Gestor'), taskController.deleteTask);

module.exports = router;
