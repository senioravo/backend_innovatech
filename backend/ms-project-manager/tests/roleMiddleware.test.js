import requireRole from '../src/middlewares/roleMiddleware.js';

function mockRes() {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  return res;
}

describe('roleMiddleware', () => {
  test('permite rol autorizado', () => {
    const req = { user: { role: 'gestor' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor', 'Directivo')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rechaza sin rol', () => {
    const req = { user: {} };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza rol no permitido', () => {
    const req = { user: { role: 'profesional' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('Gestor')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
