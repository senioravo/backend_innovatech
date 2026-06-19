import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getToken,
  getStoredUser,
  setSession,
  clearSession,
  login,
  logout,
  fetchProjects,
  fetchTasks,
  exportReport,
  downloadReport,
  fetchNotifications,
  fetchTaskComments,
  addTaskComment,
  fetchTaskAttachments,
  addTaskAttachment
} from './bffClient';

describe('bffClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores and retrieves user session', () => {
    setSession('token-123', { id: 1, email: 'a@test.cl', role: 'gestor' });
    expect(getStoredUser()?.email).toBe('a@test.cl');
    expect(getToken()).toBe('token-123');
  });

  it('clears session', () => {
    setSession('token-123', { id: 1, email: 'a@test.cl', role: 'gestor' });
    clearSession();
    expect(getStoredUser()).toBeNull();
  });

  it('login stores token from API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: { token: 'jwt', user: { id: 1, email: 'a@test.cl', role: 'gestor' } }
          })
      })
    );
    const result = await login('a@test.cl', 'secret');
    expect(result.token).toBe('jwt');
    expect(getToken()).toBe('jwt');
  });

  it('logout clears session even if API fails', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await logout();
    expect(getToken()).toBeNull();
  });

  it('fetchProjects sends Authorization header', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ user: {}, projects: [] })
    });
    vi.stubGlobal('fetch', fetchMock);
    await fetchProjects();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/proyectos'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
      })
    );
  });

  it('fetchTasks encodes project id', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ projectId: 'p1', tasks: [] })
    });
    vi.stubGlobal('fetch', fetchMock);
    await fetchTasks('p1');
    expect(fetchMock.mock.calls[0][0]).toContain('/proyectos/p1/tareas');
  });

  it('throws when no session for authenticated request', async () => {
    await expect(fetchProjects()).rejects.toThrow(/sesión/i);
  });

  it('propagates backend error message', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Bad request' })
      })
    );
    await expect(fetchProjects()).rejects.toThrow('Bad request');
  });

  it('propagates errors array from backend', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({ errors: ['Email inválido', 'Rol inválido'] })
      })
    );
    await expect(fetchProjects()).rejects.toThrow('Email inválido, Rol inválido');
  });

  it('handles non-json error bodies', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })
    );
    await expect(fetchProjects()).rejects.toThrow('Error HTTP 500');
  });

  it('exportReport builds download URL', () => {
    expect(exportReport('json')).toContain('format=json');
    expect(exportReport()).toContain('format=csv');
  });

  it('downloadReport triggers browser download', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    const click = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['csv-data'], { type: 'text/csv' })
      })
    );
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() });
    vi.spyOn(document, 'createElement').mockReturnValue({ click, href: '', download: '' } as HTMLAnchorElement);

    await downloadReport('csv');
    expect(click).toHaveBeenCalled();
  });

  it('downloadReport throws on failed export', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(downloadReport('csv')).rejects.toThrow('Error al exportar (403)');
  });

  it('covers collaboration and notification endpoints', async () => {
    setSession('jwt', { email: 'a@test.cl' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ notifications: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ comments: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ attachments: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ id: 'c1' }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ id: 'a1' }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchNotifications();
    await fetchTaskComments('p1', 't1');
    await fetchTaskAttachments('p1', 't1');
    await addTaskComment('p1', 't1', 'hello');
    await addTaskAttachment('p1', 't1', 'doc.pdf', 'https://example.com/doc.pdf');

    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
