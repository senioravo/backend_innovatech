import projectRepository from '../repositories/projectRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import resourceAvailabilityService from './resourceAvailabilityService.js';
import ValidationService from './validationService.js';
import { createProjectDto, pickProjectScheduleFields } from '../dtos/projectDto.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { canViewAllProjects } from '../utils/roleAccess.js';

class ProjectService {
  repository;

  constructor(repository = projectRepository) {
    this.repository = repository;
  }

  async listProjects(userId, role) {
    if (!userId) throw new Error('userId is required');
    if (canViewAllProjects(role)) {
      return this.repository.findAll();
    }
    return this.repository.findByUserId(userId);
  }

  async getProject(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    return resourceAvailabilityService.assertProjectAvailable(projectId, userId);
  }

  async createProject({ name, description, userId, startDate = null, endDate = null, assigneeId = null }) {
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

  async createProjectFromRequest(body, userId) {
    const validation = ValidationService.validateProjectInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const data = createProjectDto(body);
    const schedule = pickProjectScheduleFields(body);
    return this.createProject({ ...data, ...schedule, userId });
  }

  async updateProjectFromRequest(projectId, userId, body) {
    const validation = ValidationService.validateUpdateInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const updates: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(body, 'name')) {
      updates.name = String(body.name).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      updates.description = String(body.description).trim();
    }
    Object.assign(updates, pickProjectScheduleFields(body));

    return this.updateProject(projectId, userId, updates);
  }

  async updateProjectStatusFromRequest(projectId, userId, body) {
    const validation = ValidationService.validateProjectStatusInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    return this.updateProjectStatus(projectId, userId, validation.normalized);
  }

  async assignAssigneeFromRequest(projectId, userId, body) {
    const validation = ValidationService.validateAssigneeInput(body);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    return this.assignAssignee(projectId, userId, String(body.assigneeId).trim());
  }

  async updateProject(projectId, userId, updates) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');

    await resourceAvailabilityService.assertProjectAvailable(projectId, userId);

    const patch = {
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      startDate: updates.startDate,
      endDate: updates.endDate
    };
    const defined: Record<string, unknown> = {};
    if (patch.name !== undefined) defined.name = patch.name;
    if (patch.description !== undefined) defined.description = patch.description;
    if (patch.startDate !== undefined) defined.startDate = patch.startDate;
    if (patch.endDate !== undefined) defined.endDate = patch.endDate;

    const project = await this.repository.update(projectId, userId, defined);

    if (!project) throw new NotFoundError('Project not found');
    return project;
  }

  async updateProjectStatus(projectId, userId, status) {
    if (!projectId || !userId || !status) {
      throw new Error('projectId, userId and status are required');
    }
    await resourceAvailabilityService.assertProjectResponsable(projectId, userId);
    const project = await this.repository.updateStatusByAssignee(projectId, userId, status);
    if (!project) throw new NotFoundError('Project not found');
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
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    await resourceAvailabilityService.assertProjectAvailable(projectId, userId);
    await taskRepository.deleteByProjectId(projectId);
    const deleted = await this.repository.delete(projectId, userId);
    if (!deleted) throw new NotFoundError('Project not found');
    return true;
  }
}

export default new ProjectService();;