"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApplicationError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = 'ApplicationError';
    }
}
class UpstreamError extends ApplicationError {
    constructor(status, body) {
        super(typeof body?.error === 'string' ? body.error : `Upstream error (${status})`, status);
        this.body = body;
    }
}
module.exports = { ApplicationError, UpstreamError };
