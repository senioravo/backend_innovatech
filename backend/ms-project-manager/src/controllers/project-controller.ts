// @ts-nocheck
import projectService from '../services/projectService.js';
import { projectToDto } from '../dtos/projectDto.js';
import { auditFromRequest } from '../utils/auditLog.js';

const projectController = {
  async listProjects(req, res, next) {
    try {
      const projects = await projectService.listProjects(req.user.id, req.user.role);
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
      const project = await projectService.createProjectFromRequest(req.body, req.user.id);

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
      const project = await projectService.updateProjectFromRequest(
        req.params.id,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'PROJECT_UPDATE',
        resource: 'project',
        resourceId: req.params.id,
        meta: { fields: Object.keys(req.body) }
      });

      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async patchProjectStatus(req, res, next) {
    try {
      const project = await projectService.updateProjectStatusFromRequest(
        req.params.id,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'PROJECT_STATUS_UPDATE',
        resource: 'project',
        resourceId: req.params.id,
        meta: { status: req.body.status }
      });

      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  async assignAssignee(req, res, next) {
    try {
      const project = await projectService.assignAssigneeFromRequest(
        req.params.id,
        req.user.id,
        req.body
      );

      auditFromRequest(req, {
        action: 'PROJECT_ASSIGNEE',
        resource: 'project',
        resourceId: req.params.id,
        meta: { assigneeId: req.body.assigneeId }
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

export default projectController;
