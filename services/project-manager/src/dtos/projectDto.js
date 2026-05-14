/**
 * DTO (Data Transfer Object) para transformación de datos
 * Responsabilidad única: mapear entre modelo interno y API
 */

function createProjectDto(body) {
  const name = body.name ?? body.nombre;
  const description = body.description ?? body.descripcion;
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
    responsableId: project.responsableId ?? null,
    createdAt: project.createdAt
  };
}

function projectsToDto(projects) {
  if (!Array.isArray(projects)) return [];
  return projects.map(projectToDto);
}

module.exports = { createProjectDto, projectToDto, projectsToDto };
