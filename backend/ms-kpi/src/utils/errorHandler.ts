class ApplicationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

class UpstreamError extends ApplicationError {
  body: unknown;

  constructor(status: number, body: unknown) {
    const payload = body as Record<string, unknown> | null;
    super(typeof payload?.error === 'string' ? payload.error : `Upstream error (${status})`, status);
    this.body = body;
  }
}

module.exports = { ApplicationError, UpstreamError };
