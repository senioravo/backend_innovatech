/**
 * Modelo de dominio de proyecto en ms-project-manager.
 * Representa la entidad persistida con fechas, assignee y estado.
 */
class ProjectModel {
  id: string | number;
  userId: string | number;
  name: string;
  description: string;
  createdAt: unknown;
  updatedAt: unknown;
  assigneeId: string | number | null;
  startDate: unknown;
  endDate: unknown;
  status: string;

  /**
   * @param {Record<string, unknown>} fields - Propiedades del proyecto desde BD o DTO
   */
  constructor({
    id,
    userId,
    name,
    description,
    createdAt,
    updatedAt,
    assigneeId,
    startDate,
    endDate,
    status
  }: Record<string, unknown>) {
    this.id = id as string | number;
    this.userId = userId as string | number;
    this.name = String(name ?? '');
    this.description = String(description ?? '');
    this.createdAt = createdAt;
    this.updatedAt = updatedAt ?? null;
    this.assigneeId = (assigneeId ?? null) as string | number | null;
    this.startDate = startDate ?? null;
    this.endDate = endDate ?? null;
    this.status = String(status ?? 'active');
  }
}

export default ProjectModel;
