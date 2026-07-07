/**
 * Constantes y utilidades de roles de usuario del sistema Innovatech.
 */
const ROLES = {
  GESTOR: 'gestor',
  PROFESIONAL: 'profesional',
  DIRECTIVO: 'directivo'
};

const DEFAULT_ROLE = ROLES.PROFESIONAL;

const ROLES_INFO = {
  [ROLES.GESTOR]: {
    name: 'Gestor',
    description: 'Gestiona proyectos, asigna tareas y supervisa equipos',
    permissions: ['crear_proyectos', 'asignar_tareas', 'ver_reportes']
  },
  [ROLES.PROFESIONAL]: {
    name: 'Profesional',
    description: 'Ejecuta tareas asignadas y colabora en proyectos',
    permissions: ['ver_tareas', 'actualizar_tareas', 'ver_proyectos']
  },
  [ROLES.DIRECTIVO]: {
    name: 'Directivo',
    description: 'Visualiza KPIs y métricas del negocio',
    permissions: ['ver_kpis', 'ver_reportes', 'ver_dashboard']
  }
};

/**
 * Devuelve todos los valores de rol válidos.
 * @returns {string[]}
 */
function getAllRoles() {
  return Object.values(ROLES);
}

/**
 * Indica si un rol pertenece al catálogo del sistema.
 * @param {string} rol - Identificador de rol (gestor, profesional, directivo)
 * @returns {boolean}
 */
function isValidRole(rol: string) {
  return getAllRoles().includes(rol);
}

/**
 * Devuelve metadatos de nombre, descripción y permisos por rol.
 * @returns {typeof ROLES_INFO}
 */
function getAllRolesInfo() {
  return ROLES_INFO;
}

/**
 * Obtiene la descripción legible de un rol.
 * @param {string} rol - Identificador de rol
 * @returns {string|null} Descripción o null si el rol no existe
 */
function getRoleDescription(rol: string) {
  return ROLES_INFO[rol]?.description || null;
}

/**
 * Devuelve el rol asignado por defecto al crear usuarios.
 * @returns {string}
 */
function getDefaultRole() {
  return DEFAULT_ROLE;
}

export {
  ROLES,
  DEFAULT_ROLE,
  ROLES_INFO,
  getAllRoles,
  isValidRole,
  getAllRolesInfo,
  getRoleDescription,
  getDefaultRole
};
