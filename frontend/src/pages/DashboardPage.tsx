/**
 * Dashboard principal post-login: proyectos, tareas Kanban, KPIs, notificaciones y colaboración.
 * Permisos por rol: gestor (CRUD proyecto), profesional (tareas), directivo (KPIs/export).
 */
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

/** Estados Kanban permitidos en el flujo de tareas */
const STATUSES = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

/** Etiquetas en español para códigos de estado */
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  DONE: 'Hecho'
};

/**
 * @param {string} code - Código de estado (PENDING, DONE, etc.)
 * @returns {string} Etiqueta legible
 */
function statusLabel(code: string) {
  return STATUS_LABELS[code] ?? code;
}

/**
 * Estados seleccionables: actual y siguiente paso del flujo Kanban.
 * @param {string} currentStatus
 * @returns {string[]}
 */
function allowedStatuses(currentStatus: string) {
  const i = STATUSES.indexOf(currentStatus);
  if (i === -1) return STATUSES;
  return STATUSES.slice(i, Math.min(i + 2, STATUSES.length));
}

/**
 * Porcentaje de tareas DONE sobre el total del proyecto.
 * @param {TasksResponse['summary']} summary
 * @returns {number} 0–100
 */
function calcProgress(summary: TasksResponse['summary']) {
  if (!summary?.total) return 0;
  const done = summary.byStatus?.DONE || 0;
  return Math.round((done / summary.total) * 100);
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'kpi-status-pending',
    IN_PROGRESS: 'kpi-status-in_progress',
    IN_REVIEW: 'kpi-status-in_review',
    DONE: 'kpi-status-done'
  };
  return `status-badge ${map[status] ?? ''}`;
}

/** Clave sessionStorage para recordar proyecto seleccionado */
const SELECTED_PROJECT_KEY = 'innovatech_selected_project';
type TaskComment = { id: string; userId?: string; content: string };
/** Adjunto URL en panel de colaboración */
type TaskAttachment = { id: string; documentName: string; documentUrl: string };

/** Props de fila expandible con comentarios y adjuntos */
type TaskRowProps = {
  task: Task;
  projectId: string;
  onStatusChange: (taskId: string, status: string) => void;
  onRefresh: () => void;
};

/**
 * Fila de tabla de tarea con selector de estado y panel de colaboración.
 * @param {TaskRowProps} props
 */
function TaskRow({ task, projectId, onStatusChange, onRefresh }: TaskRowProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  /** Carga comentarios y adjuntos desde el BFF */
  async function loadDetails() {
    const [c, a] = await Promise.all([
      fetchTaskComments(projectId, task.id),
      fetchTaskAttachments(projectId, task.id)
    ]);
    setComments((c as { comments?: TaskComment[] })?.comments ?? []);
    setAttachments((a as { attachments?: TaskAttachment[] })?.attachments ?? []);
  }

  /** Expande/colapsa panel y precarga detalles la primera vez */
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
        <td>
          <span className={statusBadgeClass(task.status)}>{statusLabel(task.status)}</span>
        </td>
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
          <button type="button" className="button-secondary" onClick={toggleOpen}>
            {open ? 'Ocultar' : 'Colaboración'}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="collab-panel">
            <h4>Comentarios</h4>
            <ul className="collab-list">
              {comments.map((c) => (
                <li key={c.id}>
                  <small>{c.userId}</small>: {c.content}
                </li>
              ))}
            </ul>
            <form className="collab-form" onSubmit={submitComment}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nuevo comentario"
              />
              <button type="submit" className="button-primary">
                Comentar
              </button>
            </form>
            <h4>Documentación adjunta</h4>
            <ul className="collab-list">
              {attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.documentUrl} target="_blank" rel="noreferrer">
                    {a.documentName}
                  </a>
                </li>
              ))}
            </ul>
            <form className="collab-form" onSubmit={submitAttachment}>
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Nombre documento"
              />
              <input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="URL del documento"
              />
              <button type="submit" className="button-secondary">
                Adjuntar
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

