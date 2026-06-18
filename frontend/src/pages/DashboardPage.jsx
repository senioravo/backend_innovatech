import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addTaskAttachment,
  addTaskComment,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  downloadReport,
  fetchKpis,
  fetchNotifications,
  fetchProyectos,
  fetchTaskAttachments,
  fetchTaskComments,
  fetchTareas,
  patchTaskStatus
} from '../api/bffClient';
import { useAuth } from '../auth/AuthContext';

const ESTADOS = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const ESTADO_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  DONE: 'Hecho'
};

function estadoLabel(codigo) {
  return ESTADO_LABELS[codigo] ?? codigo;
}

function estadosPermitidos(estadoActual) {
  const i = ESTADOS.indexOf(estadoActual);
  if (i === -1) return ESTADOS;
  return ESTADOS.slice(i, Math.min(i + 2, ESTADOS.length));
}

function calcularAvance(resumen) {
  if (!resumen?.total) return 0;
  const done = resumen.porEstado?.DONE || 0;
  return Math.round((done / resumen.total) * 100);
}

const SELECTED_PROJECT_KEY = 'innovatech_selected_project';

function TaskRow({ t, proyectoId, onStatusChange, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  async function loadDetails() {
    const [c, a] = await Promise.all([
      fetchTaskComments(proyectoId, t.id),
      fetchTaskAttachments(proyectoId, t.id)
    ]);
    setComments(c?.comments ?? []);
    setAttachments(a?.attachments ?? []);
  }

  async function toggleOpen() {
    if (!open) await loadDetails();
    setOpen(!open);
  }

  async function submitComment(e) {
    e.preventDefault();
    await addTaskComment(proyectoId, t.id, commentText);
    setCommentText('');
    await loadDetails();
    onRefresh();
  }

  async function submitAttachment(e) {
    e.preventDefault();
    await addTaskAttachment(proyectoId, t.id, docName, docUrl);
    setDocName('');
    setDocUrl('');
    await loadDetails();
  }

  return (
    <>
      <tr>
        <td>{t.titulo}</td>
        <td>{estadoLabel(t.estado)}</td>
        <td>{t.completada ? 'Sí' : 'No'}</td>
        <td>
          <select
            value={t.estado}
            onChange={(e) => {
              if (e.target.value !== t.estado) onStatusChange(t.id, e.target.value);
            }}
          >
            {estadosPermitidos(t.estado).map((s) => (
              <option key={s} value={s}>
                {estadoLabel(s)}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button type="button" onClick={toggleOpen}>
            {open ? 'Ocultar' : 'Colaboración'}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: '#f9f9f9', padding: 12 }}>
            <strong>Comentarios</strong>
            <ul>
              {comments.map((c) => (
                <li key={c.id}>
                  <small>{c.userId}</small>: {c.content}
                </li>
              ))}
            </ul>
            <form onSubmit={submitComment} style={{ marginBottom: 12 }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nuevo comentario"
                style={{ width: '70%', marginRight: 8 }}
              />
              <button type="submit">Comentar</button>
            </form>
            <strong>Documentación adjunta</strong>
            <ul>
              {attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.documentUrl} target="_blank" rel="noreferrer">
                    {a.documentName}
                  </a>
                </li>
              ))}
            </ul>
            <form onSubmit={submitAttachment}>
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Nombre documento"
                style={{ marginRight: 8 }}
              />
              <input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="URL del documento"
                style={{ width: '40%', marginRight: 8 }}
              />
              <button type="submit">Adjuntar</button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

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
  const [kpis, setKpis] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [newTask, setNewTask] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const rol = (sessionUser?.rol || user?.rol || '').toLowerCase();
  const canCreateProject = rol === 'gestor';
  const canSeeAnalytics = rol === 'directivo' || rol === 'gestor';

  const loadTareas = useCallback(async (proyectoId) => {
    setSelectedId(proyectoId);
    sessionStorage.setItem(SELECTED_PROJECT_KEY, proyectoId);
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
  }, []);

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

  const loadAnalytics = useCallback(async () => {
    if (!canSeeAnalytics) return;
    try {
      const [k, n] = await Promise.all([fetchKpis(), fetchNotifications()]);
      setKpis(k);
      setNotifications(n?.notifications ?? []);
    } catch {
      // KPIs opcionales si KrakenD aún no expone la ruta
    }
  }, [canSeeAnalytics]);

  useEffect(() => {
    loadProyectos();
    loadAnalytics();
  }, [loadProyectos, loadAnalytics]);

  useEffect(() => {
    if (loading || selectedId || proyectos.length === 0) return;
    const savedId = sessionStorage.getItem(SELECTED_PROJECT_KEY);
    if (savedId && proyectos.some((p) => p.id === savedId)) {
      loadTareas(savedId);
    }
  }, [loading, proyectos, selectedId, loadTareas]);

  async function handleLogout() {
    sessionStorage.removeItem(SELECTED_PROJECT_KEY);
    await logout();
    navigate('/login', { replace: true });
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setError('');
    try {
      await createProject(newProject);
      setNewProject({ name: '', description: '', startDate: '', endDate: '' });
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
      setNewTask({ title: '', description: '', startDate: '', endDate: '' });
      await loadTareas(selectedId);
      await loadAnalytics();
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
      await loadAnalytics();
    } catch (err) {
      const msg = String(err.message || '');
      setError(
        msg.includes('Invalid status transition')
          ? 'Solo puedes avanzar un paso: Pendiente → En progreso → En revisión → Hecho.'
          : msg
      );
      await loadTareas(selectedId);
    }
  }

  async function handleDeleteProject(id) {
    if (!window.confirm('¿Eliminar proyecto?')) return;
    try {
      await deleteProject(id);
      if (selectedId === id) setSelectedId(null);
      await loadProyectos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('¿Eliminar tarea?')) return;
    try {
      await deleteTask(taskId);
      await loadTareas(selectedId);
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedProyecto = proyectos.find((p) => p.id === selectedId);
  const avancePct = calcularAvance(tareasData?.resumen);

  return (
    <div style={{ fontFamily: 'sans-serif', margin: 16, maxWidth: 1000 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard InnovaTech</h1>
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

      {canSeeAnalytics && kpis && (
        <section style={{ marginTop: 16, padding: 12, border: '1px solid #4a90d9', background: '#f0f7ff' }}>
          <h2>KPIs y analítica</h2>
          <p>
            Avance global: <strong>{kpis.avanceProyectosPct}%</strong> — Tareas completadas:{' '}
            {kpis.tareasCompletadas}/{kpis.tareasTotales} — Utilización recursos:{' '}
            {kpis.utilizacionRecursos?.utilizacionPct}%
          </p>
          <button type="button" onClick={() => downloadReport('csv')}>
            Exportar reporte CSV (Excel)
          </button>{' '}
          <button type="button" onClick={() => downloadReport('json')}>
            Exportar métricas JSON
          </button>
        </section>
      )}

      {notifications.length > 0 && (
        <section style={{ marginTop: 16, padding: 12, border: '1px solid #e6a700', background: '#fffbea' }}>
          <h3>Notificaciones ({notifications.length})</h3>
          <ul>
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id}>
                <strong>{n.title}</strong>: {n.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading && <p>Cargando proyectos…</p>}

      <section style={{ marginTop: 24 }}>
        <h2>Proyectos ({proyectos.length})</h2>

        {canCreateProject && (
          <form onSubmit={handleCreateProject} style={{ marginBottom: 16, padding: 12, border: '1px solid #ccc' }}>
            <h3>Nuevo proyecto</h3>
            <input
              placeholder="Nombre"
              value={newProject.name}
              onChange={(e) => setNewProject((s) => ({ ...s, name: e.target.value }))}
              required
              style={{ width: '100%', padding: 6, marginBottom: 8 }}
            />
            <textarea
              placeholder="Descripción"
              value={newProject.description}
              onChange={(e) => setNewProject((s) => ({ ...s, description: e.target.value }))}
              required
              rows={2}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <label>
              Inicio:{' '}
              <input
                type="date"
                value={newProject.startDate}
                onChange={(e) => setNewProject((s) => ({ ...s, startDate: e.target.value }))}
              />
            </label>{' '}
            <label>
              Término:{' '}
              <input
                type="date"
                value={newProject.endDate}
                onChange={(e) => setNewProject((s) => ({ ...s, endDate: e.target.value }))}
              />
            </label>
            <button type="submit" style={{ marginLeft: 8 }}>
              Crear
            </button>
          </form>
        )}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {proyectos.map((p) => (
            <li key={p.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
              <button type="button" onClick={() => loadTareas(p.id)}>
                Ver tareas
              </button>{' '}
              {canCreateProject && (
                <button type="button" onClick={() => handleDeleteProject(p.id)}>
                  Eliminar
                </button>
              )}{' '}
              <strong>{p.nombre}</strong>
              <br />
              <small>{p.descripcion}</small>
              {(p.fechaInicio || p.fechaFin) && (
                <>
                  <br />
                  <small>
                    {p.fechaInicio || '—'} → {p.fechaFin || '—'}
                  </small>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {selectedId && (
        <section style={{ marginTop: 24, padding: 12, border: '2px solid #333' }}>
          <h2>Tareas — {selectedProyecto?.nombre || selectedId}</h2>

          {tareasLoading && <p>Cargando tareas…</p>}

          {tareasData?.resumen && (
            <div style={{ marginBottom: 16 }}>
              <p>
                Progreso del proyecto: <strong>{avancePct}%</strong> ({tareasData.resumen.total} tareas)
              </p>
              <div
                style={{
                  height: 16,
                  background: '#eee',
                  borderRadius: 4,
                  overflow: 'hidden',
                  maxWidth: 400
                }}
              >
                <div
                  style={{
                    width: `${avancePct}%`,
                    height: '100%',
                    background: '#4caf50',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                {Object.entries(tareasData.resumen.porEstado || {})
                  .map(([k, v]) => `${estadoLabel(k)}: ${v}`)
                  .join(' · ')}
              </p>
            </div>
          )}

          <form onSubmit={handleCreateTask} style={{ marginBottom: 16 }}>
            <h3>Nueva tarea</h3>
            <input
              placeholder="Título"
              value={newTask.title}
              onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
              required
              style={{ width: '100%', padding: 6, marginBottom: 8 }}
            />
            <input
              placeholder="Descripción"
              value={newTask.description}
              onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
              style={{ width: '100%', padding: 6, marginBottom: 8 }}
            />
            <button type="submit">Crear tarea</button>
          </form>

          <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Hecho</th>
                <th>Avance</th>
                <th>Colaboración</th>
              </tr>
            </thead>
            <tbody>
              {(tareasData?.tareas ?? []).map((t) => (
                <TaskRow
                  key={t.id}
                  t={t}
                  proyectoId={selectedId}
                  onStatusChange={handleStatusChange}
                  onRefresh={() => loadTareas(selectedId)}
                />
              ))}
            </tbody>
          </table>

          {(tareasData?.tareas ?? []).map((t) => (
            <p key={`del-${t.id}`}>
              <button type="button" onClick={() => handleDeleteTask(t.id)}>
                Eliminar tarea: {t.titulo}
              </button>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
