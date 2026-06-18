// @ts-nocheck
class ProjectModel {
    constructor({ id, userId, name, description, createdAt, updatedAt, assigneeId, startDate, endDate, status }) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt ?? null;
        this.assigneeId = assigneeId ?? null;
        this.startDate = startDate ?? null;
        this.endDate = endDate ?? null;
        this.status = status ?? 'active';
    }
}
export default ProjectModel;
;
