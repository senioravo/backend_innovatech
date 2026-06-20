"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kpiUpstreamClient = require('../../infrastructure/clients/kpiUpstreamClient');
const { buildUsuarioSesion } = require('../transformers/frontendResponseTransformers');
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
module.exports = kpiOrchestrationService;
