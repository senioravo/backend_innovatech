"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
module.exports = {
    ApplicationError,
    ValidationError,
    NotFoundError,
    UnauthorizedError
};
