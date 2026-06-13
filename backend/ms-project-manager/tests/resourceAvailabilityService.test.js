jest.mock('../src/repositories/projectRepository', () => ({
  findByIdAndUserId: jest.fn()
}));

jest.mock('../src/repositories/taskRepository', () => ({
  findByIdAndUserId: jest.fn(),
  findByProjectIdAndTaskId: jest.fn()
}));

const projectRepository = require('../src/repositories/projectRepository');
const taskRepository = require('../src/repositories/taskRepository');
const resourceAvailabilityService = require('../src/services/resourceAvailabilityService');
const { NotFoundError } = require('../src/utils/errorHandler');

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
