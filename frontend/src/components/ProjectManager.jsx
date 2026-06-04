function ProjectManager({ user, projects, onLogout, onRefresh }) {
  return (
    <section className="card">
      <div className="project-header">
        <div>
          <h2>Bienvenido, {user.name || user.email}</h2>
          <p>Project-manager-service conectado para Innovatech Chile.</p>
        </div>
        <div className="project-actions">
          <button className="button-secondary" onClick={onRefresh}>
            Actualizar proyectos
          </button>
          <button className="button-secondary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="project-list">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No hay proyectos disponibles por el momento.</p>
            <p>Cuando el backend esté listo, aquí aparecerán tus espacios de trabajo.</p>
          </div>
        ) : (
          projects.map((project) => (
            <article key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'Proyecto sin descripción adicional.'}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ProjectManager;
