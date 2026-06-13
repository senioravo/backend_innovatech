const {
  handleNotFound,
  handleError
} = require('../src/utils/responseUtil');
const {
  ValidationError,
  ApplicationError,
  UpstreamError
} = require('../src/utils/errorHandler');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((body) => {
    res.body = body;
    return res;
  });
  res.type = jest.fn(() => res);
  res.send = jest.fn((body) => {
    res.body = body;
    return res;
  });
  return res;
}

describe('responseUtil', () => {
  test('handleNotFound responde 404', () => {
    const res = mockRes();
    handleNotFound({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Route not found' });
  });

  test('handleError con ValidationError', () => {
    const res = mockRes();
    const err = new ValidationError(['campo requerido']);
    handleError(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body.errors).toEqual(['campo requerido']);
  });

  test('handleError con ApplicationError', () => {
    const res = mockRes();
    const err = new ApplicationError('fallo', 422);
    handleError(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('handleError con UpstreamError JSON', () => {
    const res = mockRes();
    const err = new UpstreamError(502, { error: 'bad gateway' });
    handleError(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.body).toEqual({ error: 'bad gateway' });
  });

  test('handleError con UpstreamError 204', () => {
    const res = mockRes();
    const err = new UpstreamError(204, null);
    handleError(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('handleError con UpstreamError texto plano', () => {
    const res = mockRes();
    const err = new UpstreamError(400, 'plain error');
    handleError(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('plain error');
  });

  test('handleError genérico 500', () => {
    const res = mockRes();
    handleError(new Error('boom'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
