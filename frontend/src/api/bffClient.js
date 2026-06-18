const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const TOKEN_KEY = 'innovatech_token';
const USER_KEY = 'innovatech_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario ?? null));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
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
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** POST /auth/login → Auth vía BFF */
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  });
  const payload = data?.data;
  const token = payload?.token;
  const usuario = payload?.usuario ?? payload?.user;
  if (!token) {
    throw new Error(data?.message || 'Respuesta de login inválida');
  }
  setSession(token, usuario);
  return { token, usuario };
}

/** POST /auth/logout — siempre limpia sesión local aunque falle el API */
export async function logout() {
  const token = getToken();
  try {
    if (token) {
      await request('/auth/logout', { method: 'POST' });
    }
  } catch {
    // Ignorar errores de red o 401; la sesión local se limpia igual
  } finally {
    clearSession();
  }
}

/** GET /proyectos — agregado BFF (PM + Auth) */
export function fetchProyectos() {
  return request('/proyectos');
}

/** GET /proyectos/:id/tareas */
export function fetchTareas(proyectoId) {
  return request(`/proyectos/${encodeURIComponent(proyectoId)}/tareas`);
}

/** POST /projects — crear proyecto (reenvío PM) */
export function createProject(payload) {
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

/** POST /projects/:id/tasks — crear tarea */
export function createTask(proyectoId, payload) {
  return request(`/projects/${encodeURIComponent(proyectoId)}/tasks`, {
    method: 'POST',
    body: {
      title: payload.title,
      description: payload.description || undefined,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined
    }
  });
}

/** PATCH estado tarea */
export function patchTaskStatus(proyectoId, taskId, status) {
  return request(
    `/projects/${encodeURIComponent(proyectoId)}/tasks/${encodeURIComponent(taskId)}/status`,
    { method: 'PATCH', body: { status } }
  );
}

export function deleteProject(projectId) {
  return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
}

export function deleteTask(taskId) {
  return request(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}

export function fetchKpis() {
  return request('/consultations/kpis');
}

export function exportReport(format = 'csv') {
  return `${API_BASE}/consultations/reports/export?format=${format}`;
}

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

export function fetchNotifications() {
  return request('/notifications');
}

export function fetchTaskComments(proyectoId, taskId) {
  return request(
    `/projects/${encodeURIComponent(proyectoId)}/tasks/${encodeURIComponent(taskId)}/comments`
  );
}

export function addTaskComment(proyectoId, taskId, content) {
  return request(
    `/projects/${encodeURIComponent(proyectoId)}/tasks/${encodeURIComponent(taskId)}/comments`,
    { method: 'POST', body: { content } }
  );
}

export function addTaskAttachment(proyectoId, taskId, documentName, documentUrl) {
  return request(
    `/projects/${encodeURIComponent(proyectoId)}/tasks/${encodeURIComponent(taskId)}/attachments`,
    { method: 'POST', body: { documentName, documentUrl } }
  );
}

export function fetchTaskAttachments(proyectoId, taskId) {
  return request(
    `/projects/${encodeURIComponent(proyectoId)}/tasks/${encodeURIComponent(taskId)}/attachments`
  );
}
