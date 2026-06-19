jest.mock('../src/infrastructure/clients/projectManagerClient', () => ({
  getTaskDashboard: jest.fn(),
  listProjects: jest.fn()
}));

const projectManagerClient = require('../src/infrastructure/clients/projectManagerClient');
const kpiService = require('../src/application/kpiService');

describe('kpiService', () => {
  beforeEach(() => jest.clearAllMocks());

  const req = { headers: { authorization: 'Bearer token' } };

  test('getDashboard agrega proyectos y tareas', async () => {
    projectManagerClient.getTaskDashboard.mockResolvedValue({
      userId: 1,
      total: 2,
      countByStatus: { PENDING: 1, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 1 },
      tasks: [
        { id: 10, title: 'T1', status: 'DONE', completed: true, projectId: 5, projectName: 'P1' },
        { id: 11, title: 'T2', status: 'PENDING', completed: false, projectId: 5, projectName: 'P1' }
      ]
    });
    projectManagerClient.listProjects.mockResolvedValue({
      projects: [{ id: 5, name: 'P1', description: 'Desc' }]
    });

    const result = await kpiService.getDashboard(1, req);

    expect(result.userId).toBe('1');
    expect(result.summary.totalProjects).toBe(1);
    expect(result.summary.totalTasks).toBe(2);
    expect(result.summary.completionRate).toBe(0.5);
    expect(result.recentTasks).toHaveLength(2);
  });

  test('getDashboard exige userId', async () => {
    await expect(kpiService.getDashboard(null, req)).rejects.toThrow('userId is required');
  });

  test('getDashboard calcula countByStatus cuando upstream no lo envía', async () => {
    projectManagerClient.getTaskDashboard.mockResolvedValue({
      tasks: [{ id: 1, title: 'T', status: 'IN_PROGRESS', projectId: 1 }]
    });
    projectManagerClient.listProjects.mockResolvedValue({ projects: [] });

    const result = await kpiService.getDashboard(3, req);

    expect(result.summary.totalTasks).toBe(1);
    expect(result.summary.countByStatus.IN_PROGRESS).toBe(1);
    expect(result.summary.completionRate).toBe(0);
  });

  test('getDashboard propaga errores upstream', async () => {
    projectManagerClient.getTaskDashboard.mockRejectedValue({
      status: 503,
      body: { error: 'PM unavailable' }
    });
    projectManagerClient.listProjects.mockResolvedValue({ projects: [] });

    await expect(kpiService.getDashboard(1, req)).rejects.toMatchObject({
      status: 503,
      message: 'PM unavailable'
    });
  });
});
