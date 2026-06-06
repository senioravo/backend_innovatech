// @ts-nocheck
export {};
// Configuración de roles del sistema
// Definición centralizada de roles disponibles

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
 * Obtener todos los roles válidos
 * @returns {string[]} - Array de roles
 */
function getAllRoles() {
  return Object.values(ROLES);
}

/**
 * Validar si un rol es válido
 * @param {string} rol - Rol a validar
 * @returns {boolean} - true si es válido
 */
function isValidRole(rol) {
  return getAllRoles().includes(rol);
}

/**
 * Obtener información completa de todos los roles
 * @returns {Object} - Objeto con información de roles
 */
function getAllRolesInfo() {
  return ROLES_INFO;
}

/**
 * Obtener descripción de un rol específico
 * @param {string} rol - Rol a consultar
 * @returns {string|null} - Descripción del rol o null
 */
function getRoleDescription(rol) {
  return ROLES_INFO[rol]?.description || null;
}

/**
 * Obtener rol por defecto
 * @returns {string} - Rol por defecto
 */
function getDefaultRole() {
  return DEFAULT_ROLE;
}

module.exports = {
  ROLES,
  DEFAULT_ROLE,
  ROLES_INFO,
  getAllRoles,
  isValidRole,
  getAllRolesInfo,
  getRoleDescription,
  getDefaultRole
};
