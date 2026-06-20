import { buildEstadoItems, formatEstado, formatPorcentaje, hasKpiResumen } from '../utils/kpiFormatters';

function StatCard({ label, value, hint }) {
  return (
    <article className="kpi-stat-card">
      <p className="kpi-stat-label">{label}</p>
      <p className="kpi-stat-value">{value}</p>
      {hint ? <p className="kpi-stat-hint">{hint}</p> : null}
    </article>
  );
}

export default function KpiDashboard({ data, loading, error }) {
  if (loading) {
    return (
      <section className="kpi-dashboard card" aria-busy="true" aria-label="Cargando KPIs">
        <div className="section-title">
          <h2>Panel de progreso</h2>
          <p>Obteniendo métricas de tus proyectos y tareas…</p>
        </div>
        <div className="loading-indicator">Cargando indicadores…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="kpi-dashboard card" aria-label="Error KPIs">
        <div className="section-title">
          <h2>Panel de progreso</h2>
        </div>
        <div className="error-banner">{error}</div>
      </section>
    );
  }

  if (!hasKpiResumen(data)) {
    return (
      <section className="kpi-dashboard card" aria-label="KPIs vacíos">
        <div className="section-title">
          <h2>Panel de progreso</h2>
          <p>No hay datos de progreso disponibles todavía.</p>
        </div>
        <div className="empty-state">Crea un proyecto y agrega tareas para ver tus KPIs.</div>
      </section>
    );
  }

  const { resumen, tareasRecientes = [], proyectos = [] } = data;
  const porcentaje = formatPorcentaje(resumen.tasaCompletadas);
  const estadoItems = buildEstadoItems(resumen.porEstado);
  const maxEstado = Math.max(...estadoItems.map((item) => item.count), 1);

  return (
    <section className="kpi-dashboard card" role="region" aria-label="Panel de progreso">
      <div className="section-title">
        <h2>Panel de progreso</h2>
        <p>Resumen de {resumen.totalProyectos} proyectos y {resumen.totalTareas} tareas asignadas.</p>
      </div>

      <div className="kpi-stats-grid">
        <StatCard label="Proyectos activos" value={resumen.totalProyectos} />
        <StatCard label="Tareas totales" value={resumen.totalTareas} />
        <StatCard label="Completadas" value={`${porcentaje}%`} hint="Tareas en estado DONE" />
      </div>

      <div className="kpi-progress-block">
        <div className="kpi-progress-header">
          <span>Avance general</span>
          <strong>{porcentaje}%</strong>
        </div>
        <div className="kpi-progress-track" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
          <div className="kpi-progress-fill" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      <div className="kpi-status-grid">
        {estadoItems.map((item) => (
          <div key={item.key} className="kpi-status-row">
            <div className="kpi-status-meta">
              <span className={`kpi-status-badge kpi-status-${item.key.toLowerCase()}`}>{item.label}</span>
              <span>{item.count}</span>
            </div>
            <div className="kpi-status-bar-track">
              <div
                className={`kpi-status-bar-fill kpi-status-${item.key.toLowerCase()}`}
                style={{ width: `${(item.count / maxEstado) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {proyectos.length > 0 && (
        <div className="kpi-section-block">
          <h3>Proyectos en seguimiento</h3>
          <ul className="kpi-project-list">
            {proyectos.slice(0, 5).map((p) => (
              <li key={p.id} className="kpi-project-item">
                <strong>{p.nombre}</strong>
                {p.descripcion ? <span>{p.descripcion}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tareasRecientes.length > 0 && (
        <div className="kpi-section-block">
          <h3>Tareas recientes</h3>
          <ul className="kpi-task-list">
            {tareasRecientes.slice(0, 5).map((t) => (
              <li key={t.id} className="kpi-task-item">
                <div>
                  <strong>{t.titulo}</strong>
                  {t.proyectoNombre ? <span className="kpi-task-project">{t.proyectoNombre}</span> : null}
                </div>
                <span className={`kpi-status-badge kpi-status-${(t.estado || 'PENDING').toLowerCase()}`}>
                  {formatEstado(t.estado)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
