import requireRole from '../src/presentation/http/middlewares/requireRoleMiddleware.js';

function mockRes() {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  return res;
}

describe('requireRoleMiddleware', () => {
  test('permite rol en lista (case insensitive)', () => {
    const req = { user: { role: 'gestor' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor', 'Profesional')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rechaza rol no permitido con 403', () => {
    const req = { user: { role: 'directivo' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rechaza sin rol asignado', () => {
    const req = { user: {} };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
