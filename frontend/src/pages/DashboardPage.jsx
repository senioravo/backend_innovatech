import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createProject,
  createTask,
  fetchKpisDashboard,
  fetchProyectos,
  fetchTareas,
  patchTaskStatus
} from '../api/bffClient';
import { useAuth } from '../auth/AuthContext';
import KpiDashboard from '../components/KpiDashboard';

const ESTADOS = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpisError, setKpisError] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tareasData, setTareasData] = useState(null);
  const [tareasLoading, setTareasLoading] = useState(false);
  const [kpisData, setKpisData] = useState(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const rol = (sessionUser?.rol || user?.rol || '').toLowerCase();
  const canCreateProject = rol === 'gestor';

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    setKpisError('');
    try {
      const kpis = await fetchKpisDashboard();
      setKpisData(kpis);
    } catch (err) {
      setKpisError(err.message || 'No se pudieron cargar los KPIs');
      if (err.status === 401) {
        await logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setKpisLoading(false);
    }
  }, [logout, navigate]);

  const loadProyectos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProyectos();
      setSessionUser(data.usuario ?? null);
      setProyectos(data.proyectos ?? []);
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        await logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadProyectos(), loadKpis()]);
  }, [loadProyectos, loadKpis]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  async function loadTareas(proyectoId) {
    setSelectedId(proyectoId);
    setTareasLoading(true);
    setTareasData(null);
    try {
      const data = await fetchTareas(proyectoId);
      setTareasData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setTareasLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setError('');
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description
      });
      setNewProject({ name: '', description: '' });
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    try {
      await createTask(selectedId, newTask);
      setNewTask({ title: '', description: '' });
      await loadTareas(selectedId);
      await loadKpis();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(taskId, status) {
    if (!selectedId) return;
    setError('');
    try {
      await patchTaskStatus(selectedId, taskId, status);
      await loadTareas(selectedId);
      await loadKpis();
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedProyecto = proyectos.find((p) => p.id === selectedId);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand-subtitle">InnovaTech</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Panel de progreso y gestión de proyectos conectado al BFF y ms-kpi.
          </p>
        </div>
        <button type="button" className="button-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      {sessionUser && (
        <p className="page-description">
          Sesión: <strong>{sessionUser.email}</strong> — rol: <strong>{sessionUser.rol}</strong>
        </p>
      )}

      <main className="app-main">
        <KpiDashboard data={kpisData} loading={kpisLoading} error={kpisError} />

        {error && <div className="error-banner">{error}</div>}

        <section className="card" style={{ marginTop: 24 }}>
          <div className="section-title">
            <h2>Proyectos ({proyectos.length})</h2>
            <p>Selecciona un proyecto para ver y administrar sus tareas.</p>
          </div>

          {loading && <div className="loading-indicator">Cargando proyectos…</div>}

          {canCreateProject && (
            <form onSubmit={handleCreateProject} className="form-grid" style={{ marginTop: 16 }}>
              <h3>Nuevo proyecto (solo Gestor)</h3>
              <label>
                Nombre
                <input
                  placeholder="Nombre (mín. 3)"
                  value={newProject.name}
                  onChange={(e) => setNewProject((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Descripción
                <textarea
                  placeholder="Descripción (mín. 10)"
                  value={newProject.description}
                  onChange={(e) => setNewProject((s) => ({ ...s, description: e.target.value }))}
                  required
                  rows={2}
                  style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid #d6dae3' }}
                />
              </label>
              <button type="submit" className="button-primary">Crear proyecto</button>
            </form>
          )}

          {!loading && proyectos.length === 0 && (
            <div className="empty-state">No hay proyectos todavía.</div>
          )}

          <ul className="project-list" style={{ marginTop: 16, listStyle: 'none', padding: 0 }}>
            {proyectos.map((p) => (
              <li key={p.id} className="project-card">
                <button type="button" className="button-link" onClick={() => loadTareas(p.id)}>
                  Ver tareas
                </button>{' '}
                <strong>{p.nombre}</strong>
                <p>{p.descripcion}</p>
                {p.responsable?.nombre && <small>Responsable: {p.responsable.nombre}</small>}
              </li>
            ))}
          </ul>
        </section>

        {selectedId && (
          <section className="card" style={{ marginTop: 24 }}>
            <div className="section-title">
              <h2>Tareas — {selectedProyecto?.nombre || selectedId}</h2>
            </div>

            {tareasLoading && <div className="loading-indicator">Cargando tareas…</div>}

            {tareasData?.resumen && (
              <p>
                Total: {tareasData.resumen.total} —{' '}
                {Object.entries(tareasData.resumen.porEstado || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}
              </p>
            )}

            <form onSubmit={handleCreateTask} className="form-grid" style={{ marginTop: 16 }}>
              <h3>Nueva tarea</h3>
              <label>
                Título
                <input
                  placeholder="Título (mín. 3)"
                  value={newTask.title}
                  onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
                  required
                />
              </label>
              <label>
                Descripción
                <input
                  placeholder="Descripción (opcional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
                />
              </label>
              <button type="submit" className="button-primary">Crear tarea</button>
            </form>

            <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Completada</th>
                  <th>Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {(tareasData?.tareas ?? []).map((t) => (
                  <tr key={t.id}>
                    <td>{t.titulo}</td>
                    <td>{t.estado}</td>
                    <td>{t.completada ? 'Sí' : 'No'}</td>
                    <td>
                      <select
                        defaultValue={t.estado}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!tareasLoading && (tareasData?.tareas ?? []).length === 0 && (
              <div className="empty-state">Sin tareas en este proyecto.</div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
