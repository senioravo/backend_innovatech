import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchKpisDashboard } from './bffClient';

describe('bffClient KPI', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('fetchKpisDashboard llama al endpoint del BFF con token', async () => {
    localStorage.setItem('innovatech_token', 'jwt-test');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          resumen: { totalProyectos: 1, totalTareas: 2, tasaCompletadas: 0.5, porEstado: {} },
          proyectos: [],
          tareasRecientes: []
        })
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await fetchKpisDashboard();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/kpis/dashboard',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-test'
        })
      })
    );
    expect(data.resumen.totalProyectos).toBe(1);
  });

  it('fetchKpisDashboard propaga errores HTTP', async () => {
    localStorage.setItem('innovatech_token', 'jwt-test');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ error: 'Forbidden' })
      })
    );

    await expect(fetchKpisDashboard()).rejects.toMatchObject({
      message: 'Forbidden',
      status: 403
    });
  });
});
