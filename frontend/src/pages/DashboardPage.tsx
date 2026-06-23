import { useCallback, useEffect, useState, type FormEvent } from 'react';
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
  fetchProjects,
  fetchTaskAttachments,
  fetchTaskComments,
  fetchTasks,
  patchTaskStatus
} from '../api/bffClient';
import { useAuth } from '../auth/AuthContext';
import type { KpisResponse, Project, Task, TasksResponse, UserSession } from '../types/api';

const STATUSES = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  DONE: 'Hecho'
};

function statusLabel(code: string) {
  return STATUS_LABELS[code] ?? code;
}

function allowedStatuses(currentStatus: string) {
  const i = STATUSES.indexOf(currentStatus);
  if (i === -1) return STATUSES;
  return STATUSES.slice(i, Math.min(i + 2, STATUSES.length));
}

function calcProgress(summary: TasksResponse['summary']) {
  if (!summary?.total) return 0;
  const done = summary.byStatus?.DONE || 0;
  return Math.round((done / summary.total) * 100);
}

const SELECTED_PROJECT_KEY = 'innovatech_selected_project';

type TaskComment = { id: string; userId?: string; content: string };
type TaskAttachment = { id: string; documentName: string; documentUrl: string };

type TaskRowProps = {
  task: Task;
  projectId: string;
  onStatusChange: (taskId: string, status: string) => void;
  onRefresh: () => void;
};