/** Página principal autenticada con gestión de proyectos y tareas */
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

  /**
   * Carga tareas de un proyecto y persiste selección en sessionStorage.
   * @param {string} projectId
   */
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

  /**
   * Lista proyectos del BFF; redirige a login si 401.
   * @param {{ background?: boolean }} [options] - Si true, no muestra spinner global
   */
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

  /** KPIs y notificaciones (solo directivo/gestor); errores se ignoran silenciosamente */
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
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand-subtitle">Panel de control</p>
          <h1>Dashboard InnovaTech</h1>
        </div>
        <button type="button" className="button-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <main className="app-main">
        {sessionUser && (
          <div className="session-bar">
            <span>
              Sesión: <span className="session-bar__email">{sessionUser.email}</span>
            </span>
            <span className={`role-pill role-pill--${role}`}>{sessionUser.role}</span>
          </div>
        )}

        {role && roleHint[role] && <p className="role-banner">{roleHint[role]}</p>}

        {error && <div className="error-banner">{error}</div>}

        {canSeeAnalytics && kpis && (
          <section className="panel panel--accent">
            <h2>KPIs y analítica</h2>
            <div className="kpi-inline">
              <div className="kpi-inline__stat">
                Avance global
                <strong>{kpis.projectProgressPct}%</strong>
              </div>
              <div className="kpi-inline__stat">
                Tareas completadas
                <strong>
                  {kpis.completedTasks}/{kpis.totalTasks}
                </strong>
              </div>
              <div className="kpi-inline__stat">
                Utilización recursos
                <strong>{kpis.resourceUtilization?.utilizationPct}%</strong>
              </div>
            </div>
            <div className="project-actions">
              <button type="button" className="button-primary" onClick={() => downloadReport('csv')}>
                Exportar reporte CSV (Excel)
              </button>
              <button type="button" className="button-secondary" onClick={() => downloadReport('json')}>
                Exportar métricas JSON
              </button>
            </div>
          </section>
        )}

        {notifications.length > 0 && (
          <section className="panel panel--warn">
            <h3>Notificaciones ({notifications.length})</h3>
            <ul className="notify-list">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="notify-item">
                  <strong>{n.title}</strong>: {n.message}
                </li>
              ))}
            </ul>
          </section>
        )}

        {loading && <p className="loading-indicator">Cargando proyectos…</p>}

        <section className="panel">
          <div className="section-title">
            <h2>Proyectos ({projects.length})</h2>
          </div>

          {canCreateProject && (
            <form className="inline-form" onSubmit={handleCreateProject}>
              <h3>Nuevo proyecto</h3>
              <input
                placeholder="Nombre (mínimo 3 caracteres)"
                value={newProject.name}
                onChange={(e) => setNewProject((s) => ({ ...s, name: e.target.value }))}
                required
                minLength={3}
              />
              <textarea
                placeholder="Descripción (mínimo 10 caracteres)"
                value={newProject.description}
                onChange={(e) => setNewProject((s) => ({ ...s, description: e.target.value }))}
                required
                minLength={10}
                rows={2}
              />
              <div className="inline-form__row">
                <label>
                  Inicio
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject((s) => ({ ...s, startDate: e.target.value }))}
                  />
                </label>
                <label>
                  Término
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject((s) => ({ ...s, endDate: e.target.value }))}
                  />
                </label>
                <button type="submit" className="button-primary">
                  Crear
                </button>
              </div>
            </form>
          )}

          <ul className="project-list">
            {projects.map((p) => (
              <li
                key={p.id}
                className={`project-card${selectedProject === p.id ? ' project-card--active' : ''}`}
              >
                <div className="project-card__actions">
                  <button type="button" className="button-primary" onClick={() => loadTasks(p.id)}>
                    Ver tareas
                  </button>
                  {canCreateProject && (
                    <button type="button" className="button-danger" onClick={() => handleDeleteProject(p.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
                <h3 className="project-card__title">{p.name}</h3>
                <p className="project-card__meta">{p.description}</p>
                {(p.startDate || p.endDate) && (
                  <p className="project-card__meta">
                    {p.startDate || '—'} → {p.endDate || '—'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {selectedProject && (
          <section className="panel panel--tasks">
            <div className="panel__header">
              <h2>Tareas — {selectedProjectDetails?.name || selectedProject}</h2>
            </div>

            {tasksLoading && <p className="loading-indicator">Cargando tareas…</p>}

            {tasksData?.summary && (
              <div className="kpi-progress-block">
                <div className="kpi-progress-header">
                  <span>
                    Progreso del proyecto: <strong>{progressPct}%</strong> ({tasksData.summary.total} tareas)
                  </span>
                </div>
                <div className="kpi-progress-track">
                  <div className="kpi-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="project-card__meta" style={{ marginTop: 12 }}>
                  {Object.entries(tasksData.summary.byStatus || {})
                    .map(([k, v]) => `${statusLabel(k)}: ${v}`)
                    .join(' · ')}
                </p>
              </div>
            )}

            {canCreateTask && (
              <form className="inline-form" onSubmit={handleCreateTask}>
                <h3>Nueva tarea</h3>
                <input
                  placeholder="Título"
                  value={newTask.title}
                  onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
                  required
                />
                <input
                  placeholder="Descripción"
                  value={newTask.description}
                  onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
                />
                <button type="submit" className="button-primary">
                  Crear tarea
                </button>
              </form>
            )}

            <div className="data-table-wrap">
              <table className="data-table">
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
            </div>

            {canCreateProject &&
              (tasksData?.tasks ?? []).map((task) => (
                <p key={`del-${task.id}`} className="task-delete-row">
                  <button type="button" className="button-danger" onClick={() => handleDeleteTask(task.id)}>
                    Eliminar tarea: {task.title}
                  </button>
                </p>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
