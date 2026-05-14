function formatDate(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function createTaskDto(body) {
  const title = body.title;
  const description = body.description;
  return {
    title: typeof title === 'string' ? title.trim() : null,
    description:
      description === undefined || description === null
        ? ''
        : typeof description === 'string'
          ? description.trim()
          : null,
    completed: body.completed
  };
}

function taskToDto(task) {
  if (!task) return null;
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    assigneeId: task.assigneeId ?? null,
    startDate: formatDate(task.startDate),
    endDate: formatDate(task.endDate),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function pickTaskScheduleFields(body) {
  const out = {};
  if (Object.prototype.hasOwnProperty.call(body, 'startDate')) {
    const v = body.startDate;
    out.startDate = v === null || v === '' ? null : String(v).trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'endDate')) {
    const v = body.endDate;
    out.endDate = v === null || v === '' ? null : String(v).trim();
  }
  return out;
}

module.exports = { createTaskDto, taskToDto, pickTaskScheduleFields };
