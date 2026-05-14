function createTaskDto(body) {
  const title = body.title ?? body.titulo;
  const description = body.description ?? body.descripcion;
  return {
    title: typeof title === 'string' ? title.trim() : null,
    description:
      description === undefined || description === null
        ? ''
        : typeof description === 'string'
          ? description.trim()
          : null,
    completed: body.completed ?? body.completado
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
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

module.exports = { createTaskDto, taskToDto };
