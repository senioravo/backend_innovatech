/**
 * Jerarquía de errores de aplicación para ms-project-manager.
 * Permite mapear excepciones de dominio a códigos HTTP en el handler global.
 */

/** Error base con código HTTP asociado */
class ApplicationError extends Error {
  status: number;

  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} [status=500] - Código HTTP
   */
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

/** Error de validación de entrada (400) con lista de errores de campo */
class ValidationError extends ApplicationError {
  errors: unknown;

  /**
   * @param {unknown} errors - Detalle de errores de validación
   */
  constructor(errors: unknown) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

/** Recurso no encontrado (404) */
class NotFoundError extends ApplicationError {
  /**
   * @param {string} [message='Resource not found'] - Mensaje descriptivo
   */
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** Acceso no autenticado (401) */
class UnauthorizedError extends ApplicationError {
  /**
   * @param {string} [message='Unauthorized'] - Mensaje descriptivo
   */
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** Acceso prohibido por permisos (403) */
class ForbiddenError extends ApplicationError {
  /**
   * @param {string} [message='Forbidden'] - Mensaje descriptivo
   */
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export { ApplicationError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };
