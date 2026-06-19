import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProjects, loginUser, registerUser } from './api';

describe('services/api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('loginUser envía POST a /auth/login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 't', user: { email: 'a@a.cl' } })
    });

    const result = await loginUser({ email: 'a@a.cl', password: '123' });

    expect(result.token).toBe('t');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8010/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.cl', password: '123' })
      })
    );
  });

  it('registerUser envía POST a /auth/register', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await registerUser({ email: 'n@n.cl', password: '123' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8010/api/v1/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('getProjects envía Authorization header', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'P1' }])
    });

    const result = await getProjects('jwt-token');

    expect(result).toEqual([{ id: '1', name: 'P1' }]);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8010/api/v1/projects',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' })
      })
    );
  });

  it('devuelve error cuando la respuesta no es ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'No autorizado' })
    });

    const result = await loginUser({ email: 'x@x.cl', password: 'bad' });

    expect(result.error).toBe(true);
    expect(result.message).toBe('No autorizado');
  });

  it('maneja respuesta JSON inválida', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('parse fail'))
    });

    const result = await loginUser({ email: 'x@x.cl', password: 'bad' });

    expect(result.error).toBe(true);
    expect(result.message).toBe('Error en la solicitud.');
  });
});
