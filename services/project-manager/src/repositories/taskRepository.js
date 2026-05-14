const TaskModel = require('../models/taskModel');
const projectRepository = require('./projectRepository');

const tasks = [];

class TaskRepository {
  findByIdAndUserId(taskId, userId) {
    if (!taskId || !userId) throw new Error('taskId y userId son requeridos');
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const project = projectRepository.findByIdAndUserId(task.projectId, userId);
    return project ? task : null;
  }

  findByProjectIdAndTaskId(projectId, taskId, userId) {
    if (!projectId || !taskId || !userId) {
      throw new Error('projectId, taskId y userId son requeridos');
    }
    const project = projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) return null;
    const task = tasks.find((t) => t.id === taskId && t.projectId === projectId);
    return task || null;
  }

  create(data) {
    if (!data?.projectId || !data?.title) {
      throw new Error('projectId y title son requeridos');
    }
    const task = new TaskModel(data);
    tasks.push(task);
    return task;
  }

  update(taskId, userId, updates) {
    const task = this.findByIdAndUserId(taskId, userId);
    if (!task) return null;
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.completed !== undefined) task.completed = updates.completed;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  delete(taskId, userId) {
    const task = this.findByIdAndUserId(taskId, userId);
    if (!task) return false;
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  }

  deleteByProjectId(projectId) {
    if (!projectId) return;
    for (let i = tasks.length - 1; i >= 0; i -= 1) {
      if (tasks[i].projectId === projectId) tasks.splice(i, 1);
    }
  }
}

module.exports = new TaskRepository();
