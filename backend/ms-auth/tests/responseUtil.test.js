import { describe, it, expect } from '@jest/globals';
import { handleError, handleNotFound } from '../src/utils/responseUtil.js';
import { ValidationError, UnauthorizedError, ApplicationError } from '../src/utils/appError.js';

describe('responseUtil global handlers', () => {
  const res = () => {
    const out = { statusCode: 200, body: null };
    return {
      headersSent: false,
      status(code) {
        out.statusCode = code;
        return this;
      },
      json(payload) {
        out.body = payload;
        return this;
      },
      get output() {
        return out;
      }
    };
  };

  it('handleNotFound returns 404', () => {
    const r = res();
    handleNotFound({}, r);
    expect(r.output.statusCode).toBe(404);
  });

  it('handleError maps ValidationError', () => {
    const r = res();
    handleError(new ValidationError(['Invalid email']), {}, r, () => {});
    expect(r.output.statusCode).toBe(400);
    expect(r.output.body.success).toBe(false);
  });

  it('handleError maps UnauthorizedError', () => {
    const r = res();
    handleError(new UnauthorizedError('Bad credentials'), {}, r, () => {});
    expect(r.output.statusCode).toBe(401);
  });

  it('handleError maps ApplicationError', () => {
    const r = res();
    handleError(new ApplicationError('Conflict', 409), {}, r, () => {});
    expect(r.output.statusCode).toBe(409);
  });

  it('handleError returns 500 for unknown errors', () => {
    const r = res();
    handleError(new Error('boom'), {}, r, () => {});
    expect(r.output.statusCode).toBe(500);
  });
});
