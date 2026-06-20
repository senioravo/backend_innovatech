const { countByStatus, completionRate } = require('../src/domain/taskStatuses');

describe('taskStatuses domain', () => {
  test('countByStatus agrupa tareas por estado', () => {
    const counts = countByStatus([
      { status: 'PENDING' },
      { status: 'DONE' },
      { status: 'DONE' },
      { status: 'UNKNOWN' }
    ]);

    expect(counts.PENDING).toBe(1);
    expect(counts.DONE).toBe(2);
    expect(counts.IN_PROGRESS).toBe(0);
  });

  test('completionRate calcula proporción DONE', () => {
    expect(completionRate({ DONE: 2, PENDING: 2 }, 4)).toBe(0.5);
    expect(completionRate({}, 0)).toBe(0);
  });
});
