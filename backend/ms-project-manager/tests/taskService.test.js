jest.mock('../src/repositories/taskRepository', () => ({
  findByProjectId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../src/services/resourceAvailabilityService', () => ({
  assertProjectAvailable: jest.fn(),
  assertTaskInProject: jest.fn(),
  assertTaskAvailable: jest.fn()
}));

const taskRepository = require('../src/repositories/taskRepository');
const resourceAvailabilityService = require('../src/services/resourceAvailabilityService');
const taskService = require('../src/services/taskService');
const { NotFoundError, ValidationError } = require('../src/utils/errorHandler');

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listTasksByProject delega en repositorio', async () => {
    resourceAvailabilityService.assertProjectAvailable.mockResolvedValue(undefined);
    taskRepository.findByProjectId.mockResolvedValue([{ id: 1, title: 'T1' }]);
    const rows = await taskService.listTasksByProject(3, 7);
    expect(rows).toHaveLength(1);
    expect(taskRepository.findByProjectId).toHaveBeenCalledWith(3);
  });

  test('listTasksByProject exige projectId y userId', async () => {
    await expect(taskService.listTasksByProject()).rejects.toThrow('projectId and userId are required');
  });

  test('createTask exige projectId y userId', async () => {
    await expect(taskService.createTask()).rejects.toThrow('projectId and userId are required');
  });

  test('updateTaskStatus avanza estado válido', async () => {
    resourceAvailabilityService.assertTaskInProject.mockResolvedValue({
      id: '1',
      status: 'PENDING'
    });
    taskRepository.update.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

    const task = await taskService.updateTaskStatus(1, 2, 3, 'IN_PROGRESS');
    expect(task.status).toBe('IN_PROGRESS');
  });

  test('updateTaskStatus rechaza transición inválida', async () => {
    resourceAvailabilityService.assertTaskInProject.mockResolvedValue({
      id: '1',
      status: 'PENDING'
    });
    await expect(taskService.updateTaskStatus(1, 2, 3, 'DONE')).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  test('deleteTask elimina cuando existe', async () => {
    resourceAvailabilityService.assertTaskAvailable.mockResolvedValue({ id: '9' });
    taskRepository.delete.mockResolvedValue(true);
    const ok = await taskService.deleteTask(9, 1);
    expect(ok).toBe(true);
  });

  test('deleteTask lanza NotFoundError', async () => {
    resourceAvailabilityService.assertTaskAvailable.mockResolvedValue({ id: '9' });
    taskRepository.delete.mockResolvedValue(false);
    await expect(taskService.deleteTask(9, 1)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('createTask delega en repositorio', async () => {
    resourceAvailabilityService.assertProjectAvailable.mockResolvedValue(undefined);
    taskRepository.create.mockResolvedValue({ id: '1', title: 'Nueva' });
    const task = await taskService.createTask(1, 2, {
      title: 'Nueva',
      description: 'Detalle largo',
      status: 'PENDING'
    });
    expect(task.title).toBe('Nueva');
    expect(taskRepository.create).toHaveBeenCalled();
  });

  test('updateTask rechaza transición inválida', async () => {
    resourceAvailabilityService.assertTaskAvailable.mockResolvedValue({
      id: '1',
      status: 'PENDING'
    });
    await expect(
      taskService.updateTask(1, 2, { status: 'DONE' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test('assignAssignee actualiza responsable', async () => {
    resourceAvailabilityService.assertTaskAvailable.mockResolvedValue({ id: '1' });
    taskRepository.update.mockResolvedValue({ id: '1', assigneeId: 'u-9' });
    const task = await taskService.assignAssignee(1, 2, 'u-9');
    expect(task.assigneeId).toBe('u-9');
  });
});
