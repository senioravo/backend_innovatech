// @ts-nocheck
export {};
const projectService = require('../services/projectService');
const ValidationService = require('../services/validationService');
const {
  createProjectDto,
  projectToDto,
  pickProjectScheduleFields
} = require('../dtos/projectDto');
const { ValidationError } = require('../utils/errorHandler');
const { auditFromRequest } = require('../utils/auditLog');

const projectController = {
  async listProjects(req, res, next) {
    try {
      const projects = await projectService.listProjects(req.user.id);
      res.json({ projects: projects.map(projectToDto) });
    } catch (error) {
      next(error);
    }
  },

  async getProject(req, res, next) {
    try {
      const project = await projectService.getProject(req.params.id, req.user.id);
      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async createProject(req, res, next) {
    try {
      const validation = ValidationService.validateProjectInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const data = createProjectDto(req.body);
      const schedule = pickProjectScheduleFields(req.body);

      const project = await projectService.createProject({
        ...data,
        ...schedule,
        userId: req.user.id
      });

      auditFromRequest(req, {
        action: 'PROJECT_CREATE',
        resource: 'project',
        resourceId: project.id
      });

      res.status(201).json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req, res, next) {
    try {
      const validation = ValidationService.validateUpdateInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const updates = {};
      if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
        updates.name = String(req.body.name).trim();
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
        updates.description = String(req.body.description).trim();
      }
      Object.assign(updates, pickProjectScheduleFields(req.body));

      const project = await projectService.updateProject(req.params.id, req.user.id, updates);

      auditFromRequest(req, {
        action: 'PROJECT_UPDATE',
        resource: 'project',
        resourceId: req.params.id,
        meta: { fields: Object.keys(updates) }
      });

      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async assignAssignee(req, res, next) {
    try {
      const validation = ValidationService.validateAssigneeInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }
      const assigneeId = String(req.body.assigneeId).trim();
      const project = await projectService.assignAssignee(req.params.id, req.user.id, assigneeId);

      auditFromRequest(req, {
        action: 'PROJECT_ASSIGNEE',
        resource: 'project',
        resourceId: req.params.id,
        meta: { assigneeId }
      });

      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req, res, next) {
    try {
      await projectService.deleteProject(req.params.id, req.user.id);

      auditFromRequest(req, {
        action: 'PROJECT_DELETE',
        resource: 'project',
        resourceId: req.params.id
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
