const { handleNotFound, handleError } = require('../src/utils/responseUtil');
const { ValidationError, NotFoundError } = require('../src/utils/errorHandler');

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
  return res;
}

describe('responseUtil (PM)', () => {
  test('handleNotFound responde 404', () => {
    const res = mockRes();
    handleNotFound({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('handleError con ValidationError', () => {
    const res = mockRes();
    handleError(new ValidationError(['invalid']), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('handleError con NotFoundError', () => {
    const res = mockRes();
    handleError(new NotFoundError('missing'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body.error).toBe('missing');
  });

  test('handleError genérico 500', () => {
    const res = mockRes();
    handleError(new Error('fail'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
