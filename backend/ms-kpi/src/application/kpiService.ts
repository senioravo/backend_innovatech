// @ts-nocheck
export {};
const projectManagerClient = require('../infrastructure/clients/projectManagerClient');
const { countByStatus, completionRate } = require('../domain/taskStatuses');
const { UpstreamError } = require('../utils/errorHandler');

function mapUpstreamError(err) {
  if (err.status) {
    throw new UpstreamError(err.status, err.body ?? { error: err.message });
  }
  throw err;
}

const kpiService = {
  /**
   * Agrega datos de project-manager para el dashboard de progreso del usuario.
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

    return {
      userId: String(userId),
      summary: {
        totalProjects: projects.length,
        totalTasks,
        countByStatus: statusCounts,
        completionRate: completionRate(statusCounts, totalTasks)
      },
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        assigneeId: p.assigneeId ?? null,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null
      })),
      recentTasks: tasks.slice(0, 10).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status ?? 'PENDING',
        completed: Boolean(t.completed),
        projectId: t.projectId,
        projectName: t.projectName ?? null
      }))
    };
  }
};

module.exports = kpiService;
