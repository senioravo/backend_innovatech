// @ts-nocheck
import kpiUpstreamClient from '../../infrastructure/clients/kpiUpstreamClient.js';
import { buildUsuarioSesion } from '../transformers/frontendResponseTransformers.js';
function toProyectoResumen(p) {
    return {
        id: p.id,
        nombre: p.name,
        descripcion: p.description ?? '',
        fechaInicio: p.startDate ?? null,
        fechaFin: p.endDate ?? null
    };
}
function toTareaReciente(t) {
    return {
        id: t.id,
        titulo: t.title,
        estado: t.status ?? 'PENDING',
        completada: Boolean(t.completed),
        proyectoId: t.projectId,
        proyectoNombre: t.projectName ?? null
    };
}
const kpiOrchestrationService = {
    async getDashboard(req) {
        const { data } = await kpiUpstreamClient.getDashboard(req);
        const summary = data?.summary ?? {};
        return {
            usuario: buildUsuarioSesion(req, null),
            resumen: {
                totalProyectos: summary.totalProjects ?? 0,
                totalTareas: summary.totalTasks ?? 0,
                porEstado: summary.countByStatus ?? {},
                tasaCompletadas: summary.completionRate ?? 0
            },
            proyectos: (data?.projects ?? []).map(toProyectoResumen),
            tareasRecientes: (data?.recentTasks ?? []).map(toTareaReciente)
        };
    }
};
export default kpiOrchestrationService;
