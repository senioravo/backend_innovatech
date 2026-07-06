/**
 * Controller de orquestación auth en el BFF.
 * Reenvía requests al ms-auth y devuelve la respuesta upstream tal cual.
 */
import authOrchestrationService from '../../../application/auth/authOrchestrationService.js';

/**
 * Serializa respuesta upstream (204, JSON o vacío).
 * @param {import('express').Response} res
 * @param {{ status: number; data?: unknown }} param1
 */
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
  /** POST register → ms-auth */
  async register(req, res, next) {
    try {
      const result = await authOrchestrationService.register(req.body);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** POST login → ms-auth */
  async login(req, res, next) {
    try {
      const result = await authOrchestrationService.login(req.body);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** POST logout → ms-auth (Bearer requerido) */
  async logout(req, res, next) {
    try {
      const result = await authOrchestrationService.logout(req);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** GET roles detallados */
  async getRoles(req, res, next) {
    try {
      const result = await authOrchestrationService.getRoles();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** GET roles/simple */
  async getRolesSimple(req, res, next) {
    try {
      const result = await authOrchestrationService.getRolesSimple();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** PUT usuarios/:id/rol — actualización de rol vía auth */
  async updateUserRole(req, res, next) {
    try {
      const result = await authOrchestrationService.updateUserRole(req.params.id, req.body, req);
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  },

  /** GET health de ms-auth */
  async health(req, res, next) {
    try {
      const result = await authOrchestrationService.health();
      return sendUpstream(res, result);
    } catch (err) {
      next(err);
    }
  }
};

export default authOrchestrationController;