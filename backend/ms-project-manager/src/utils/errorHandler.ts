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

class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export { ApplicationError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };
