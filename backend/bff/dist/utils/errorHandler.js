// @ts-nocheck
class ApplicationError extends Error {
    status;
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = 'ApplicationError';
    }
}
class ValidationError extends ApplicationError {
    errors;
    constructor(errors) {
        super('Validation failed', 400);
        this.errors = errors;
    }
}
/** Error propagado desde auth o project-manager (respuesta reenviada al cliente). */
class UpstreamError extends Error {
    status;
    data;
    constructor(status, data) {
        super(`Upstream HTTP ${status}`);
        this.status = status;
        this.data = data;
        this.name = 'UpstreamError';
    }
}
export { ApplicationError, ValidationError, UpstreamError };
