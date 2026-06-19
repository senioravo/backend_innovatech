import { jest } from '@jest/globals';
import jwtAuthMiddleware from '../src/presentation/http/middlewares/jwtAuthMiddleware.js';

function mockRes() {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  return res;
}

describe('jwtAuthMiddleware', () => {
  test('acepta headers KrakenD X-User-*', () => {
    const req = {
      headers: {
        'x-user-id': '7',
        'x-user-email': 'gestor@test.cl',
        'x-user-role': 'gestor'
      }
    };
    const res = mockRes();
    const next = jest.fn();

    jwtAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      id: 7,
      email: 'gestor@test.cl',
      role: 'gestor'
    });
  });

  test('rechaza petición sin identidad', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    jwtAuthMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('rechaza Bearer inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = mockRes();
    const next = jest.fn();

    jwtAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
