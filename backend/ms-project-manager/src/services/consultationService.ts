import taskRepository from '../repositories/taskRepository.js';
import projectRepository from '../repositories/projectRepository.js';
import { taskToDto } from '../dtos/taskDto.js';
import {
  taskDashboardToDto,
  kpisToDto,
  exportReportToDto,
  normalizeExportFormat,
  type KpisDto
} from '../dtos/consultationDto.js';
import { canViewGlobalKpis } from '../utils/roleAccess.js';

const consultationService = {
  async getTaskDashboardForUser(userId, role) {
    if (!userId) throw new Error('userId is required');
    const rows = canViewGlobalKpis(role)
      ? await taskRepository.findAllForDashboard()
      : await taskRepository.findForUserDashboard(userId);
    const tasks = rows.map(({ task, projectName }) => ({
      ...taskToDto(task),
      projectName
    }));
    return taskDashboardToDto({ userId, tasks });
  },

  async getKpisForUser(userId, role) {
    const dashboard = await this.getTaskDashboardForUser(userId, role);
    const counts = dashboard.countByStatus;
    const done = counts.DONE || 0;
    const total = dashboard.total || 0;
    const inProgress = counts.IN_PROGRESS || 0;
    const pending = counts.PENDING || 0;
    const avancePct = total > 0 ? Math.round((done / total) * 100) : 0;

    const projects = canViewGlobalKpis(role)
      ? await projectRepository.findAll()
      : await projectRepository.findByUserId(userId);
    const horasAsignadas = total * 8;
    const horasDisponibles = Math.max(projects.length * 40, 40);

    const payload: KpisDto = {
      userId,
      projectProgressPct: avancePct,
      totalTasks: total,
      completedTasks: done,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      resourceUtilization: {
        assignedHours: horasAsignadas,
        availableHours: horasDisponibles,
        utilizationPct: Math.min(100, Math.round((horasAsignadas / horasDisponibles) * 100))
      },
      productivity: {
        completionRatePct: avancePct,
        activeProjects: projects.length
      },
      countByStatus: counts,
      generatedAt: new Date().toISOString()
    };

    return kpisToDto(payload);
  },

  async exportReport(userId, format = 'csv', role) {
    const exportFormat = normalizeExportFormat(format);
    const kpis = await this.getKpisForUser(userId, role);
    const dashboard = await this.getTaskDashboardForUser(userId, role);

    if (exportFormat === 'json') {
      return exportReportToDto('json', JSON.stringify({ kpis, dashboard }, null, 2));
    }

    const lines = [
      'Indicador,Valor',
      `Project progress (%),${kpis.projectProgressPct}`,
      `Total tasks,${kpis.totalTasks}`,
      `Completed tasks,${kpis.completedTasks}`,
      `Resource utilization (%),${kpis.resourceUtilization.utilizationPct}`,
      `Active projects,${kpis.productivity.activeProjects}`,
      '',
      'Estado,Cantidad',
      ...Object.entries(kpis.countByStatus).map(([k, v]) => `${k},${v}`)
    ];
    return exportReportToDto('csv', lines.join('\n'));
  }
};

export default consultationService;
