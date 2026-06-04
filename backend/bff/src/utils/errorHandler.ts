export {};
class ApplicationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  errors: unknown[];

  constructor(errors: unknown[]) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

/** Error propagado desde auth o project-manager (respuesta reenviada al cliente). */
class UpstreamError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`Upstream HTTP ${status}`);
    this.status = status;
    this.data = data;
    this.name = 'UpstreamError';
  }
}

module.exports = {
  ApplicationError,
  ValidationError,
  UpstreamError
};
