class TaskModel {
  constructor({ id, projectId, title, description, completed, createdAt, updatedAt, responsableId }) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description ?? '';
    this.completed = Boolean(completed);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.responsableId = responsableId ?? null;
  }
}

module.exports = TaskModel;
