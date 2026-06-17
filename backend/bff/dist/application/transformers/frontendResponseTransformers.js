// @ts-nocheck
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
function normalizeRoleKey(role) {
    if (role == null || role === '')
        return null;
    return String(role).trim().toLowerCase();
}
function toResponsable(userId, userMap) {
    if (userId == null || userId === '')
        return null;
    const key = String(userId);
    const u = userMap.get(key);
    if (!u)
        return { id: key };
    return {
        id: String(u.id),
        nombre: u.nombre ?? null,
        email: u.email ?? null,
        rol: u.rol ?? null
    };
}
function buildUsuarioSesion(req, rolesCatalog) {
    const roleKey = normalizeRoleKey(req.user?.role);
    const roles = Array.isArray(rolesCatalog) ? rolesCatalog : [];
    const match = roles.find((r) => normalizeRoleKey(r.nombre) === roleKey);
    return {
        id: req.user?.id != null ? String(req.user.id) : null,
        email: req.user?.email ?? null,
        rol: roleKey,
        descripcionRol: match?.descripcion ?? null,
        permisos: match?.permisos ?? null
    };
}
/**
 * BFF-TASK-10: proyecto simplificado para el front.
 */
function toProyecto(project, userMap) {
    if (!project)
        return null;
    return {
        id: project.id,
        nombre: project.name,
        descripcion: project.description,
        responsable: toResponsable(project.assigneeId, userMap),
        fechaInicio: project.startDate ?? null,
        fechaFin: project.endDate ?? null,
        creadoEn: project.createdAt ?? null,
        actualizadoEn: project.updatedAt ?? null
    };
}
/**
 * BFF-TASK-10: tarea simplificada para el front.
 */
function toTarea(task, userMap) {
    if (!task)
        return null;
    return {
        id: task.id,
        proyectoId: task.projectId,
        titulo: task.title,
        descripcion: task.description ?? '',
        estado: task.status ?? 'PENDING',
        completada: Boolean(task.completed),
        responsable: toResponsable(task.assigneeId, userMap),
        fechaInicio: task.startDate ?? null,
        fechaFin: task.endDate ?? null,
        creadoEn: task.createdAt ?? null,
        actualizadoEn: task.updatedAt ?? null
    };
}
function buildResumenTareas(tareas) {
    const porEstado = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
    for (const t of tareas) {
        const s = t.estado ?? 'PENDING';
        if (Object.prototype.hasOwnProperty.call(porEstado, s)) {
            porEstado[s] += 1;
        }
    }
    return {
        total: tareas.length,
        porEstado
    };
}
function extractAuthUser(payload) {
    if (!payload?.data)
        return null;
    return payload.data;
}
function extractRolesCatalog(payload) {
    if (!payload?.data)
        return [];
    return Array.isArray(payload.data) ? payload.data : [];
}
export { normalizeRoleKey, buildUsuarioSesion, toProyecto, toTarea, buildResumenTareas, extractAuthUser, extractRolesCatalog };
