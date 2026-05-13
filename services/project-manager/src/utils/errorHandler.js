class ApplicationError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  constructor(errors) {
    super('Errores de validación', 400);
    this.errors = errors;
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

module.exports = {
  ApplicationError,
  ValidationError,
  NotFoundError,
  UnauthorizedError
};
