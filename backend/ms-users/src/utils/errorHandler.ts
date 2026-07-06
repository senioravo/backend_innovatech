/**
 * Errores de dominio HTTP para ms-users (validación, no encontrado, genérico).
 */

/**
 * Error base con código de estado HTTP.
 * @param {string} message - Mensaje descriptivo del error
 * @param {number} [status=500] - Código HTTP asociado
 */
class ApplicationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

/**
 * Error de validación de datos de entrada (400).
 * @param {string[]} errors - Lista de mensajes de validación
 */
class ValidationError extends ApplicationError {
  errors: string[];

  constructor(errors: string[]) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

/**
 * Recurso no encontrado (404).
 * @param {string} [message='Usuario no encontrado'] - Mensaje personalizado
 */
class NotFoundError extends ApplicationError {
  constructor(message = 'Usuario no encontrado') {
    super(message, 404);
  }
}

export { ApplicationError, ValidationError, NotFoundError };