function TaskRow({ task, projectId, onStatusChange, onRefresh }: TaskRowProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  async function loadDetails() {
    const [c, a] = await Promise.all([
      fetchTaskComments(projectId, task.id),
      fetchTaskAttachments(projectId, task.id)
    ]);
    setComments((c as { comments?: TaskComment[] })?.comments ?? []);
    setAttachments((a as { attachments?: TaskAttachment[] })?.attachments ?? []);
  }

  async function toggleOpen() {
    if (!open) await loadDetails();
    setOpen(!open);
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    await addTaskComment(projectId, task.id, commentText);
    setCommentText('');
    await loadDetails();
    onRefresh();
  }

  async function submitAttachment(e: FormEvent) {
    e.preventDefault();
    await addTaskAttachment(projectId, task.id, docName, docUrl);
    setDocName('');
    setDocUrl('');
    await loadDetails();
  }

  return (
    <>
      <tr>
        <td>{task.title}</td>
        <td>{statusLabel(task.status)}</td>
        <td>{task.completed ? 'Sí' : 'No'}</td>
        <td>
          <select
            value={task.status}
            onChange={(e) => {
              if (e.target.value !== task.status) onStatusChange(task.id, e.target.value);
            }}
          >
            {allowedStatuses(task.status).map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
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
  const [sessionUser, setSessionUser] = useState<UserSession | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<TasksResponse | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [kpis, setKpis] = useState<KpisResponse | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string }>
  >([]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [newTask, setNewTask] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const role = (sessionUser?.role || user?.role || '').toLowerCase();
  const canCreateProject = role === 'gestor';
  const canCreateTask = role === 'gestor' || role === 'profesional';
  const canSeeAnalytics = role === 'directivo' || role === 'gestor';

  const roleHint: Record<string, string> = {
    gestor: 'Puedes crear, editar y eliminar proyectos y tareas.',
    profesional: 'Puedes ver todos los proyectos y actualizar tareas asignadas. No puedes crear proyectos.',
    directivo: 'Puedes ver todos los proyectos, KPIs y exportar reportes. No puedes crear proyectos.'
  };

  const loadTasks = useCallback(async (projectId: string) => {
    setSelectedProject(projectId);
    sessionStorage.setItem(SELECTED_PROJECT_KEY, projectId);
    setTasksLoading(true);
    setTasksData(null);
    try {
      const data = await fetchTasks(projectId);
      setTasksData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const loadProjects = useCallback(async (options?: { background?: boolean }) => {
    if (!options?.background) {
      setLoading(true);
    }
    setError('');
    try {
      const data = await fetchProjects();
      setSessionUser(data.user ?? null);
      setProjects(data.projects ?? []);
    } catch (err) {
      const e = err as Error & { status?: number };
      setError(e.message);
      if (e.status === 401) {
        await logout();
        navigate('/login', { replace: true });
      }
    } finally {
      if (!options?.background) {
        setLoading(false);
      }
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
    loadProjects();
    loadAnalytics();
  }, [loadProjects, loadAnalytics]);

  useEffect(() => {
    if (loading || selectedProject || projects.length === 0) return;
    const savedId = sessionStorage.getItem(SELECTED_PROJECT_KEY);
    if (savedId && projects.some((p) => p.id === savedId)) {
      loadTasks(savedId);
    }
  }, [loading, projects, selectedProject, loadTasks]);

  async function handleLogout() {
    sessionStorage.removeItem(SELECTED_PROJECT_KEY);
    setSessionUser(null);
    setProjects([]);
    setSelectedProject(null);
    setTasksData(null);
    setKpis(null);
    setNotifications([]);
    await logout();
    navigate('/login', { replace: true });
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const created = (await createProject(newProject)) as Project;
      setNewProject({ name: '', description: '', startDate: '', endDate: '' });
      if (created?.id) {
        setProjects((prev) => {
          if (prev.some((p) => p.id === created.id)) return prev;
          return [created, ...prev];
        });
      }
      await loadProjects({ background: true });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    setError('');
    try {
      await createTask(selectedProject, newTask);
      setNewTask({ title: '', description: '', startDate: '', endDate: '' });
      await loadTasks(selectedProject);
      await loadAnalytics();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleStatusChange(taskId: string, status: string) {
    if (!selectedProject) return;
    setError('');
    try {
      await patchTaskStatus(selectedProject, taskId, status);
      await loadTasks(selectedProject);
      await loadAnalytics();
    } catch (err) {
      const msg = String((err as Error).message || '');
      setError(
        msg.includes('Invalid status transition')
          ? 'Solo puedes avanzar un paso: Pendiente → En progreso → En revisión → Hecho.'
          : msg
      );
      await loadTasks(selectedProject);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!window.confirm('¿Eliminar proyecto?')) return;
    setError('');
    try {
      await deleteProject(id);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 500) {
        try {
          const data = await fetchProjects();
          if (!data.projects?.some((p) => p.id === id)) {
            if (selectedProject === id) setSelectedProject(null);
            setProjects(data.projects ?? []);
            return;
          }
        } catch {
          // fall through to show original error
        }
      }
      setError((err as Error).message);
      return;
    }
    if (selectedProject === id) setSelectedProject(null);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await loadProjects({ background: true });
  }

  async function handleDeleteTask(taskId: string) {
    if (!window.confirm('¿Eliminar tarea?')) return;
    try {
      await deleteTask(taskId);
      if (selectedProject) await loadTasks(selectedProject);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const selectedProjectDetails = projects.find((p) => p.id === selectedProject);
  const progressPct = calcProgress(tasksData?.summary);

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
          Sesión: <strong>{sessionUser.email}</strong> — rol: <strong>{sessionUser.role}</strong>
        </p>
      )}

      {role && roleHint[role] && (
        <p style={{ padding: 8, background: '#f5f5f5', border: '1px solid #ddd', fontSize: 14 }}>
          {roleHint[role]}
        </p>
      )}

      {error && (
        <p style={{ color: 'crimson', padding: 8, border: '1px solid crimson' }}>{error}</p>
      )}

      {canSeeAnalytics && kpis && (
        <section style={{ marginTop: 16, padding: 12, border: '1px solid #4a90d9', background: '#f0f7ff' }}>
          <h2>KPIs y analítica</h2>
          <p>
            Avance global: <strong>{kpis.projectProgressPct}%</strong> — Tareas completadas:{' '}
            {kpis.completedTasks}/{kpis.totalTasks} — Utilización recursos:{' '}
            {kpis.resourceUtilization?.utilizationPct}%
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
        <h2>Proyectos ({projects.length})</h2>

        {canCreateProject && (
          <form onSubmit={handleCreateProject} style={{ marginBottom: 16, padding: 12, border: '1px solid #ccc' }}>
            <h3>Nuevo proyecto</h3>
            <input
              placeholder="Nombre (mínimo 3 caracteres)"
              value={newProject.name}
              onChange={(e) => setNewProject((s) => ({ ...s, name: e.target.value }))}
              required
              minLength={3}
              style={{ width: '100%', padding: 6, marginBottom: 8 }}
            />
            <textarea
              placeholder="Descripción (mínimo 10 caracteres)"
              value={newProject.description}
              onChange={(e) => setNewProject((s) => ({ ...s, description: e.target.value }))}
              required
              minLength={10}
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
          {projects.map((p) => (
            <li key={p.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
              <button type="button" onClick={() => loadTasks(p.id)}>
                Ver tareas
              </button>{' '}
              {canCreateProject && (
                <button type="button" onClick={() => handleDeleteProject(p.id)}>
                  Eliminar
                </button>
              )}{' '}
              <strong>{p.name}</strong>
              <br />
              <small>{p.description}</small>
              {(p.startDate || p.endDate) && (
                <>
                  <br />
                  <small>
                    {p.startDate || '—'} → {p.endDate || '—'}
                  </small>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {selectedProject && (
        <section style={{ marginTop: 24, padding: 12, border: '2px solid #333' }}>
          <h2>Tareas — {selectedProjectDetails?.name || selectedProject}</h2>

          {tasksLoading && <p>Cargando tareas…</p>}

          {tasksData?.summary && (
            <div style={{ marginBottom: 16 }}>
              <p>
                Progreso del proyecto: <strong>{progressPct}%</strong> ({tasksData.summary.total} tareas)
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
                    width: `${progressPct}%`,
                    height: '100%',
                    background: '#4caf50',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                {Object.entries(tasksData.summary.byStatus || {})
                  .map(([k, v]) => `${statusLabel(k)}: ${v}`)
                  .join(' · ')}
              </p>
            </div>
          )}

          {canCreateTask && (
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
          )}

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
              {(tasksData?.tasks ?? []).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  projectId={selectedProject}
                  onStatusChange={handleStatusChange}
                  onRefresh={() => loadTasks(selectedProject)}
                />
              ))}
            </tbody>
          </table>

          {canCreateProject &&
            (tasksData?.tasks ?? []).map((task) => (
            <p key={`del-${task.id}`}>
              <button type="button" onClick={() => handleDeleteTask(task.id)}>
                Eliminar tarea: {task.title}
              </button>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
