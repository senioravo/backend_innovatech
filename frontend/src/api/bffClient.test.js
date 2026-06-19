import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addTaskComment,
  clearSession,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  exportReport,
  fetchKpis,
  fetchNotifications,
  fetchProyectos,
  fetchTaskAttachments,
  fetchTaskComments,
  fetchTareas,
  getStoredUser,
  getToken,
  login,
  logout,
  patchTaskStatus,
  setSession
} from './bffClient';

function mockFetchResponse(body, { ok = true, status = ok ? 200 : 400 } = {}) {
  return {
    ok,
    status,
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body))
  };
}

describe('bffClient — sesión', () => {
  beforeEach(() => {
    clearSession();
  });

  it('guarda y lee token y usuario en localStorage', () => {
    setSession('tok-123', { id: '1', email: 'a@test.cl', rol: 'gestor' });
    expect(getToken()).toBe('tok-123');
    expect(getStoredUser()).toEqual({ id: '1', email: 'a@test.cl', rol: 'gestor' });
  });

  it('getStoredUser devuelve null si el JSON es inválido', () => {
    localStorage.setItem('innovatech_user', '{mal json');
    expect(getStoredUser()).toBeNull();
  });

  it('clearSession elimina token y usuario', () => {
    setSession('x', { email: 'x@x.cl' });
    clearSession();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});

describe('bffClient — login y logout', () => {
  beforeEach(() => {
    clearSession();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('login guarda sesión con respuesta válida del BFF', async () => {
    fetch.mockResolvedValueOnce(
      mockFetchResponse({
        data: { token: 'jwt-abc', usuario: { email: 'g@test.cl', rol: 'gestor' } }
      })
    );

    const result = await login('g@test.cl', 'Secret123');

    expect(result.token).toBe('jwt-abc');
    expect(getToken()).toBe('jwt-abc');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'g@test.cl', password: 'Secret123' })
      })
    );
  });

  it('login lanza error si no hay token en la respuesta', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({ message: 'Credenciales inválidas' }));

    await expect(login('bad@test.cl', 'x')).rejects.toThrow('Credenciales inválidas');
    expect(getToken()).toBeNull();
  });

  it('logout limpia sesión aunque falle el API', async () => {
    setSession('tok', { email: 'a@a.cl' });
    fetch.mockRejectedValueOnce(new Error('red caída'));

    await logout();

    expect(getToken()).toBeNull();
  });

  it('logout sin token solo limpia localStorage', async () => {
    await logout();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('bffClient — request autenticado', () => {
  beforeEach(() => {
    clearSession();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetchProyectos envía Authorization cuando hay sesión', async () => {
    setSession('mi-token', { rol: 'gestor' });
    fetch.mockResolvedValueOnce(
      mockFetchResponse({ proyectos: [], usuario: { rol: 'gestor' } })
    );

    const data = await fetchProyectos();

    expect(data.proyectos).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/proyectos',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mi-token' })
      })
    );
  });

  it('lanza error si no hay sesión para peticiones autenticadas', async () => {
    await expect(fetchProyectos()).rejects.toThrow('No hay sesión');
  });

  it('propaga mensaje de error del backend', async () => {
    setSession('tok', {});
    fetch.mockResolvedValueOnce(
      mockFetchResponse({ message: 'Proyecto no encontrado' }, { ok: false, status: 404 })
    );

    await expect(fetchProyectos()).rejects.toThrow('Proyecto no encontrado');
  });

  it('createProject y createTask envían payload correcto', async () => {
    setSession('tok', {});
    fetch.mockResolvedValueOnce(mockFetchResponse({ id: 'p1' }));
    fetch.mockResolvedValueOnce(mockFetchResponse({ id: 't1' }));

    await createProject({ name: 'Alpha', description: 'Desc', startDate: '2026-01-01' });
    await createTask('p1', { title: 'Tarea 1', description: 'Detalle' });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/api/v1/projects',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Alpha',
          description: 'Desc',
          startDate: '2026-01-01',
          endDate: undefined
        })
      })
    );
  });

  it('patchTaskStatus, deleteProject y deleteTask usan métodos HTTP correctos', async () => {
    setSession('tok', {});
    fetch
      .mockResolvedValueOnce(mockFetchResponse({ ok: true }))
      .mockResolvedValueOnce(mockFetchResponse({ ok: true }))
      .mockResolvedValueOnce(mockFetchResponse({ ok: true }));

    await patchTaskStatus('p1', 't1', 'IN_PROGRESS');
    await deleteProject('p1');
    await deleteTask('t1');

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/api/v1/projects/p1/tasks/t1/status',
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/v1/projects/p1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      '/api/v1/tasks/t1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('fetchKpis, notifications y colaboración llaman rutas esperadas', async () => {
    setSession('tok', {});
    fetch
      .mockResolvedValueOnce(mockFetchResponse({ totalProjects: 2 }))
      .mockResolvedValueOnce(mockFetchResponse({ notifications: [] }))
      .mockResolvedValueOnce(mockFetchResponse({ comments: [] }))
      .mockResolvedValueOnce(mockFetchResponse({ attachments: [] }));

    await fetchKpis();
    await fetchNotifications();
    await fetchTaskComments('p1', 't1');
    await fetchTaskAttachments('p1', 't1');

    expect(fetch).toHaveBeenCalledWith('/api/v1/consultations/kpis', expect.any(Object));
    expect(fetch).toHaveBeenCalledWith('/api/v1/notifications', expect.any(Object));
  });

  it('addTaskComment envía contenido en POST', async () => {
    setSession('tok', {});
    fetch.mockResolvedValueOnce(mockFetchResponse({ id: 'c1' }));

    await addTaskComment('p1', 't1', 'Hola equipo');

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/projects/p1/tasks/t1/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'Hola equipo' })
      })
    );
  });

  it('fetchTareas codifica el id del proyecto en la URL', async () => {
    setSession('tok', {});
    fetch.mockResolvedValueOnce(mockFetchResponse({ tareas: [] }));

    await fetchTareas('proyecto con espacios');

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/proyectos/proyecto%20con%20espacios/tareas',
      expect.any(Object)
    );
  });
});

describe('bffClient — utilidades', () => {
  it('exportReport devuelve URL con formato', () => {
    expect(exportReport('csv')).toContain('/consultations/reports/export?format=csv');
    expect(exportReport('json')).toContain('format=json');
  });
});
