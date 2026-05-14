const TASK_STATUSES = Object.freeze([
  'PENDING',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE'
]);

const TASK_STATUS_SET = new Set(TASK_STATUSES);

function isValidTaskStatus(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  return TASK_STATUS_SET.has(value.trim().toUpperCase());
}

function normalizeTaskStatus(value) {
  return String(value).trim().toUpperCase();
}

module.exports = { TASK_STATUSES, TASK_STATUS_SET, isValidTaskStatus, normalizeTaskStatus };
