/**
 * Transformadores de respuesta del BFF hacia el contrato del frontend.
 * Normaliza roles, usuarios, proyectos, tareas y resúmenes agregados.
 */

/** Estados de tarea reconocidos por el frontend. */
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

/**
 * Normaliza una clave de rol a minúsculas y sin espacios laterales.
 * @param {string|null|undefined} role - Nombre del rol tal como viene del JWT o catálogo.
 * @returns {string|null} Clave normalizada o null si el valor es vacío.
 */
function normalizeRoleKey(role) {
  if (role == null || role === '') return null;
  return String(role).trim().toLowerCase();
}

/**
 * Resuelve el assignee a partir de un id y un mapa de usuarios precargado.
 * @param {string|number|null|undefined} userId - Identificador del assignee.
 * @param {Map<string, object>} userMap - Mapa id → usuario obtenido de ms-auth.
 * @returns {{ id: string; name?: string|null; email?: string|null; role?: string|null }|null}
 */
function toAssignee(userId, userMap) {
  if (userId == null || userId === '') return null;
  const key = String(userId);
  const user = userMap.get(key);
  if (!user) return { id: key };
  return {
    id: String(user.id),
    name: user.name ?? user.nombre ?? null,
    email: user.email ?? null,
    role: user.role ?? user.rol ?? null
  };
}

/**
 * Construye el objeto de usuario de sesión enriquecido con descripción y permisos del rol.
 * @param {import('express').Request} req - Request con `req.user` poblado por el middleware JWT.
 * @param {object[]|null|undefined} rolesCatalog - Catálogo de roles devuelto por ms-auth.
 * @returns {{ id: string|null; email: string|null; role: string|null; roleDescription: string|null; permissions: unknown }}
 */
function buildSessionUser(req, rolesCatalog) {
  const roleKey = normalizeRoleKey(req.user?.role);
  const roles = Array.isArray(rolesCatalog) ? rolesCatalog : [];
  const match = roles.find((r) => normalizeRoleKey(r.name ?? r.nombre) === roleKey);

  return {
    id: req.user?.id != null ? String(req.user.id) : null,
    email: req.user?.email ?? null,
    role: roleKey,
    roleDescription: match?.description ?? match?.descripcion ?? null,
    permissions: match?.permissions ?? match?.permisos ?? null
  };
}

/**
 * Adapta un proyecto upstream al contrato del frontend con assignee resuelto.
 * @param {object|null|undefined} project - Proyecto crudo de project-manager.
 * @param {Map<string, object>} userMap - Mapa id → usuario para resolver assignees.
 * @returns {object|null} Proyecto adaptado o null si no hay entrada.
 */
function toProject(project, userMap) {
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    assignee: toAssignee(project.assigneeId, userMap),
    startDate: project.startDate ?? null,
    endDate: project.endDate ?? null,
    createdAt: project.createdAt ?? null,
    updatedAt: project.updatedAt ?? null
  };
}

/**
 * Adapta una tarea upstream al contrato del frontend con assignee resuelto.
 * @param {object|null|undefined} task - Tarea cruda de project-manager.
 * @param {Map<string, object>} userMap - Mapa id → usuario para resolver assignees.
 * @returns {object|null} Tarea adaptada o null si no hay entrada.
 */
function toTask(task, userMap) {
  if (!task) return null;
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? '',
    status: task.status ?? 'PENDING',
    completed: Boolean(task.completed),
    assignee: toAssignee(task.assigneeId, userMap),
    startDate: task.startDate ?? null,
    endDate: task.endDate ?? null,
    createdAt: task.createdAt ?? null,
    updatedAt: task.updatedAt ?? null
  };
}

/**
 * Calcula el total de tareas y el conteo por cada estado reconocido.
 * @param {object[]} tasks - Lista de tareas ya adaptadas al frontend.
 * @returns {{ total: number; byStatus: Record<string, number> }}
 */
function buildTaskSummary(tasks) {
  const byStatus = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
  for (const task of tasks) {
    const status = task.status ?? 'PENDING';
    if (Object.prototype.hasOwnProperty.call(byStatus, status)) {
      byStatus[status] += 1;
    }
  }
  return {
    total: tasks.length,
    byStatus
  };
}

/**
 * Extrae y normaliza un usuario desde la respuesta envuelta de ms-auth.
 * @param {object|null|undefined} payload - Cuerpo JSON devuelto por ms-auth (`{ data: ... }`).
 * @returns {object|null} Usuario con campos `name` y `role` unificados, o null.
 */
function extractAuthUser(payload) {
  if (!payload?.data) return null;
  const user = payload.data.user ?? payload.data;
  if (!user) return null;
  return {
    ...user,
    name: user.name ?? user.nombre,
    role: user.role ?? user.rol
  };
}

/**
 * Extrae el catálogo de roles desde la respuesta envuelta de ms-auth.
 * @param {object|null|undefined} payload - Cuerpo JSON devuelto por ms-auth (`{ data: [...] }`).
 * @returns {object[]} Array de roles o arreglo vacío si no hay datos.
 */
function extractRolesCatalog(payload) {
  if (!payload?.data) return [];
  return Array.isArray(payload.data) ? payload.data : [];
}

export {
  normalizeRoleKey,
  buildSessionUser,
  toProject,
  toTask,
  buildTaskSummary,
  extractAuthUser,
  extractRolesCatalog,
  buildSessionUser as buildUsuarioSesion,
  toProject as toProyecto,
  toTask as toTarea,
  buildTaskSummary as buildResumenTareas
};
