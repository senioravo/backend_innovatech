class ProjectModel {
  constructor({ id, userId, name, description, createdAt, responsableId }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.responsableId = responsableId ?? null;
  }
}

module.exports = ProjectModel;
