"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PROJECT_STATUSES = Object.freeze(['active', 'terminated']);
const PROJECT_STATUS_SET = new Set(PROJECT_STATUSES);
function isValidProjectStatus(value) {
    if (typeof value !== 'string' || !value.trim())
        return false;
    return PROJECT_STATUS_SET.has(value.trim().toLowerCase());
}
function normalizeProjectStatus(value) {
    return String(value).trim().toLowerCase();
}
module.exports = {
    PROJECT_STATUSES,
    PROJECT_STATUS_SET,
    isValidProjectStatus,
    normalizeProjectStatus
};
