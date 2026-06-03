"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskRepository = require('../repositories/taskRepository');
const { TASK_STATUSES } = require('../constants/taskStatuses');
const { taskToDto } = require('../dtos/taskDto');
function countByStatus(tasks) {
    const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
    for (const t of tasks) {
        const s = t.status ?? 'PENDING';
        if (Object.prototype.hasOwnProperty.call(counts, s))
            counts[s] += 1;
    }
    return counts;
}
const consultationService = {
    async getTaskDashboardForUser(userId) {
        if (!userId)
            throw new Error('userId is required');
        const rows = await taskRepository.findForUserDashboard(userId);
        const tasks = rows.map(({ task, projectName }) => ({
            ...taskToDto(task),
            projectName
        }));
        return {
            userId,
            total: tasks.length,
            countByStatus: countByStatus(tasks),
            tasks
        };
    }
};
module.exports = consultationService;
