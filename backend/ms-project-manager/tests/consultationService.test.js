jest.mock('../src/repositories/taskRepository.js', () => ({
  findForUserDashboard: jest.fn()
}));

import taskRepository from '../src/repositories/taskRepository.js';
import consultationService from '../src/services/consultationService.js';

describe('consultationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTaskDashboardForUser agrega tareas y conteos', async () => {
    taskRepository.findForUserDashboard.mockResolvedValue([
      {
        task: {
          id: 1,
          title: 'T1',
          description: 'D',
          status: 'PENDING',
          completed: false,
          project_id: 2,
          assignee_id: null,
          start_date: null,
          end_date: null
        },
        projectName: 'Proyecto A'
      }
    ]);

    const dashboard = await consultationService.getTaskDashboardForUser(5);

    expect(dashboard.userId).toBe(5);
    expect(dashboard.total).toBe(1);
    expect(dashboard.countByStatus.PENDING).toBe(1);
    expect(dashboard.tasks[0]).toMatchObject({ title: 'T1', projectName: 'Proyecto A' });
  });

  test('getTaskDashboardForUser exige userId', async () => {
    await expect(consultationService.getTaskDashboardForUser()).rejects.toThrow('userId is required');
  });
});
