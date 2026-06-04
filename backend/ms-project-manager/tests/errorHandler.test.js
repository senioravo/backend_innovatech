const {
  ValidationError,
  NotFoundError,
  ApplicationError
} = require('../src/utils/errorHandler');

describe('errorHandler', () => {
  test('ValidationError tiene status 400 y errors', () => {
    const err = new ValidationError(['campo invalido']);
    expect(err.status).toBe(400);
    expect(err.errors).toEqual(['campo invalido']);
    expect(err).toBeInstanceOf(ApplicationError);
  });

  test('NotFoundError tiene status 404', () => {
    const err = new NotFoundError('Task not found');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Task not found');
  });
});
