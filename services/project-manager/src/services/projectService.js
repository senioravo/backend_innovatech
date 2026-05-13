const projectRepository = require('../repositories/projectRepository');
const { NotFoundError } = require('../utils/errorHandler');

/**
 * Servicio de lógica de negocio para proyectos
 * Responsabilidad única: orquestar operaciones de proyectos
 * Inyección de dependencia: recibe repositorio
 */
class ProjectService {
  constructor(repository = projectRepository) {
    this.repository = repository;
  }

  listProjects(userId) {
    if (!userId) throw new Error('userId es requerido');
    return this.repository.findByUserId(userId);
  }

  getProject(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    const project = this.repository.findByIdAndUserId(projectId, userId);
    if (!project) throw new NotFoundError('Proyecto no encontrado');
    return project;
  }

  createProject({ name, description, userId }) {
    if (!name || !description || !userId) {
      throw new Error('name, description y userId son requeridos');
    }

    return this.repository.create({
      id: `${Date.now()}`,
      userId,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString()
    });
  }

  updateProject(projectId, userId, updates) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    
    const project = this.repository.update(projectId, userId, {
      name: updates.name?.trim(),
      description: updates.description?.trim()
    });

    if (!project) throw new NotFoundError('Proyecto no encontrado');
    return project;
  }

  deleteProject(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId y userId son requeridos');
    const deleted = this.repository.delete(projectId, userId);
    if (!deleted) throw new NotFoundError('Proyecto no encontrado');
    return true;
  }
}

// Exportar instancia singleton
module.exports = new ProjectService();
