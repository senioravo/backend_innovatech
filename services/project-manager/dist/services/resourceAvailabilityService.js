"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');
const { NotFoundError } = require('../utils/errorHandler');
const resourceAvailabilityService = {
    async assertProjectAvailable(projectId, userId) {
        if (!projectId || !userId)
            throw new Error('projectId and userId are required');
        const project = await projectRepository.findByIdAndUserId(projectId, userId);
        if (!project)
            throw new NotFoundError('Project not found');
        return project;
    },
    async assertTaskAvailable(taskId, userId) {
        if (!taskId || !userId)
            throw new Error('taskId and userId are required');
        const task = await taskRepository.findByIdAndUserId(taskId, userId);
        if (!task)
            throw new NotFoundError('Task not found');
        return task;
    },
    async assertTaskInProject(projectId, taskId, userId) {
        if (!projectId || !taskId || !userId) {
            throw new Error('projectId, taskId and userId are required');
        }
        const task = await taskRepository.findByProjectIdAndTaskId(projectId, taskId, userId);
        if (!task)
            throw new NotFoundError('Task not found in this project');
        return task;
    }
};
module.exports = resourceAvailabilityService;
