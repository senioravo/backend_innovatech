import { UpstreamError, ValidationError } from '../src/utils/errorHandler.js';

describe('bff errorHandler', () => {
  test('UpstreamError guarda status y data', () => {
    const err = new UpstreamError(401, { error: 'Unauthorized' });
    expect(err.status).toBe(401);
    expect(err.data).toEqual({ error: 'Unauthorized' });
    expect(err.name).toBe('UpstreamError');
  });

  test('ValidationError es instancia de Error', () => {
    const err = new ValidationError(['status is required']);
    expect(err).toBeInstanceOf(Error);
    expect(err.errors).toHaveLength(1);
  });
});
