/**
 * DTOs para verificación de disponibilidad de proyectos y tareas.
 */

export type ResourceKind = 'project' | 'task';

export interface ResourceAvailabilityDto {
  available: true;
  resource: ResourceKind;
  id: string | number;
  projectId?: string | number;
}

export function projectAvailabilityToDto(project: { id: string | number | unknown }): ResourceAvailabilityDto {
  return {
    available: true,
    resource: 'project',
    id: project.id as string | number
  };
}

export function taskAvailabilityToDto(task: {
  id: string | number;
  projectId: string | number;
}): ResourceAvailabilityDto {
  return {
    available: true,
    resource: 'task',
    id: task.id,
    projectId: task.projectId
  };
}
