/**
 * DTOs de tarea para ms-project-manager.
 */

function formatDate(v: unknown) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/**
 * Normaliza body de creación/actualización de tarea.
 * @param {Record<string, unknown>|object} body
 * @returns {{ title: string|null; description: string|null; completed: unknown }}
 */
export function createTaskDto(body: Record<string, unknown> | object = {}) {
  const input = body as Record<string, unknown>;
  const title = input.title;
  const description = input.description;
  return {
    title: typeof title === 'string' ? title.trim() : null,
    description:
      description === undefined || description === null
        ? ''
        : typeof description === 'string'
          ? description.trim()
          : null,
    completed: input.completed
  };
}

/**
 * Mapea TaskModel / fila SQL a DTO de respuesta API.
 * @param {Record<string, unknown>|null|object} task
 * @returns {object|null}
 */
export function taskToDto(task: Record<string, unknown> | null | object) {
  if (!task) return null;
  const t = task as Record<string, unknown>;
  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    completed: t.completed,
    status: t.status ?? 'PENDING',
    assigneeId: t.assigneeId ?? null,
    startDate: formatDate(t.startDate),
    endDate: formatDate(t.endDate),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  };
}

export function pickTaskScheduleFields(body: Record<string, unknown> = {}) {
  const out: Record<string, string | null> = {};
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
