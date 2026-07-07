/**
 * Modelo de dominio de tarea asociada a un proyecto.
 * Incluye estado Kanban, fechas y assignee opcional.
 */
class TaskModel {
  id: string | number;
  projectId: string | number;
  title: string;
  description: string;
  completed: boolean;
  status: string;
  createdAt: unknown;
  updatedAt: unknown;
  assigneeId: string | number | null;
  startDate: unknown;
  endDate: unknown;

  /** @param {Record<string, unknown>} fields - Propiedades desde BD o DTO */
  constructor({
    id,
    projectId,
    title,
    description,
    completed,
    status,
    createdAt,
    updatedAt,
    assigneeId,
    startDate,
    endDate
  }: Record<string, unknown>) {
    this.id = id as string | number;
    this.projectId = projectId as string | number;
    this.title = String(title ?? '');
    this.description = String(description ?? '');
    this.completed = Boolean(completed);
    this.status = String(status ?? 'PENDING');
    this.createdAt = createdAt;
    this.updatedAt = updatedAt ?? null;
    this.assigneeId = (assigneeId ?? null) as string | number | null;
    this.startDate = startDate ?? null;
    this.endDate = endDate ?? null;
  }
}

export default TaskModel;
