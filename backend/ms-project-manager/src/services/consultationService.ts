// @ts-nocheck
import taskRepository from '../repositories/taskRepository.js';
import projectRepository from '../repositories/projectRepository.js';
import { TASK_STATUSES } from '../constants/taskStatuses.js';
import { taskToDto } from '../dtos/taskDto.js';

function countByStatus(tasks) {
  const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
  for (const t of tasks) {
    const s = t.status ?? 'PENDING';
    if (Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1;
  }
  return counts;
}

const consultationService = {
  async getTaskDashboardForUser(userId) {
    if (!userId) throw new Error('userId is required');
    const rows = await taskRepository.findForUserDashboard(userId);
    const tasks = rows.map(({ task, projectName }) => ({
      ...taskToDto(task),
      projectName
    }));
    return {
      userId,
      total: tasks.length,
      countByStatus: countByStatus(tasks),
      tasks
    };
  },

  async getKpisForUser(userId) {
    const dashboard = await this.getTaskDashboardForUser(userId);
    const counts = dashboard.countByStatus;
    const done = counts.DONE || 0;
    const total = dashboard.total || 0;
    const inProgress = counts.IN_PROGRESS || 0;
    const pending = counts.PENDING || 0;
    const avancePct = total > 0 ? Math.round((done / total) * 100) : 0;

    const projects = await projectRepository.findByUserId(userId);
    const horasAsignadas = total * 8;
    const horasDisponibles = Math.max(projects.length * 40, 40);

    return {
      userId,
      avanceProyectosPct: avancePct,
      tareasTotales: total,
      tareasCompletadas: done,
      tareasEnProgreso: inProgress,
      tareasPendientes: pending,
      utilizacionRecursos: {
        horasAsignadas,
        horasDisponibles,
        utilizacionPct: Math.min(100, Math.round((horasAsignadas / horasDisponibles) * 100))
      },
      productividad: {
        tasaCompletitudPct: avancePct,
        proyectosActivos: projects.length
      },
      countByStatus: counts,
      generadoEn: new Date().toISOString()
    };
  },

  async exportReport(userId, format = 'csv') {
    const kpis = await this.getKpisForUser(userId);
    const dashboard = await this.getTaskDashboardForUser(userId);

    if (format === 'json') {
      return { contentType: 'application/json', body: JSON.stringify({ kpis, dashboard }, null, 2) };
    }

    const lines = [
      'Indicador,Valor',
      `Avance proyectos (%),${kpis.avanceProyectosPct}`,
      `Tareas totales,${kpis.tareasTotales}`,
      `Tareas completadas,${kpis.tareasCompletadas}`,
      `Utilización recursos (%),${kpis.utilizacionRecursos.utilizacionPct}`,
      `Proyectos activos,${kpis.productividad.proyectosActivos}`,
      '',
      'Estado,Cantidad',
      ...Object.entries(kpis.countByStatus).map(([k, v]) => `${k},${v}`)
    ];
    return { contentType: 'text/csv', body: lines.join('\n') };
  }
};

export default consultationService;
