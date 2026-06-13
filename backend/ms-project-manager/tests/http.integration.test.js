jest.mock('../src/repositories/projectRepository', () => ({
  findByUserId: jest.fn().mockResolvedValue([])
}));

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKeyPath = path.join(__dirname, '../../ms-auth/keys/private.key');
const publicKeyPath = path.join(__dirname, '../keys/public.key');

function signTestToken(payload = {}) {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  return jwt.sign(
    {
      id: 1,
      email: 'gestor@innovatech.cl',
      rol: 'gestor',
      ...payload
    },
    privateKey,
    { algorithm: 'RS256', issuer: 'innovatech-auth', expiresIn: '1h' }
  );
}

let app;

describe('Project Manager - Integración HTTP (Supertest)', () => {
  const request = require('supertest');

  beforeAll(() => {
    jest.resetModules();
    app = require('../src/app');
  });
  describe('GET /health', () => {
    it('responde 200 con estado OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'OK',
        service: 'Project Manager'
      });
      expect(response.body).toHaveProperty('dependencies');
    });
  });

  describe('GET /metrics', () => {
    it('expone métricas Prometheus', async () => {
      const response = await request(app).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.text).toContain('process_cpu');
    });
  });

  describe('Rutas protegidas JWT', () => {
    it('GET /api/v1/projects sin token devuelve 401', async () => {
      const response = await request(app).get('/api/v1/projects');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/v1/projects con token inválido devuelve 401', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
    });

    it('GET /api/v1/projects con JWT RS256 válido no devuelve 401', async () => {
      const token = signTestToken();
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).not.toBe(401);
    });
  });

  describe('Rutas no encontradas', () => {
    it('GET ruta inexistente devuelve 404', async () => {
      const response = await request(app).get('/api/v1/no-existe');

      expect(response.status).toBe(404);
    });
  });
});
