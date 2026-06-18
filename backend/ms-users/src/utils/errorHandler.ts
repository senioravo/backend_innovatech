class ApplicationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  errors: string[];

  constructor(errors: string[]) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Usuario no encontrado') {
    super(message, 404);
  }
}

export { ApplicationError, ValidationError, NotFoundError };
