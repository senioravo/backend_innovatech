const projectManagerClient = require('../infrastructure/clients/projectManagerClient');
const { countByStatus, completionRate } = require('../domain/taskStatuses');
const { UpstreamError } = require('../utils/errorHandler');
const { dashboardToDto } = require('../dtos/kpiDto');

/**
 * Convierte errores HTTP del upstream (project-manager) en UpstreamError tipado.
 * @param {Error & { status?: number; body?: unknown }} err - Error de fetch interno
 * @throws {UpstreamError}
 */
function mapUpstreamError(err) {
  if (err.status) {
    throw new UpstreamError(err.status, err.body ?? { error: err.message });
  }
  throw err;
}

/**
 * Servicio de dominio KPI: agrega datos de project-manager para el dashboard.
 */
const kpiService = {
  /**
   * Obtiene el dashboard de KPIs del usuario autenticado.
   * @param {string|number} userId - ID del usuario (desde JWT)
   * @param {import('express').Request} req - Request con headers de auth para reenviar al PM
   * @returns {Promise<import('../dtos/kpiDto').KpiDashboardDto>} Dashboard con summary, projects y recentTasks
   * @throws {Error} Si userId es inválido
   * @throws {UpstreamError} Si project-manager responde con error HTTP
   */
  async getDashboard(userId, req) {
    if (!userId) throw new Error('userId is required');

    let dashboard;
    let projectsPayload;

    try {
      [dashboard, projectsPayload] = await Promise.all([
        projectManagerClient.getTaskDashboard(req),
        projectManagerClient.listProjects(req)
      ]);
    } catch (err) {
      mapUpstreamError(err);
    }

    const tasks = dashboard?.tasks ?? [];
    const statusCounts = dashboard?.countByStatus ?? countByStatus(tasks);
    const totalTasks = dashboard?.total ?? tasks.length;
    const projects = projectsPayload?.projects ?? [];

    return dashboardToDto({
      userId,
      summary: {
        totalProjects: projects.length,
        totalTasks,
        countByStatus: statusCounts,
        completionRate: completionRate(statusCounts, totalTasks)
      },
      projects,
      tasks
    });
  }
};

module.exports = kpiService;
