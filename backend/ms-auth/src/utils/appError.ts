/**
 * Jerarquía de errores de aplicación para ms-auth.
 * Permite mapear excepciones de dominio a códigos HTTP en controllers.
 */

/** Error base con código HTTP asociado */
class ApplicationError extends Error {
  status: number;

  /**
   * @param {string} message - Mensaje legible para el cliente
   * @param {number} [status=500] - Código HTTP de respuesta
   */
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

/** Error 400 con lista de errores de validación por campo */
class ValidationError extends ApplicationError {
  errors: unknown;

  /**
   * @param {unknown} errors - Array o objeto con detalle de validación
   */
  constructor(errors: unknown) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

/** Error 401 para credenciales inválidas o token rechazado */
class UnauthorizedError extends ApplicationError {
  /**
   * @param {string} [message='Credenciales inválidas'] - Mensaje de respuesta
   */
  constructor(message = 'Credenciales inválidas') {
    super(message, 401);
  }
}

export { ApplicationError, ValidationError, UnauthorizedError };
