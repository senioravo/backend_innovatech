function formatDate(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function createProjectDto(body) {
  const name = body.name;
  const description = body.description;
  return {
    name: typeof name === 'string' ? name.trim() || null : null,
    description: typeof description === 'string' ? description.trim() || null : null
  };
}

function projectToDto(project) {
  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    assigneeId: project.assigneeId ?? null,
    startDate: formatDate(project.startDate),
    endDate: formatDate(project.endDate),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

function projectsToDto(projects) {
  if (!Array.isArray(projects)) return [];
  return projects.map(projectToDto);
}

function pickProjectScheduleFields(body) {
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

module.exports = {
  createProjectDto,
  projectToDto,
  projectsToDto,
  pickProjectScheduleFields
};
