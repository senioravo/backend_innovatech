/**
 * DTOs para consultas, KPIs y exportación de reportes (ms-project-manager).
 */

import { TASK_STATUSES } from '../constants/taskStatuses.js';

export type ExportFormat = 'csv' | 'json';

export interface ConsultationTaskDto {
  id: string | number;
  title: string;
  status: string;
  projectName?: string | null;
}

export interface TaskDashboardDto {
  userId: string | number;
  total: number;
  countByStatus: Record<string, number>;
  tasks: ConsultationTaskDto[];
}

export interface ResourceUtilizationDto {
  assignedHours: number;
  availableHours: number;
  utilizationPct: number;
}

export interface ProductivityDto {
  completionRatePct: number;
  activeProjects: number;
}

export interface KpisDto {
  userId: string | number;
  projectProgressPct: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  resourceUtilization: ResourceUtilizationDto;
  productivity: ProductivityDto;
  countByStatus: Record<string, number>;
  generatedAt: string;
}

export interface ExportReportDto {
  contentType: string;
  body: string;
}

/** Normaliza el formato de exportación solicitado. */
export function normalizeExportFormat(raw: unknown): ExportFormat {
  const format = String(raw ?? 'csv').toLowerCase();
  return format === 'json' ? 'json' : 'csv';
}

/** DTO del dashboard de tareas para consultas. */
export function taskDashboardToDto(params: {
  userId: string | number;
  tasks: ConsultationTaskDto[];
}): TaskDashboardDto {
  const list = Array.isArray(params.tasks) ? params.tasks : [];
  return {
    userId: params.userId,
    total: list.length,
    countByStatus: countByStatusFromTasks(list),
    tasks: list
  };
}

export function countByStatusFromTasks(tasks: ConsultationTaskDto[]): Record<string, number> {
  const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<string, number>;
  for (const t of tasks) {
    const s = t.status ?? 'PENDING';
    if (Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1;
  }
  return counts;
}

/** DTO de KPIs agregados para el dashboard analítico. */
export function kpisToDto(kpis: KpisDto): KpisDto {
  return {
    userId: kpis.userId,
    projectProgressPct: kpis.projectProgressPct,
    totalTasks: kpis.totalTasks,
    completedTasks: kpis.completedTasks,
    inProgressTasks: kpis.inProgressTasks,
    pendingTasks: kpis.pendingTasks,
    resourceUtilization: kpis.resourceUtilization,
    productivity: kpis.productivity,
    countByStatus: kpis.countByStatus,
    generatedAt: kpis.generatedAt
  };
}

/** Metadatos de respuesta para exportación de reportes. */
export function exportReportToDto(format: ExportFormat, body: string): ExportReportDto {
  if (format === 'json') {
    return { contentType: 'application/json', body };
  }
  return { contentType: 'text/csv', body };
}
