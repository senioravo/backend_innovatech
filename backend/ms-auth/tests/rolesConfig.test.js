const {
  ROLES,
  DEFAULT_ROLE,
  isValidRole,
  getAllRoles,
  getRoleInfo,
  getAllRolesInfo,
  hasPermission,
  getRoleDescription
} = require('../src/config/roles');

describe('roles config', () => {
  test('isValidRole reconoce roles del sistema', () => {
    expect(isValidRole(ROLES.GESTOR)).toBe(true);
    expect(isValidRole('admin')).toBe(false);
  });

  test('getAllRoles devuelve los tres roles', () => {
    expect(getAllRoles()).toHaveLength(3);
  });

  test('getRoleInfo devuelve null para rol inválido', () => {
    expect(getRoleInfo('invalido')).toBeNull();
  });

  test('getRoleInfo incluye permisos', () => {
    const info = getRoleInfo(ROLES.GESTOR);
    expect(info.permisos.proyectos).toContain('crear');
  });

  test('getAllRolesInfo lista todos con descripción', () => {
    const all = getAllRolesInfo();
    expect(all.every((r) => r.descripcion)).toBe(true);
  });

  test('hasPermission valida acciones por módulo', () => {
    expect(hasPermission(ROLES.DIRECTIVO, 'reportes', 'kpis')).toBe(true);
    expect(hasPermission(ROLES.PROFESIONAL, 'proyectos', 'crear')).toBe(false);
    expect(hasPermission('x', 'proyectos', 'ver')).toBe(false);
  });

  test('getRoleDescription maneja rol desconocido', () => {
    expect(getRoleDescription('x')).toBe('Rol desconocido');
  });

  test('DEFAULT_ROLE es profesional', () => {
    expect(DEFAULT_ROLE).toBe(ROLES.PROFESIONAL);
  });
});
