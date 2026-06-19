const request = require('supertest');
const app = require('../src/app');

describe('BFF - Integración HTTP (Supertest)', () => {
  describe('GET /health', () => {
    it('responde 200 con estado OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'OK',
        service: 'bff'
      });
    });
  });

  describe('Rutas protegidas (headers KrakenD)', () => {
    it('GET /api/v1/projects sin headers devuelve 401', async () => {
      const response = await request(app).get('/api/v1/projects');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('GET /api/v1/proyectos sin headers devuelve 401', async () => {
      const response = await request(app).get('/api/v1/proyectos');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('GET /api/v1/kpis/dashboard sin headers devuelve 401', async () => {
      const response = await request(app).get('/api/v1/kpis/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('GET /api/v1/projects con headers KrakenD no devuelve 401 por auth', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('x-user-id', '1')
        .set('x-user-email', 'gestor@innovatech.cl')
        .set('x-user-role', 'gestor');

      expect(response.status).not.toBe(401);
    });
  });

  describe('Rutas no encontradas', () => {
    it('GET ruta inexistente en raíz devuelve 404', async () => {
      const response = await request(app).get('/ruta-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
