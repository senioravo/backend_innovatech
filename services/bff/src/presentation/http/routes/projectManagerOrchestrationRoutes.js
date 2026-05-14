const express = require('express');
const projectManagerOrchestrationController = require('../controllers/project-manager-orchestration-controller');

const router = express.Router();

function isProjectManagerPath(path) {
  return /^\/(projects|tasks|consultations)(\/|$)/.test(path);
}

router.use((req, res, next) => {
  if (!isProjectManagerPath(req.path)) {
    return next('route');
  }
  return projectManagerOrchestrationController.forward(req, res, next);
});

module.exports = router;
