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

function getAllRoles() {
  return Object.values(ROLES);
}

function isValidRole(rol: string) {
  return getAllRoles().includes(rol);
}

function getAllRolesInfo() {
  return ROLES_INFO;
}

function getRoleDescription(rol: string) {
  return ROLES_INFO[rol]?.description || null;
}

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
