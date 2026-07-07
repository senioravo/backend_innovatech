/**
 * Servicio de validación de entradas HTTP.
 * Valida DTOs de proyectos y tareas (creación, actualización, estados y asignaciones).
 */
import { isValidTaskStatus, normalizeTaskStatus, TASK_STATUSES } from '../constants/taskStatuses.js';
import { isValidProjectStatus, normalizeProjectStatus, PROJECT_STATUSES } from '../constants/projectStatuses.js';

class ValidationService {
  static hasOwn(data, key) {
    return Object.prototype.hasOwnProperty.call(data, key);
  }

  /**
   * Valida un campo de fecha ISO opcional (YYYY-MM-DD).
   * @param {Record<string, unknown>} data - Objeto de entrada
   * @param {string} field - Nombre del campo
   * @param {string[]} errors - Array mutable de errores
   * @returns {string|null|undefined} Fecha normalizada, null o undefined si no aplica
   */
  static optionalIsoDate(data, field, errors) {
    if (!ValidationService.hasOwn(data, field)) return undefined;
    const v = data[field];
    if (v === null || v === '') return null;
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      errors.push(`${field} must be a date in YYYY-MM-DD format`);
      return undefined;
    }
    return v;
  }

  /**
   * Valida datos de creación de proyecto.
   * @param {Record<string, unknown>} data - Body del request
   * @returns {{ isValid: boolean; errors: string[] }} Resultado de validación
   */
  static validateProjectInput(data) {
    const errors = [];
    const name = data.name;
    const description = data.description;

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('name is required and must be a string');
    } else if (name.trim().length < 3) {
      errors.push('name must be at least 3 characters');
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      errors.push('description is required and must be a string');
    } else if (description.trim().length < 10) {
      errors.push('description must be at least 10 characters');
    }

    const start = ValidationService.optionalIsoDate(data, 'startDate', errors);
    const end = ValidationService.optionalIsoDate(data, 'endDate', errors);
    if (errors.length === 0 && start && end && end.localeCompare(start) < 0) {
      errors.push('endDate cannot be before startDate');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida actualización parcial de proyecto.
   * @param {Record<string, unknown>} data - Body del request
   * @returns {{ isValid: boolean; errors: string[] }} Resultado de validación
   */
  static validateUpdateInput(data) {
    const errors = [];
    const name = data.name;
    const description = data.description;

    const hasName = ValidationService.hasOwn(data, 'name');
    const hasDescription = ValidationService.hasOwn(data, 'description');
    const hasStart = ValidationService.hasOwn(data, 'startDate');
    const hasEnd = ValidationService.hasOwn(data, 'endDate');

    if (!hasName && !hasDescription && !hasStart && !hasEnd) {
      errors.push('Provide at least one of: name, description, startDate, endDate');
    }

    if (hasName) {
      if (!name || typeof name !== 'string' || !name.trim() || name.trim().length < 3) {
        errors.push('name must be at least 3 characters');
      }
    }

    if (hasDescription) {
      if (typeof description !== 'string' || description.trim().length < 10) {
        errors.push('description must be at least 10 characters');
      }
    }

    const start = hasStart ? ValidationService.optionalIsoDate(data, 'startDate', errors) : undefined;
    const end = hasEnd ? ValidationService.optionalIsoDate(data, 'endDate', errors) : undefined;

    if (errors.length === 0 && start && end && end.localeCompare(start) < 0) {
      errors.push('endDate cannot be before startDate');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de creación de tarea.
   * @param {Record<string, unknown>} data - Body del request
   * @returns {{ isValid: boolean; errors: string[] }} Resultado de validación
   */
  static validateTaskInput(data) {
    const errors = [];
    const title = data.title;
    const description = data.description;

    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('title is required and must be a string');
    } else if (title.trim().length < 3) {
      errors.push('title must be at least 3 characters');
    }

    if (description !== undefined && description !== null && String(description).trim() !== '') {
      if (typeof description !== 'string' || description.trim().length < 10) {
        errors.push('description, if provided, must be at least 10 characters');
      }
    }

    const start = ValidationService.optionalIsoDate(data, 'startDate', errors);
    const end = ValidationService.optionalIsoDate(data, 'endDate', errors);
    if (errors.length === 0 && start && end && end.localeCompare(start) < 0) {
      errors.push('endDate cannot be before startDate');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida cambio de estado de tarea y devuelve valor normalizado.
   * @param {Record<string, unknown>} data - Body con campo status
   * @returns {{ isValid: boolean; errors: string[]; normalized?: string }} Resultado con estado normalizado
   */
  static validateTaskStatusInput(data) {
    const errors = [];
    const s = data.status;
    if (s === undefined || s === null || (typeof s === 'string' && !s.trim())) {
      errors.push('status is required');
    } else if (!isValidTaskStatus(s)) {
      errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
    }
    const normalized = errors.length === 0 ? normalizeTaskStatus(s) : undefined;
    return {
      isValid: errors.length === 0,
      errors,
      normalized
    };
  }

  /**
   * Valida actualización parcial de tarea.
   * @param {Record<string, unknown>} data - Body del request
   * @returns {{ isValid: boolean; errors: string[] }} Resultado de validación
   */
  static validateTaskUpdateInput(data) {
    const errors = [];
    const title = data.title;
    const description = data.description;

    const hasTitle = ValidationService.hasOwn(data, 'title');
    const hasDescription = ValidationService.hasOwn(data, 'description');
    const hasCompleted = ValidationService.hasOwn(data, 'completed');
    const hasStatus = ValidationService.hasOwn(data, 'status');
    const hasStart = ValidationService.hasOwn(data, 'startDate');
    const hasEnd = ValidationService.hasOwn(data, 'endDate');

    if (!hasTitle && !hasDescription && !hasCompleted && !hasStatus && !hasStart && !hasEnd) {
      errors.push(
        'Provide at least one of: title, description, completed, status, startDate, endDate'
      );
    }

    if (hasTitle) {
      if (!title || typeof title !== 'string' || !title.trim() || title.trim().length < 3) {
        errors.push('title must be at least 3 characters');
      }
    }

    if (hasDescription) {
      if (typeof description !== 'string' || description.trim().length < 10) {
        errors.push('description must be at least 10 characters');
      }
    }

    if (hasCompleted && typeof data.completed !== 'boolean') {
      errors.push('completed must be a boolean');
    }

    if (hasStatus) {
      if (!isValidTaskStatus(data.status)) {
        errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
      }
    }

    const start = hasStart ? ValidationService.optionalIsoDate(data, 'startDate', errors) : undefined;
    const end = hasEnd ? ValidationService.optionalIsoDate(data, 'endDate', errors) : undefined;

    if (errors.length === 0 && start && end && end.localeCompare(start) < 0) {
      errors.push('endDate cannot be before startDate');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida cambio de estado de proyecto y devuelve valor normalizado.
   * @param {Record<string, unknown>} data - Body con campo status
   * @returns {{ isValid: boolean; errors: string[]; normalized?: string }} Resultado con estado normalizado
   */
  static validateProjectStatusInput(data) {
    const errors = [];
    const s = data.status;
    if (s === undefined || s === null || (typeof s === 'string' && !s.trim())) {
      errors.push('status is required');
    } else if (!isValidProjectStatus(s)) {
      errors.push(`status must be one of: ${PROJECT_STATUSES.join(', ')}`);
    }
    const normalized = errors.length === 0 ? normalizeProjectStatus(s) : undefined;
    return {
      isValid: errors.length === 0,
      errors,
      normalized
    };
  }

  /**
   * Valida asignación de responsable (assigneeId).
   * @param {Record<string, unknown>} data - Body con assigneeId
   * @returns {{ isValid: boolean; errors: string[] }} Resultado de validación
   */
  static validateAssigneeInput(data) {
    const errors = [];
    const id = data.assigneeId;
    if (id === undefined || id === null) {
      errors.push('assigneeId is required');
    } else if (typeof id !== 'string' || !id.trim()) {
      errors.push('assigneeId must be a non-empty string');
    } else if (id.trim().length > 120) {
      errors.push('assigneeId is too long');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ValidationService;
