// @ts-nocheck
export {};
class TaskModel {
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
  }) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description ?? '';
    this.completed = Boolean(completed);
    this.status = status ?? 'PENDING';
    this.createdAt = createdAt;
    this.updatedAt = updatedAt ?? null;
    this.assigneeId = assigneeId ?? null;
    this.startDate = startDate ?? null;
    this.endDate = endDate ?? null;
  }
}

module.exports = TaskModel;
