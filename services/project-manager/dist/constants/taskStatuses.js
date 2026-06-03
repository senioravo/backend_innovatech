"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TASK_STATUSES = Object.freeze([
    'PENDING',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE'
]);
const TASK_STATUS_SET = new Set(TASK_STATUSES);
function isValidTaskStatus(value) {
    if (typeof value !== 'string' || !value.trim())
        return false;
    return TASK_STATUS_SET.has(value.trim().toUpperCase());
}
function normalizeTaskStatus(value) {
    return String(value).trim().toUpperCase();
}
/** Pipeline lineal: un solo paso hacia adelante (o mismo estado). */
function isAllowedTaskStatusTransition(from, to) {
    const i = TASK_STATUSES.indexOf(from);
    const j = TASK_STATUSES.indexOf(to);
    if (i === -1 || j === -1)
        return false;
    if (from === to)
        return true;
    return j === i + 1;
}
module.exports = {
    TASK_STATUSES,
    TASK_STATUS_SET,
    isValidTaskStatus,
    normalizeTaskStatus,
    isAllowedTaskStatusTransition
};
