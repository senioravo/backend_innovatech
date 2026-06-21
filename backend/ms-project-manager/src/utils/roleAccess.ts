// @ts-nocheck

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

/** Directivo y profesional pueden ver todos los proyectos (solo lectura en proyectos). */
function canViewAllProjects(role) {
  const r = normalizeRole(role);
  return r === 'directivo' || r === 'profesional';
}

/** Directivo ve KPIs globales de toda la plataforma. */
function canViewGlobalKpis(role) {
  return normalizeRole(role) === 'directivo';
}

export { normalizeRole, canViewAllProjects, canViewGlobalKpis };
