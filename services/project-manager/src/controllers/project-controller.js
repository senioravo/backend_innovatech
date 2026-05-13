const projectService = require('../services/projectService');
const ValidationService = require('../services/validationService');
const { createProjectDto, projectToDto } = require('../dtos/projectDto');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Controlador de proyectos
 * Responsabilidad única: manejar peticiones HTTP
 * Delegación: validación → ValidationService, lógica → projectService, transformación → DTO
 */
const projectController = {
  listProjects(req, res, next) {
    try {
      const projects = projectService.listProjects(req.user.id);
      res.json({ projects: projects.map(projectToDto) });
    } catch (error) {
      next(error);
    }
  },

  getProject(req, res, next) {
    try {
      const project = projectService.getProject(req.params.id, req.user.id);
      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  createProject(req, res, next) {
    try {
      // 1. Validar entrada
      const validation = ValidationService.validateProjectInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      // 2. Mapear DTO
      const data = createProjectDto(req.body);

      // 3. Procesar (delegado al servicio)
      const project = projectService.createProject({
        ...data,
        userId: req.user.id
      });

      res.status(201).json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  updateProject(req, res, next) {
    try {
      // 1. Validar entrada
      const validation = ValidationService.validateUpdateInput(req.body);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      // 2. Mapear DTO
      const updates = createProjectDto(req.body);

      // 3. Procesar (delegado al servicio)
      const project = projectService.updateProject(req.params.id, req.user.id, updates);

      res.json(projectToDto(project));
    } catch (error) {
      next(error);
    }
  },

  deleteProject(req, res, next) {
    try {
      projectService.deleteProject(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
