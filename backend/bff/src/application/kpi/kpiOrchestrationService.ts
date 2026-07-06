/**
 * Capa de aplicación: orquestación del dashboard KPI.
 * Obtiene datos agregados de ms-kpi y los transforma al contrato en español del frontend.
 */
import kpiUpstreamClient from '../../infrastructure/clients/kpiUpstreamClient.js';
import { buildUsuarioSesion } from '../transformers/frontendResponseTransformers.js';

/**
 * Convierte un proyecto upstream al formato resumido del dashboard KPI.
 * @param {object} p - Proyecto crudo devuelto por ms-kpi.
 * @returns {{ id: unknown; nombre: string; descripcion: string; fechaInicio: unknown; fechaFin: unknown }}
 */
function toProyectoResumen(p) {
  return {
    id: p.id,
    nombre: p.name,
    descripcion: p.description ?? '',
    fechaInicio: p.startDate ?? null,
    fechaFin: p.endDate ?? null
  };
}

/**
 * Convierte una tarea reciente upstream al formato del dashboard KPI.
 * @param {object} t - Tarea cruda devuelta por ms-kpi.
 * @returns {{ id: unknown; titulo: string; estado: string; completada: boolean; proyectoId: unknown; proyectoNombre: string|null }}
 */
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
  /**
   * Construye el payload completo del dashboard KPI para el frontend.
   * @param {import('express').Request} req - Request con usuario autenticado.
   * @returns {Promise<{ usuario: object; resumen: object; proyectos: object[]; tareasRecientes: object[] }>}
   */
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
