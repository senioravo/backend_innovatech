/**
 * DTO (Data Transfer Object) para transformación de datos
 * Responsabilidad única: mapear entre modelo interno y API
 */

function createProjectDto(body) {
  return {
    name: body.name?.trim() || null,
    description: body.description?.trim() || null
  };
}

function projectToDto(project) {
  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt
  };
}

function projectsToDto(projects) {
  if (!Array.isArray(projects)) return [];
  return projects.map(projectToDto);
}

module.exports = { createProjectDto, projectToDto, projectsToDto };
