import { getAllRoles, getDefaultRole, getRoleDescription, isValidRole } from '../src/config/roles.js';

describe('roles config (ms-users)', () => {
  test('getAllRoles incluye gestor, profesional y directivo', () => {
    expect(getAllRoles()).toEqual(expect.arrayContaining(['gestor', 'profesional', 'directivo']));
  });

  test('isValidRole valida roles permitidos', () => {
    expect(isValidRole('gestor')).toBe(true);
    expect(isValidRole('admin')).toBe(false);
  });

  test('getDefaultRole es profesional', () => {
    expect(getDefaultRole()).toBe('profesional');
  });

  test('getRoleDescription devuelve texto para gestor', () => {
    expect(getRoleDescription('gestor')).toContain('proyectos');
  });
});
