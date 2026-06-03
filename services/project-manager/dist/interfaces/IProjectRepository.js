"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    create(data) {
        throw new Error('Método create no implementado');
    }
    update(id, userId, updates) {
        throw new Error('Método update no implementado');
    }
    delete(id, userId) {
        throw new Error('Método delete no implementado');
    }
}
module.exports = IProjectRepository;
