// @ts-nocheck
import projectRepository from '../repositories/projectRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/errorHandler.js';

const resourceAvailabilityService = {
  async assertProjectAvailable(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    const project = await projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async assertTaskAvailable(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    const task = await taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  },

  async assertProjectResponsable(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');
    if (!project.assigneeId || project.assigneeId !== userId) {
      throw new ForbiddenError('Only the project responsable can perform this action');
    }
    return project;
  },

  async assertTaskInProject(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId and userId are required');
    }
    const task = await taskRepository.findByProjectIdAndTaskId(projectId, taskId, userId);
    if (!task) throw new NotFoundError('Task not found in this project');
    return task;
  }
};

export default resourceAvailabilityService;;