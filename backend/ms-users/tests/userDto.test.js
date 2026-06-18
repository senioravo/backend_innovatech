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
  test('userToDto mapea campos de perfil profesional', () => {
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
      nombre: 'Ana',
      habilidades: 'Node, React',
      horasSemanalesDisponibles: 20
    });
  });

  test('usersToDto devuelve arreglo vacío si no es array', () => {
    expect(usersToDto(null)).toEqual([]);
  });

  test('createUserDto normaliza email', () => {
    expect(createUserDto({ email: '  GESTOR@TEST.CL  ', nombre: 'X', password: '123456' })).toEqual({
      nombre: 'X',
      email: 'gestor@test.cl',
      password: '123456',
      rol: null
    });
  });

  test('updateUserDto solo incluye campos enviados', () => {
    expect(updateUserDto({ nombre: ' Nuevo ' })).toEqual({ nombre: 'Nuevo' });
  });

  test('successResponseDto y errorResponseDto', () => {
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

  test('validateUserData rechaza datos inválidos', () => {
    const result = validateUserData(
      { nombre: 'A', email: 'bad', password: '123', rol: 'admin' },
      { requirePassword: true }
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validateUserData acepta datos válidos', () => {
    const result = validateUserData(
      {
        nombre: 'Ana Gestora',
        email: 'ana@test.cl',
        password: 'Secret123',
        rol: 'gestor'
      },
      { requirePassword: true }
    );
    expect(result).toEqual({ valid: true, errors: [] });
  });
});
