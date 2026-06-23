// @ts-nocheck
import authOrchestrationService from '../auth/authOrchestrationService.js';
import projectManagerUpstreamClient from '../../infrastructure/clients/projectManagerUpstreamClient.js';
import { UpstreamError } from '../../utils/errorHandler.js';
import { buildSessionUser, toProject, toTask, buildTaskSummary, extractAuthUser, extractRolesCatalog } from '../transformers/frontendResponseTransformers.js';
async function loadUserMap(assigneeIds, req) {
    const map = new Map();
    const unique = [...new Set(assigneeIds.filter((id) => id != null && String(id).trim() !== ''))];
    await Promise.all(unique.map(async (id) => {
        try {
            const { data } = await authOrchestrationService.getUserById(String(id), req);
            const user = extractAuthUser(data);
            if (user)
                map.set(String(id), user);
        }
        catch (err) {
            if (!(err instanceof UpstreamError && err.status === 404)) {
                throw err;
            }
        }
    }));
    return map;
}
function collectAssigneeIdsFromProjects(projects) {
    return projects.map((p) => p.assigneeId).filter(Boolean);
}
function collectAssigneeIdsFromTasks(tasks) {
    return tasks.map((t) => t.assigneeId).filter(Boolean);
}
const proyectosOrchestrationService = {
    /**
     * BFF-TASK-08: listado de proyectos (PM) + contexto de sesión y permisos (Auth).
     */
    async listProyectos(req) {
        const [pmResult, rolesResult] = await Promise.all([
            projectManagerUpstreamClient.listProjects(req),
            authOrchestrationService.getRoles()
        ]);
        const projects = pmResult.data?.projects ?? [];
        const userMap = await loadUserMap(collectAssigneeIdsFromProjects(projects), req);
        const rolesCatalog = extractRolesCatalog(rolesResult.data?.data ?? rolesResult.data);
        return {
            user: buildSessionUser(req, rolesCatalog),
            projects: projects.map((p) => toProject(p, userMap))
        };
    },
    /**
     * BFF-TASK-09 / BFF-TASK-10: tareas de un proyecto adaptadas al front.
     */
    async listTareasByProyecto(proyectoId, req) {
        const { data } = await projectManagerUpstreamClient.listTasksByProject(proyectoId, req);
        const tasksRaw = data?.tasks ?? [];
        const userMap = await loadUserMap(collectAssigneeIdsFromTasks(tasksRaw), req);
        const tasks = tasksRaw.map((t) => toTask(t, userMap));
        return {
            projectId: String(proyectoId),
            tasks,
            summary: buildTaskSummary(tasks)
        };
    }
};
export default proyectosOrchestrationService;
