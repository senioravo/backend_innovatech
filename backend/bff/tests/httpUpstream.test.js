import { jest } from '@jest/globals';
import { joinUrl, upstreamJson } from '../src/infrastructure/http/httpUpstream.js';
import { UpstreamError } from '../src/utils/errorHandler.js';

describe('httpUpstream helpers', () => {
  afterEach(() => {
    global.fetch?.mockRestore?.();
  });

  test('joinUrl normaliza slashes', () => {
    expect(joinUrl('http://localhost:3001/', '/api/users')).toBe('http://localhost:3001/api/users');
    expect(joinUrl('http://localhost:3001', 'api/users')).toBe('http://localhost:3001/api/users');
  });

  test('upstreamJson envía POST con JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ created: true })
    });

    const result = await upstreamJson('http://example.com/users', {
      method: 'POST',
      body: { email: 'a@a.cl' }
    });

    expect(result.status).toBe(201);
    expect(result.data).toEqual({ created: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.cl' })
      })
    );
  });

  test('upstreamJson lanza UpstreamError en 502', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ error: 'bad gateway' })
    });

    await expect(upstreamJson('http://example.com/down')).rejects.toBeInstanceOf(UpstreamError);
  });
});
