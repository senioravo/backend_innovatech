import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createProject,
  createTask,
  fetchProyectos,
  fetchTareas,
  patchTaskStatus
} from '../api/bffClient';
import { useAuth } from '../auth/AuthContext';

const ESTADOS = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tareasData, setTareasData] = useState(null);
  const [tareasLoading, setTareasLoading] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const rol = (sessionUser?.rol || user?.rol || '').toLowerCase();
  const canCreateProject = rol === 'gestor';

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

  useEffect(() => {
    loadProyectos();
  }, [loadProyectos]);

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
      await loadProyectos();
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
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedProyecto = proyectos.find((p) => p.id === selectedId);

  return (
    <div style={{ fontFamily: 'sans-serif', margin: 16, maxWidth: 960 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard — Project Manager (vía BFF)</h1>
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      {sessionUser && (
        <p>
          Sesión: <strong>{sessionUser.email}</strong> — rol: <strong>{sessionUser.rol}</strong>
        </p>
      )}

      {error && (
        <p style={{ color: 'crimson', padding: 8, border: '1px solid crimson' }}>{error}</p>
      )}

      {loading && <p>Cargando proyectos…</p>}

      <section style={{ marginTop: 24 }}>
        <h2>Proyectos ({proyectos.length})</h2>

        {canCreateProject && (
          <form onSubmit={handleCreateProject} style={{ marginBottom: 16, padding: 12, border: '1px solid #ccc' }}>
            <h3>Nuevo proyecto (solo Gestor)</h3>
            <p>
              <input
                placeholder="Nombre (mín. 3)"
                value={newProject.name}
                onChange={(e) => setNewProject((s) => ({ ...s, name: e.target.value }))}
                required
                style={{ width: '100%', padding: 6 }}
              />
            </p>
            <p>
              <textarea
                placeholder="Descripción (mín. 10)"
                value={newProject.description}
                onChange={(e) => setNewProject((s) => ({ ...s, description: e.target.value }))}
                required
                rows={2}
                style={{ width: '100%' }}
              />
            </p>
            <button type="submit">Crear proyecto</button>
          </form>
        )}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {proyectos.map((p) => (
            <li key={p.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
              <button type="button" onClick={() => loadTareas(p.id)}>
                Ver tareas
              </button>{' '}
              <strong>{p.nombre}</strong>
              <br />
              <small>{p.descripcion}</small>
              {p.responsable?.nombre && (
                <>
                  <br />
                  <small>Responsable: {p.responsable.nombre}</small>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {selectedId && (
        <section style={{ marginTop: 24, padding: 12, border: '2px solid #333' }}>
          <h2>
            Tareas — {selectedProyecto?.nombre || selectedId}
          </h2>

          {tareasLoading && <p>Cargando tareas…</p>}

          {tareasData?.resumen && (
            <p>
              Total: {tareasData.resumen.total} —{' '}
              {Object.entries(tareasData.resumen.porEstado || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            </p>
          )}

          <form onSubmit={handleCreateTask} style={{ marginBottom: 16 }}>
            <h3>Nueva tarea</h3>
            <p>
              <input
                placeholder="Título (mín. 3)"
                value={newTask.title}
                onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
                required
                style={{ width: '100%', padding: 6 }}
              />
            </p>
            <p>
              <input
                placeholder="Descripción (opcional, mín. 10 si se envía)"
                value={newTask.description}
                onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
                style={{ width: '100%', padding: 6 }}
              />
            </p>
            <button type="submit">Crear tarea</button>
          </form>

          <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            <p>Sin tareas en este proyecto.</p>
          )}
        </section>
      )}
    </div>
  );
}
