import { jest } from '@jest/globals';
import { upstreamJson } from '../src/infrastructure/http/httpUpstream.js';
import { UpstreamError } from '../src/utils/errorHandler.js';

describe('httpUpstream.upstreamJson', () => {
  afterEach(() => {
    global.fetch.mockRestore?.();
  });

  test('devuelve JSON en respuesta 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ ok: true })
    });

    const result = await upstreamJson('http://example.com/api');
    expect(result.data).toEqual({ ok: true });
    expect(result.status).toBe(200);
  });

  test('lanza UpstreamError en respuesta 4xx', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ error: 'Unauthorized' })
    });

    await expect(upstreamJson('http://example.com/api')).rejects.toBeInstanceOf(UpstreamError);
  });

  test('parsea cuerpo texto plano', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      text: async () => 'ok'
    });

    const result = await upstreamJson('http://example.com/api');
    expect(result.data).toBe('ok');
  });

  test('maneja respuesta 204 sin cuerpo', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => '' },
      text: async () => ''
    });

    const result = await upstreamJson('http://example.com/api');
    expect(result.data).toBeUndefined();
  });
});
