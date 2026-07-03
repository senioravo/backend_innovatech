/**
 * DTOs para respuestas del microservicio KPI.
 * Centraliza el formato JSON expuesto al BFF / gateway.
 */

export interface KpiSummaryDto {
  totalProjects: number;
  totalTasks: number;
  countByStatus: Record<string, number>;
  completionRate: number;
}

export interface KpiProjectSummaryDto {
  id: string | number;
  name: string;
  description?: string;
  assigneeId: string | number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface KpiRecentTaskDto {
  id: string | number;
  title: string;
  status: string;
  completed: boolean;
  projectId: string | number;
  projectName: string | null;
}

export interface KpiDashboardDto {
  userId: string;
  summary: KpiSummaryDto;
  projects: Array<KpiProjectSummaryDto | null>;
  recentTasks: KpiRecentTaskDto[];
}

type UpstreamProject = Record<string, unknown>;
type UpstreamTask = Record<string, unknown>;

/** Mapea un proyecto upstream al DTO de KPI. */
export function projectSummaryToDto(
  project: UpstreamProject | null | undefined
): KpiProjectSummaryDto | null {
  if (!project) return null;
  return {
    id: project.id as string | number,
    name: String(project.name ?? ''),
    description: project.description as string | undefined,
    assigneeId: (project.assigneeId ?? null) as string | number | null,
    startDate: (project.startDate ?? null) as string | null,
    endDate: (project.endDate ?? null) as string | null
  };
}

/** Mapea una tarea upstream al DTO resumido del dashboard KPI. */
export function recentTaskToDto(task: UpstreamTask): KpiRecentTaskDto {
  return {
    id: task.id as string | number,
    title: String(task.title ?? ''),
    status: String(task.status ?? 'PENDING'),
    completed: Boolean(task.completed),
    projectId: task.projectId as string | number,
    projectName: (task.projectName ?? null) as string | null
  };
}

/** Construye la respuesta del dashboard KPI a partir de datos agregados. */
export function dashboardToDto(params: {
  userId: string | number;
  summary: KpiSummaryDto;
  projects: UpstreamProject[];
  tasks: UpstreamTask[];
}): KpiDashboardDto {
  const { userId, summary, projects, tasks } = params;
  return {
    userId: String(userId),
    summary,
    projects: (projects ?? []).map((p) => projectSummaryToDto(p)),
    recentTasks: (tasks ?? []).slice(0, 10).map(recentTaskToDto)
  };
}
