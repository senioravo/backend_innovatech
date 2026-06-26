import { jest } from '@jest/globals';
import taskRepository from '../src/repositories/taskRepository.js';
import resourceAvailabilityService from '../src/services/resourceAvailabilityService.js';
import taskService from '../src/services/taskService.js';
import { NotFoundError, ValidationError } from '../src/utils/errorHandler.js';

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('listTasksByProject delega en repositorio', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertProjectAvailable').mockResolvedValue(undefined);
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
    jest.spyOn(resourceAvailabilityService, 'assertTaskInProject').mockResolvedValue({
      task: { id: '1', status: 'PENDING', assigneeId: null },
      project: { userId: '3' }
    });
    taskRepository.updateInProject.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

    const task = await taskService.updateTaskStatus(1, 2, 3, 'gestor', 'IN_PROGRESS');
    expect(task.status).toBe('IN_PROGRESS');
    expect(taskRepository.updateInProject).toHaveBeenCalledWith(1, 2, {
      status: 'IN_PROGRESS',
      completed: false
    });
  });

  test('updateTaskStatus rechaza transición inválida', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertTaskInProject').mockResolvedValue({
      task: { id: '1', status: 'PENDING', assigneeId: null },
      project: { userId: '3' }
    });
    await expect(taskService.updateTaskStatus(1, 2, 3, 'gestor', 'DONE')).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  test('deleteTask elimina cuando existe', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertTaskAvailable').mockResolvedValue({ id: '9' });
    taskRepository.delete.mockResolvedValue(true);
    const ok = await taskService.deleteTask(9, 1);
    expect(ok).toBe(true);
  });

  test('deleteTask lanza NotFoundError', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertTaskAvailable').mockResolvedValue({ id: '9' });
    taskRepository.delete.mockResolvedValue(false);
    await expect(taskService.deleteTask(9, 1)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('createTask delega en repositorio', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertProjectAvailable').mockResolvedValue(undefined);
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
    jest.spyOn(resourceAvailabilityService, 'assertTaskAvailable').mockResolvedValue({
      id: '1',
      status: 'PENDING'
    });
    await expect(
      taskService.updateTask(1, 2, { status: 'DONE' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test('assignAssignee actualiza responsable', async () => {
    jest.spyOn(resourceAvailabilityService, 'assertTaskAvailable').mockResolvedValue({ id: '1' });
    taskRepository.update.mockResolvedValue({ id: '1', assigneeId: 'u-9' });
    const task = await taskService.assignAssignee(1, 2, 'u-9');
    expect(task.assigneeId).toBe('u-9');
  });
});
