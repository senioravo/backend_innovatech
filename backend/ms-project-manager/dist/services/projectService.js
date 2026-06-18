// @ts-nocheck
import projectRepository from '../repositories/projectRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import resourceAvailabilityService from './resourceAvailabilityService.js';
import { NotFoundError } from '../utils/errorHandler.js';
class ProjectService {
    constructor(repository = projectRepository) {
        this.repository = repository;
    }
    async listProjects(userId) {
        if (!userId)
            throw new Error('userId is required');
        return this.repository.findByUserId(userId);
    }
    async getProject(projectId, userId) {
        if (!projectId || !userId)
            throw new Error('projectId and userId are required');
        return resourceAvailabilityService.assertProjectAvailable(projectId, userId);
    }
    async createProject({ name, description, userId, startDate, endDate, assigneeId }) {
        if (!name || !description || !userId) {
            throw new Error('name, description and userId are required');
        }
        return this.repository.create({
            userId,
            name: name.trim(),
            description: description.trim(),
            assigneeId: assigneeId ?? null,
            startDate: startDate ?? null,
            endDate: endDate ?? null
        });
    }
    async updateProject(projectId, userId, updates) {
        if (!projectId || !userId)
            throw new Error('projectId and userId are required');
        await resourceAvailabilityService.assertProjectAvailable(projectId, userId);
        const patch = {
            name: updates.name?.trim(),
            description: updates.description?.trim(),
            startDate: updates.startDate,
            endDate: updates.endDate
        };
        const defined = {};
        if (patch.name !== undefined)
            defined.name = patch.name;
        if (patch.description !== undefined)
            defined.description = patch.description;
        if (patch.startDate !== undefined)
            defined.startDate = patch.startDate;
        if (patch.endDate !== undefined)
            defined.endDate = patch.endDate;
        const project = await this.repository.update(projectId, userId, defined);
        if (!project)
            throw new NotFoundError('Project not found');
        return project;
    }
    async updateProjectStatus(projectId, userId, status) {
        if (!projectId || !userId || !status) {
            throw new Error('projectId, userId and status are required');
        }
        await resourceAvailabilityService.assertProjectResponsable(projectId, userId);
        const project = await this.repository.updateStatusByAssignee(projectId, userId, status);
        if (!project)
            throw new NotFoundError('Project not found');
        return project;
    }
    async assignAssignee(projectId, ownerUserId, assigneeId) {
        if (!projectId || !ownerUserId || !assigneeId) {
            throw new Error('projectId, ownerUserId and assigneeId are required');
        }
        await resourceAvailabilityService.assertProjectAvailable(projectId, ownerUserId);
        return this.repository.update(projectId, ownerUserId, { assigneeId });
    }
    async deleteProject(projectId, userId) {
        if (!projectId || !userId)
            throw new Error('projectId and userId are required');
        await resourceAvailabilityService.assertProjectAvailable(projectId, userId);
        await taskRepository.deleteByProjectId(projectId);
        await this.repository.delete(projectId, userId);
        return true;
    }
}
export default new ProjectService();
;
