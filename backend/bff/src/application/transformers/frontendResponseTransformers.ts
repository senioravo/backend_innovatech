// @ts-nocheck
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

function normalizeRoleKey(role) {
  if (role == null || role === '') return null;
  return String(role).trim().toLowerCase();
}

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
