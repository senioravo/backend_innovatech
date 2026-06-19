import {
  toProject,
  toTask,
  buildTaskSummary,
  buildSessionUser,
  extractRolesCatalog
} from '../src/application/transformers/frontendResponseTransformers.js';

describe('frontendResponseTransformers', () => {
  const userMap = new Map([
    ['u1', { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'gestor' }]
  ]);

  test('toProject maps PM fields to frontend contract', () => {
    const p = toProject(
      {
        id: 'p1',
        name: 'Proyecto A',
        description: 'Desc',
        assigneeId: 'u1',
        startDate: '2026-01-01',
        endDate: null,
        createdAt: '2026-01-01',
        updatedAt: null
      },
      userMap
    );
    expect(p.name).toBe('Proyecto A');
    expect(p.assignee.name).toBe('Ana');
  });

  test('toTask includes status and completed flag', () => {
    const t = toTask(
      {
        id: 't1',
        projectId: 'p1',
        title: 'Tarea',
        description: '',
        status: 'IN_PROGRESS',
        completed: false,
        assigneeId: null,
        startDate: null,
        endDate: null,
        createdAt: null,
        updatedAt: null
      },
      userMap
    );
    expect(t.title).toBe('Tarea');
    expect(t.status).toBe('IN_PROGRESS');
    expect(t.completed).toBe(false);
  });

  test('buildTaskSummary counts by status', () => {
    const summary = buildTaskSummary([
      { status: 'PENDING' },
      { status: 'PENDING' },
      { status: 'DONE' }
    ]);
    expect(summary.total).toBe(3);
    expect(summary.byStatus.PENDING).toBe(2);
    expect(summary.byStatus.DONE).toBe(1);
  });

  test('buildSessionUser merges JWT with role catalog', () => {
    const req = { user: { id: 1, email: 'a@b.com', role: 'gestor' } };
    const roles = extractRolesCatalog({
      data: [{ name: 'gestor', description: 'Gestor', permissions: { projects: ['view'] } }]
    });
    const user = buildSessionUser(req, roles);
    expect(user.role).toBe('gestor');
    expect(user.permissions.projects).toContain('view');
  });
});
