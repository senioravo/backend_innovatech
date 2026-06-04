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

/** POST /login → Auth vía BFF */
export async function login(email, password) {
  const data = await request('/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  });
  if (!data?.data?.token) {
    throw new Error(data?.message || 'Respuesta de login inválida');
  }
  setSession(data.data.token, data.data.usuario);
  return data.data;
}

/** POST /logout */
export async function logout() {
  try {
    await request('/logout', { method: 'POST' });
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
      description: payload.description || undefined
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
