"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TASK_STATUSES = Object.freeze(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
function countByStatus(tasks) {
    const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
    for (const t of tasks) {
        const s = t.status ?? 'PENDING';
        if (Object.prototype.hasOwnProperty.call(counts, s))
            counts[s] += 1;
    }
    return counts;
}
function completionRate(countByStatusMap, total) {
    if (!total)
        return 0;
    const done = countByStatusMap.DONE ?? 0;
    return Math.round((done / total) * 100) / 100;
}
module.exports = { TASK_STATUSES, countByStatus, completionRate };
