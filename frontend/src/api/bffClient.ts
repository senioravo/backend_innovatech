/**
 * Cliente HTTP del frontend hacia el BFF (`VITE_API_BASE_URL` o `/api/v1`).
 * Gestiona sesión en localStorage y expone operaciones de auth, proyectos, tareas y KPIs.
 */
import type { KpisResponse, ProjectsResponse, TasksResponse, UserSession } from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const TOKEN_KEY = 'innovatech_token';
const USER_KEY = 'innovatech_user';

/** @returns {string|null} JWT almacenado o null si no hay sesión */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** @returns {UserSession|null} Usuario parseado desde localStorage */
export function getStoredUser(): UserSession | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Persiste token y usuario en localStorage.
 * @param {string} token - JWT Bearer
 * @param {UserSession|null} user - Datos de sesión del login
 */
export function setSession(token: string, user: UserSession | null) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
}

/** Elimina token y usuario del almacenamiento local */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

/**
 * Petición autenticada con token explícito (p. ej. logout tras clearSession).
 * @template T
 * @param {string} path - Ruta relativa bajo API_BASE
 * @param {string} token - JWT Bearer
 * @param {Omit<RequestOptions, 'auth'>} [options]
 */
async function requestWithToken<T = unknown>(
  path: string,
  token: string,
  { method = 'GET', body }: Omit<RequestOptions, 'auth'> = {}
) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    cache: 'no-store',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data: Record<string, unknown> | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      (data?.message as string) ||
      (Array.isArray(data?.errors) ? (data.errors as string[]).join(', ') : null) ||
      (data?.error as string) ||
      `Error HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

/**
 * Petición JSON genérica al BFF con Bearer opcional.
 * @template T
 * @param {string} path
 * @param {RequestOptions} [options]
 */
async function request<T = unknown>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (!token) {
      throw new Error('No hay sesión. Inicia sesión de nuevo.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    cache: 'no-store',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data: Record<string, unknown> | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      (data?.message as string) ||
      (Array.isArray(data?.errors) ? (data.errors as string[]).join(', ') : null) ||
      (data?.error as string) ||
      `Error HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

/**
 * Login vía POST /auth/login; guarda sesión en localStorage.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string; user?: UserSession }>}
 */
export async function login(email: string, password: string) {
  clearSession();
  const data = await request<{ data?: { token?: string; user?: UserSession } }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  });
  const payload = data?.data;
  const token = payload?.token;
  const user = payload?.user;
  if (!token) {
    throw new Error((data as { message?: string })?.message || 'Respuesta de login inválida');
  }
  setSession(token, user ?? null);
  return { token, user };
}

/** Invalida sesión local y notifica logout al BFF si había token */
export async function logout() {
  const token = getToken();
  clearSession();
  if (!token) return;
  try {
    await requestWithToken('/auth/logout', token, { method: 'POST' });
  } catch {
    // Sesión local ya limpiada
  }
}

/** @returns {Promise<ProjectsResponse>} Proyectos del usuario autenticado */
export function fetchProjects() {
  return request<ProjectsResponse>('/proyectos');
}

/**
 * @param {string} projectId
 * @returns {Promise<TasksResponse>}
 */
export function fetchTasks(projectId: string) {
  return request<TasksResponse>(`/proyectos/${encodeURIComponent(projectId)}/tareas`);
}

/**
 * Crea proyecto (solo gestor en backend).
 * @param {{ name: string; description: string; startDate?: string; endDate?: string }} payload
 */
export function createProject(payload: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
}) {
  return request('/projects', {
    method: 'POST',
    body: {
      name: payload.name,
      description: payload.description,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined
    }
  });
}

/**
 * @param {string} projectId
 * @param {{ title: string; description?: string; startDate?: string; endDate?: string }} payload
 */
export function createTask(
  projectId: string,
  payload: { title: string; description?: string; startDate?: string; endDate?: string }
) {
  return request(`/projects/${encodeURIComponent(projectId)}/tasks`, {
    method: 'POST',
    body: {
      title: payload.title,
      description: payload.description || undefined,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined
    }
  });
}

/**
 * Avanza estado Kanban de una tarea (un paso a la vez).
 * @param {string} projectId
 * @param {string} taskId
 * @param {string} status - PENDING | IN_PROGRESS | IN_REVIEW | DONE
 */
export function patchTaskStatus(projectId: string, taskId: string, status: string) {
  return request(
    `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/status`,
    { method: 'PATCH', body: { status } }
  );
}

/** @param {string} projectId */
export function deleteProject(projectId: string) {
  return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
}

/** @param {string} taskId */
export function deleteTask(taskId: string) {
  return request(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}

/** @returns {Promise<KpisResponse>} KPIs para directivo/gestor */
export function fetchKpis() {
  return request<KpisResponse>('/consultations/kpis');
}

/**
 * URL de descarga de reporte (sin fetch; usar downloadReport para blob).
 * @param {string} [format='csv']
 */
export function exportReport(format = 'csv') {
  return `${API_BASE}/consultations/reports/export?format=${format}`;
}

/**
 * Descarga reporte CSV o JSON como archivo en el navegador.
 * @param {string} [format='csv']
 */
export async function downloadReport(format = 'csv') {
  const token = getToken();
  const res = await fetch(`${API_BASE}/consultations/reports/export?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Error al exportar (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-innovatech.${format === 'json' ? 'json' : 'csv'}`;
  a.click();
  URL.revokeObjectURL(url);
}

/** @returns {Promise<{ notifications?: Array<{ id: string; title: string; message: string }> }>} */
export function fetchNotifications() {
  return request<{ notifications?: Array<{ id: string; title: string; message: string }> }>(
    '/notifications'
  );
}

/** @param {string} projectId @param {string} taskId */
export function fetchTaskComments(projectId: string, taskId: string) {
  return request(`/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/comments`);
}

/** @param {string} projectId @param {string} taskId @param {string} content */
export function addTaskComment(projectId: string, taskId: string, content: string) {
  return request(
    `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/comments`,
    { method: 'POST', body: { content } }
  );
}

/**
 * @param {string} projectId
 * @param {string} taskId
 * @param {string} documentName
 * @param {string} documentUrl
 */
export function addTaskAttachment(
  projectId: string,
  taskId: string,
  documentName: string,
  documentUrl: string
) {
  return request(
    `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/attachments`,
    { method: 'POST', body: { documentName, documentUrl } }
  );
}

/** @param {string} projectId @param {string} taskId */
export function fetchTaskAttachments(projectId: string, taskId: string) {
  return request(
    `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/attachments`
  );
}
