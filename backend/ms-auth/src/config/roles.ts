// AS-TASK-08: Configuración de roles del sistema
// Responsabilidad: Definir y exportar roles y permisos
// Principio SOLID: Single Responsibility - Solo gestiona roles

/**
 * Roles disponibles en el sistema Innovatech
 * Cada rol tiene permisos específicos para diferentes módulos
 */
const ROLES = {
  GESTOR: 'gestor',
  PROFESIONAL: 'profesional',
  DIRECTIVO: 'directivo'
};

/**
 * Rol por defecto para nuevos usuarios
 */
const DEFAULT_ROLE = ROLES.PROFESIONAL;

/**
 * Descripción de roles para documentación
 */
const ROLE_DESCRIPTIONS = {
  [ROLES.GESTOR]: 'Gestor de proyectos - Puede crear y editar proyectos',
  [ROLES.PROFESIONAL]: 'Profesional técnico - Puede ver y actualizar tareas asignadas',
  [ROLES.DIRECTIVO]: 'Directivo - Puede consultar KPIs y reportes'
};

/**
 * Permisos por rol
 * Define qué acciones puede realizar cada rol
 */
const ROLE_PERMISSIONS = {
  [ROLES.GESTOR]: {
    proyectos: ['crear', 'editar', 'eliminar', 'ver'],
    tareas: ['ver', 'asignar', 'actualizar'],
    reportes: ['ver'],
    usuarios: ['ver']
  },
  [ROLES.PROFESIONAL]: {
    proyectos: ['ver'],
    tareas: ['ver', 'actualizar'], // Solo tareas asignadas
    reportes: [],
    usuarios: []
  },
  [ROLES.DIRECTIVO]: {
    proyectos: ['ver'],
    tareas: ['ver'],
    reportes: ['ver', 'kpis', 'analytics'],
    usuarios: ['ver']
  }
};

/**
 * Validar si un rol existe en el sistema
 * @param {string} rol - Rol a validar
 * @returns {boolean} - true si el rol es válido
 */
const isValidRole = (rol) => {
  return Object.values(ROLES).includes(rol);
};

/**
 * Obtener todos los roles disponibles
 * @returns {Array} - Array de roles
 */
const getAllRoles = () => {
  return Object.values(ROLES);
};

/**
 * Obtener información detallada de un rol
 * @param {string} rol - Rol a consultar
 * @returns {Object|null} - Información del rol o null
 */
const getRoleInfo = (rol) => {
  if (!isValidRole(rol)) {
    return null;
  }

  return {
    nombre: rol,
    descripcion: ROLE_DESCRIPTIONS[rol],
    permisos: ROLE_PERMISSIONS[rol]
  };
};

/**
 * Obtener todos los roles con su información
 * @returns {Array} - Array de objetos con información de roles
 */
const getAllRolesInfo = () => {
  return getAllRoles().map((roleKey) => ({
    name: roleKey,
    description: ROLE_DESCRIPTIONS[roleKey],
    permissions: ROLE_PERMISSIONS[roleKey],
    // Legacy keys for backward compatibility
    nombre: roleKey,
    descripcion: ROLE_DESCRIPTIONS[roleKey],
    permisos: ROLE_PERMISSIONS[roleKey]
  }));
};

/**
 * Verificar si un rol tiene un permiso específico
 * @param {string} rol - Rol a verificar
 * @param {string} modulo - Módulo (proyectos, tareas, reportes, usuarios)
 * @param {string} accion - Acción (crear, editar, ver, etc.)
 * @returns {boolean} - true si tiene el permiso
 */
const hasPermission = (rol, modulo, accion) => {
  if (!isValidRole(rol)) {
    return false;
  }

  const permisos = ROLE_PERMISSIONS[rol];
  
  if (!permisos || !permisos[modulo]) {
    return false;
  }

  return permisos[modulo].includes(accion);
};

/**
 * Obtener descripción de un rol
 * @param {string} rol - Rol a consultar
 * @returns {string} - Descripción del rol
 */
const getRoleDescription = (rol) => {
  return ROLE_DESCRIPTIONS[rol] || 'Rol desconocido';
};

export { ROLES, DEFAULT_ROLE, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, isValidRole, getAllRoles, getRoleInfo, getAllRolesInfo, hasPermission, getRoleDescription };