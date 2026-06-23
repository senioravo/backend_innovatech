// @ts-nocheck
/**
 * Contract for project repository implementations.
 */
class IProjectRepository {
  findByUserId(userId) {
    throw new Error('Método findByUserId no implementado');
  }

  findByIdAndUserId(id, userId) {
    throw new Error('Método findByIdAndUserId no implementado');
  }

  findById(id) {
    throw new Error('Método findById no implementado');
  }

  create(data) {
    throw new Error('Método create no implementado');
  }

  update(id, userId, updates) {
    throw new Error('Método update no implementado');
  }

  updateStatusByAssignee(id, assigneeId, status) {
    throw new Error('Método updateStatusByAssignee no implementado');
  }

  delete(id, userId) {
    throw new Error('Método delete no implementado');
  }
}

export default IProjectRepository;;