import request from 'supertest';
import app from '../src/app.js';

describe('Auth - Integración HTTP (Supertest)', () => {
  describe('GET /.well-known/jwks.json', () => {
    it('responde 200 con claves JWKS', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('keys');
      expect(Array.isArray(response.body.keys)).toBe(true);
      expect(response.body.keys[0]).toMatchObject({
        alg: 'RS256',
        use: 'sig',
        kid: 'innovatech-auth-key-1'
      });
    });
  });

  describe('GET /api/auth/roles', () => {
    it('lista roles disponibles', async () => {
      const response = await request(app).get('/api/auth/roles');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/auth/register', () => {
    it('rechaza body vacío con 400', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rechaza credenciales inexistentes con 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@innovatech.cl', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
