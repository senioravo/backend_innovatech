const taskRepository = require('../repositories/taskRepository');
const resourceAvailabilityService = require('./resourceAvailabilityService');
const { NotFoundError } = require('../utils/errorHandler');

class TaskService {
  async createTask(projectId, userId, payload) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    await resourceAvailabilityService.assertProjectAvailable(projectId, userId);

    return taskRepository.create({
      projectId,
      title: payload.title,
      description: payload.description ?? '',
      completed: Boolean(payload.completed),
      status: payload.status,
      assigneeId: payload.assigneeId ?? null,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null
    });
  }

  async listTasksByProject(projectId, userId) {
    if (!projectId || !userId) throw new Error('projectId and userId are required');
    await resourceAvailabilityService.assertProjectAvailable(projectId, userId);
    return taskRepository.findByProjectId(projectId);
  }

  async getTask(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId and userId are required');
    }
    return resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
  }

  async updateTaskStatus(projectId, taskId, userId, status) {
    if (!projectId || !taskId || !userId || !status) {
      throw new Error('projectId, taskId, userId and status are required');
    }
    await resourceAvailabilityService.assertTaskInProject(projectId, taskId, userId);
    const completed = status === 'DONE';
    const task = await taskRepository.update(taskId, userId, { status, completed });
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async updateTask(taskId, userId, updates) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const task = await taskRepository.update(taskId, userId, updates);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async assignAssignee(taskId, userId, assigneeId) {
    if (!taskId || !userId || !assigneeId) {
      throw new Error('taskId, userId and assigneeId are required');
    }
    await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const task = await taskRepository.update(taskId, userId, { assigneeId });
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async deleteTask(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId and userId are required');
    await resourceAvailabilityService.assertTaskAvailable(taskId, userId);
    const deleted = await taskRepository.delete(taskId, userId);
    if (!deleted) throw new NotFoundError('Task not found');
    return true;
  }
}

module.exports = new TaskService();
