const authOrchestrationService = require('../../../application/auth/authOrchestrationService');

function sendUpstream(res, { status, data }) {
  if (status === 204) {
    return res.status(204).send();
  }
  if (data === undefined) {
    return res.status(status).end();
  }
  return res.status(status).json(data);
}

const authOrchestrationController = {
  async register(req, res, next) {
    try {
      const result = await authOrchestrationService.register(req.body);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authOrchestrationService.login(req.body);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const result = await authOrchestrationService.logout(req);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getRoles(req, res, next) {
    try {
      const result = await authOrchestrationService.getRoles();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getRolesSimple(req, res, next) {
    try {
      const result = await authOrchestrationService.getRolesSimple();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const result = await authOrchestrationService.updateUserRole(req.params.id, req.body, req);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  async health(req, res, next) {
    try {
      const result = await authOrchestrationService.health();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authOrchestrationController;
