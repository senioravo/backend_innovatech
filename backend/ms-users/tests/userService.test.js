import { jest } from '@jest/globals';

const mockRepo = {
  emailExists: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateRole: jest.fn(),
  findProfessionals: jest.fn(),
  updateProfile: jest.fn()
};

let userService;
let NotFoundError;
let ValidationError;

beforeAll(async () => {
  await jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
    default: mockRepo
  }));
  await jest.unstable_mockModule('../src/utils/logger.js', () => ({
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
  }));

  userService = (await import('../src/services/user.service.js')).default;
  ({ NotFoundError, ValidationError } = await import('../src/utils/errorHandler.js'));
});

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDefaultRole devuelve profesional', () => {
    expect(userService.getDefaultRole()).toBe('profesional');
  });

  test('getUserById lanza ValidationError con id inválido', async () => {
    await expect(userService.getUserById(Number('abc'))).rejects.toBeInstanceOf(ValidationError);
  });

  test('getUserById lanza NotFoundError si no existe', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    await expect(userService.getUserById(404)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('getUserById devuelve usuario', async () => {
    mockRepo.findById.mockResolvedValueOnce({ id: 1, email: 'a@a.cl' });
    await expect(userService.getUserById(1)).resolves.toEqual({ id: 1, email: 'a@a.cl' });
  });

  test('createUser rechaza email duplicado', async () => {
    mockRepo.emailExists.mockResolvedValueOnce(true);

    await expect(
      userService.createUser({
        nombre: 'Ana',
        email: 'dup@test.cl',
        password: 'Secret123',
        rol: 'gestor'
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test('updateUser rechaza body vacío', async () => {
    await expect(userService.updateUser(1, {})).rejects.toBeInstanceOf(ValidationError);
  });

  test('listUsers delega en repository', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ users: [], pagination: { total: 0 } });
    const result = await userService.listUsers({ page: 1 });
    expect(result.users).toEqual([]);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  test('deleteUser lanza NotFoundError si no existe', async () => {
    mockRepo.delete.mockResolvedValueOnce(false);
    await expect(userService.deleteUser(9)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('changeUserRole valida rol permitido', async () => {
    await expect(userService.changeUserRole(1, 'invalido')).rejects.toBeInstanceOf(ValidationError);
  });

  test('updateProfile valida disponibilidad', async () => {
    await expect(
      userService.updateProfile(1, { disponibilidad: 'no-existe' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test('updateProfile actualiza campos válidos', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({
      id: 1,
      habilidades: 'React',
      disponibilidad: 'disponible'
    });
    const updated = await userService.updateProfile(1, {
      habilidades: 'React',
      disponibilidad: 'disponible',
      horasSemanalesDisponibles: 30
    });
    expect(updated.habilidades).toBe('React');
  });
});
