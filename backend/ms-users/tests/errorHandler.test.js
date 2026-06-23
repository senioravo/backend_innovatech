import {
  ApplicationError,
  NotFoundError,
  ValidationError
} from '../src/utils/errorHandler.js';

describe('errorHandler (ms-users)', () => {
  test('ApplicationError conserva status', () => {
    const err = new ApplicationError('fallo', 422);
    expect(err.message).toBe('fallo');
    expect(err.status).toBe(422);
  });

  test('ValidationError incluye lista de errores', () => {
    const err = new ValidationError(['email inválido']);
    expect(err.status).toBe(400);
    expect(err.errors).toEqual(['email inválido']);
  });

  test('NotFoundError usa 404', () => {
    const err = new NotFoundError('Usuario no encontrado');
    expect(err.status).toBe(404);
  });
});
