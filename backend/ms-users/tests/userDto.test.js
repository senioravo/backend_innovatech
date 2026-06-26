import UserModel from '../src/models/userModel.js';
import {
  createUserDto,
  errorResponseDto,
  successResponseDto,
  updateUserDto,
  userToDto,
  usersToDto,
  validateUserData
} from '../src/dtos/userDto.js';

describe('userDto', () => {
  test('userToDto accepts UserModel entities from repository', () => {
    const entity = new UserModel({
      id: 2,
      name: 'Carlos',
      email: 'carlos@test.cl',
      role: 'profesional',
      skills: 'Java',
      availability: 'parcial',
      weeklyAvailableHours: 25,
      createdAt: '2026-02-01',
      updatedAt: '2026-02-02'
    });

    expect(userToDto(entity)).toEqual(entity.toSafeObject());
  });

  test('userToDto maps professional profile fields', () => {
    const dto = userToDto({
      id: 1,
      nombre: 'Ana',
      email: 'ana@test.cl',
      rol: 'gestor',
      habilidades: 'Node, React',
      disponibilidad: 'ocupado',
      horas_semanales_disponibles: 20,
      created_at: '2026-01-01'
    });

    expect(dto).toMatchObject({
      id: 1,
      name: 'Ana',
      role: 'gestor',
      skills: 'Node, React',
      weeklyAvailableHours: 20
    });
  });

  test('usersToDto returns empty array for invalid input', () => {
    expect(usersToDto(null)).toEqual([]);
  });

  test('createUserDto normalizes email and accepts legacy fields', () => {
    expect(createUserDto({ email: '  GESTOR@TEST.CL  ', nombre: 'X', password: '123456' })).toEqual({
      name: 'X',
      email: 'gestor@test.cl',
      password: '123456',
      role: null
    });
  });

  test('updateUserDto only includes provided fields', () => {
    expect(updateUserDto({ nombre: ' Nuevo ' })).toEqual({ name: 'Nuevo' });
  });

  test('successResponseDto and errorResponseDto', () => {
    expect(successResponseDto('ok', { id: 1 })).toEqual({
      success: true,
      message: 'ok',
      data: { id: 1 }
    });
    expect(errorResponseDto('fail', ['x'])).toEqual({
      success: false,
      error: 'fail',
      details: ['x']
    });
  });

  test('validateUserData rejects invalid data', () => {
    const result = validateUserData(
      { nombre: 'A', email: 'bad', password: '123', rol: 'admin' },
      { requirePassword: true }
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validateUserData accepts valid data', () => {
    const result = validateUserData(
      {
        name: 'Ana Gestora',
        email: 'ana@test.cl',
        password: 'Secret123',
        role: 'gestor'
      },
      { requirePassword: true }
    );
    expect(result).toEqual({ valid: true, errors: [] });
  });
});
