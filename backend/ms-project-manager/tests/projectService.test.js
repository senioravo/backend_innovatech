jest.mock('../src/repositories/projectRepository', () => ({
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../src/repositories/taskRepository', () => ({
  deleteByProjectId: jest.fn()
}));

jest.mock('../src/services/resourceAvailabilityService', () => ({
  assertProjectAvailable: jest.fn()
}));

const projectRepository = require('../src/repositories/projectRepository');
const taskRepository = require('../src/repositories/taskRepository');
const resourceAvailabilityService = require('../src/services/resourceAvailabilityService');
const projectService = require('../src/services/projectService');
const { NotFoundError } = require('../src/utils/errorHandler');

describe('projectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listProjects delega en el repositorio', async () => {
    projectRepository.findByUserId.mockResolvedValue([{ id: 1, name: 'Demo' }]);
    const rows = await projectService.listProjects(10);
    expect(rows).toHaveLength(1);
    expect(projectRepository.findByUserId).toHaveBeenCalledWith(10);
  });

  test('listProjects exige userId', async () => {
    await expect(projectService.listProjects()).rejects.toThrow('userId is required');
  });

  test('createProject crea con datos normalizados', async () => {
    projectRepository.create.mockResolvedValue({ id: 2, name: 'Nuevo' });
    const created = await projectService.createProject({
      name: '  Nuevo  ',
      description: '  Desc  ',
      userId: 1
    });
    expect(created.id).toBe(2);
    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nuevo', description: 'Desc', userId: 1 })
    );
  });

  test('updateProject lanza NotFoundError si no existe', async () => {
    resourceAvailabilityService.assertProjectAvailable.mockResolvedValue(undefined);
    projectRepository.update.mockResolvedValue(null);
    await expect(
      projectService.updateProject(9, 1, { name: 'X' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test('deleteProject elimina tareas y proyecto', async () => {
    resourceAvailabilityService.assertProjectAvailable.mockResolvedValue(undefined);
    taskRepository.deleteByProjectId.mockResolvedValue(undefined);
    projectRepository.delete.mockResolvedValue(true);
    const ok = await projectService.deleteProject(5, 1);
    expect(ok).toBe(true);
    expect(taskRepository.deleteByProjectId).toHaveBeenCalledWith(5);
    expect(projectRepository.delete).toHaveBeenCalledWith(5, 1);
  });
});
