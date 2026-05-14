class TaskModel {
  constructor({ id, projectId, title, description, completed, createdAt, updatedAt }) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description ?? '';
    this.completed = Boolean(completed);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = TaskModel;
