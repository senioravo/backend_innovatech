class ApplicationError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  constructor(errors) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

module.exports = {
  ApplicationError,
  ValidationError
};
