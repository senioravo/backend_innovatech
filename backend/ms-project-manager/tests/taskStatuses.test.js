import { isValidTaskStatus,
  normalizeTaskStatus,
  isAllowedTaskStatusTransition } from '../src/constants/taskStatuses.js';

describe('taskStatuses', () => {
  test('normalizeTaskStatus convierte a mayúsculas', () => {
    expect(normalizeTaskStatus('in_progress')).toBe('IN_PROGRESS');
  });

  test('isValidTaskStatus acepta estados válidos', () => {
    expect(isValidTaskStatus('PENDING')).toBe(true);
    expect(isValidTaskStatus('DONE')).toBe(true);
    expect(isValidTaskStatus('invalid')).toBe(false);
  });

  test('isAllowedTaskStatusTransition permite solo el siguiente paso', () => {
    expect(isAllowedTaskStatusTransition('PENDING', 'IN_PROGRESS')).toBe(true);
    expect(isAllowedTaskStatusTransition('PENDING', 'DONE')).toBe(false);
    expect(isAllowedTaskStatusTransition('DONE', 'DONE')).toBe(true);
  });
});
