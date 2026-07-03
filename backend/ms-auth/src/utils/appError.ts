class ApplicationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  errors: unknown;

  constructor(errors: unknown) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'Credenciales inválidas') {
    super(message, 401);
  }
}

export { ApplicationError, ValidationError, UnauthorizedError };
