jest.mock('../src/repositories/projectRepository.js', () => ({
  findByIdAndUserId: jest.fn()
}));

jest.mock('../src/repositories/taskRepository.js', () => ({
  findByIdAndUserId: jest.fn(),
  findByProjectIdAndTaskId: jest.fn()
}));

import projectRepository from '../src/repositories/projectRepository.js';
import taskRepository from '../src/repositories/taskRepository.js';
import resourceAvailabilityService from '../src/services/resourceAvailabilityService.js';
import { NotFoundError } from '../src/utils/errorHandler.js';

describe('resourceAvailabilityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('assertProjectAvailable devuelve proyecto existente', async () => {
    projectRepository.findByIdAndUserId.mockResolvedValue({ id: '1', name: 'P' });
    const project = await resourceAvailabilityService.assertProjectAvailable(1, 2);
    expect(project.name).toBe('P');
  });

  test('assertProjectAvailable lanza NotFoundError', async () => {
    projectRepository.findByIdAndUserId.mockResolvedValue(null);
    await expect(resourceAvailabilityService.assertProjectAvailable(1, 2)).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  test('assertTaskInProject lanza si no existe', async () => {
    taskRepository.findByProjectIdAndTaskId.mockResolvedValue(null);
    await expect(resourceAvailabilityService.assertTaskInProject(1, 2, 3)).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
