const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const consultationController = require('../controllers/consultation-controller');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  consultationController.getTaskDashboard
);

module.exports = router;
