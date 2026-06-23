import { createRegisterDto,
  createLoginDto,
  userToDto,
  usersToDto,
  authResponseDto,
  registerResponseDto,
  errorResponseDto } from '../src/dtos/userDto.js';

describe('userDto', () => {
  test('createRegisterDto normaliza email y nombre', () => {
    const dto = createRegisterDto({
      nombre: '  Ana  ',
      email: '  Ana@Innovatech.CL ',
      password: 'secret',
      rol: ' gestor '
    });
    expect(dto.name).toBe('Ana');
    expect(dto.email).toBe('ana@innovatech.cl');
    expect(dto.role).toBe('gestor');
  });

  test('createLoginDto normaliza email', () => {
    const dto = createLoginDto({ email: '  Test@Mail.CL ', password: 'x' });
    expect(dto.email).toBe('test@mail.cl');
  });

  test('userToDto omite password', () => {
    const dto = userToDto({
      id: 1,
      name: 'Ana',
      email: 'a@b.cl',
      password: 'hash',
      role: 'gestor',
      created_at: '2026-01-01'
    });
    expect(dto).not.toHaveProperty('password');
    expect(dto.createdAt).toBe('2026-01-01');
  });

  test('usersToDto devuelve array vacío si entrada inválida', () => {
    expect(usersToDto(null)).toEqual([]);
  });

  test('authResponseDto incluye token y usuario', () => {
    const res = authResponseDto({ id: 1, email: 'a@b.cl', role: 'gestor' }, 'jwt-token');
    expect(res.success).toBe(true);
    expect(res.data.token).toBe('jwt-token');
  });

  test('registerResponseDto formatea registro', () => {
    const res = registerResponseDto({ id: 2, email: 'b@c.cl', role: 'gestor' });
    expect(res.data.user.id).toBe(2);
  });

  test('errorResponseDto incluye detalles opcionales', () => {
    const res = errorResponseDto('fallo', { field: 'email' });
    expect(res.data).toEqual({ field: 'email' });
  });
});
