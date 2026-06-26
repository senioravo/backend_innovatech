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

/** Gestor dueño del proyecto puede modificar/eliminar tareas del proyecto. */
function isProjectOwner(userId, project) {
  return project && String(project.userId ?? project.owner_user_id) === String(userId);
}

/**
 * Profesional puede cambiar estado si la tarea le está asignada (o sin asignar).
 * Gestor si es dueño del proyecto. Directivo puede cambiar estado en proyectos visibles.
 */
function canModifyTaskStatus(userId, role, task, project) {
  const r = normalizeRole(role);
  if (r === 'directivo') return true;
  if (r === 'gestor') return isProjectOwner(userId, project);
  if (r === 'profesional') {
    const assignee = task?.assigneeId ?? task?.responsable_id;
    if (assignee == null || assignee === '') return true;
    return String(assignee) === String(userId);
  }
  return false;
}

export {
  normalizeRole,
  canViewAllProjects,
  canViewGlobalKpis,
  isProjectOwner,
  canModifyTaskStatus
};
