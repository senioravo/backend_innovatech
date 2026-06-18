import { isValidProjectStatus,
  normalizeProjectStatus } from '../src/constants/projectStatuses.js';

describe('projectStatuses', () => {
  test('normalizeProjectStatus convierte a minúsculas', () => {
    expect(normalizeProjectStatus('ACTIVE')).toBe('active');
    expect(normalizeProjectStatus(' Terminated ')).toBe('terminated');
  });

  test('isValidProjectStatus acepta estados válidos', () => {
    expect(isValidProjectStatus('active')).toBe(true);
    expect(isValidProjectStatus('TERMINATED')).toBe(true);
    expect(isValidProjectStatus('invalid')).toBe(false);
  });
});
