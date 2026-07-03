/**
 * DTOs de proyecto para ms-project-manager.
 * Transforman filas de BD / body HTTP al contrato de la API.
 */

function formatDate(v: unknown) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/**
 * Normaliza body de creación de proyecto.
 * @param {Record<string, unknown>} body
 * @returns {{ name: string|null; description: string|null }}
 */
export function createProjectDto(body: Record<string, unknown> = {}) {
  const name = body.name;
  const description = body.description;
  return {
    name: typeof name === 'string' ? name.trim() || null : null,
    description: typeof description === 'string' ? description.trim() || null : null
  };
}

/**
 * Mapea ProjectModel / fila SQL a DTO de respuesta API.
 * @param {Record<string, unknown>|null|object} project
 * @returns {object|null}
 */
export function projectToDto(project: Record<string, unknown> | null | object) {
  if (!project) return null;
  const p = project as Record<string, unknown>;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    assigneeId: p.assigneeId ?? null,
    status: p.status ?? 'active',
    startDate: formatDate(p.startDate),
    endDate: formatDate(p.endDate),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

export function projectsToDto(projects: unknown) {
  if (!Array.isArray(projects)) return [];
  return projects.map((project) => projectToDto(project as Record<string, unknown>));
}

export function pickProjectScheduleFields(body: Record<string, unknown> = {}) {
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
