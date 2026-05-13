const ProjectModel = require('../models/projectModel');
const IProjectRepository = require('../interfaces/IProjectRepository');

const projects = [];

/**
 * Implementación en memoria del repositorio de proyectos
 * Nota: En producción, reemplazar con una base de datos real
 */
class ProjectRepository extends IProjectRepository {
  findByUserId(userId) {
    if (!userId) throw new Error('userId es requerido');
    return projects.filter(project => project.userId === userId);
  }

  findByIdAndUserId(id, userId) {
    if (!id || !userId) throw new Error('id y userId son requeridos');
    return projects.find(project => project.id === id && project.userId === userId);
  }

  create(data) {
    if (!data || !data.userId) throw new Error('data y userId son requeridos');
    const project = new ProjectModel(data);
    projects.push(project);
    return project;
  }

  update(id, userId, updates) {
    if (!id || !userId) throw new Error('id y userId son requeridos');
    const project = this.findByIdAndUserId(id, userId);
    if (!project) return null;
    Object.assign(project, updates);
    return project;
  }

  delete(id, userId) {
    if (!id || !userId) throw new Error('id y userId son requeridos');
    const index = projects.findIndex(project => project.id === id && project.userId === userId);
    if (index === -1) return false;
    projects.splice(index, 1);
    return true;
  }
}

module.exports = new ProjectRepository();
