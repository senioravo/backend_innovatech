// AS-TASK-16: Tests de autenticación (login y registro)
// Framework: Jest + Supertest
// Objetivo: Validar endpoints POST /api/auth/register y POST /api/auth/login

const request = require('supertest');
const app = require('../src/app');

describe('AS-TASK-16: Autenticación - Register y Login', () => {
  // Variable para almacenar email único por test run
  const timestamp = Date.now();
  const testUser = {
    nombre: 'Test User',
    email: `test.${timestamp}@innovatech.cl`,
    password: 'TestPass123!',
    rol: 'developer'
  };

  describe('POST /api/auth/register - Registro de usuarios', () => {
    
    it('Debería registrar un usuario exitosamente (201)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      // Validar estructura de respuesta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-04');
      expect(response.body).toHaveProperty('data');

      // Validar datos del usuario registrado
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nombre', testUser.nombre);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('rol', testUser.rol);
      expect(response.body.data).not.toHaveProperty('password'); // No debe retornar password
    });

    it('Debería rechazar registro con email duplicado (400)', async () => {
      // Intentar registrar el mismo usuario otra vez
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/email.*registrado|duplicado/i);
    });

    it('Debería rechazar registro sin nombre (400)', async () => {
      const invalidUser = { ...testUser, nombre: '' };
      delete invalidUser.nombre;

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar registro con email inválido (400)', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar registro con contraseña débil (400)', async () => {
      const invalidUser = {
        nombre: 'Weak Password User',
        email: `weak.${Date.now()}@innovatech.cl`,
        password: '123', // Contraseña muy corta
        rol: 'developer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login - Inicio de sesión', () => {
    
    it('Debería hacer login exitosamente con credenciales válidas (200)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      // Validar estructura de respuesta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-05');
      expect(response.body).toHaveProperty('data');

      // Validar token JWT
      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(0);

      // Validar datos del usuario
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data.usuario).toHaveProperty('id');
      expect(response.body.data.usuario).toHaveProperty('email', testUser.email);
      expect(response.body.data.usuario).toHaveProperty('rol', testUser.rol);
      expect(response.body.data.usuario).not.toHaveProperty('password'); // No debe retornar password
    });

    it('Debería rechazar login con credenciales inválidas (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/credenciales.*inv[aá]lidas|incorrectas/i);
    });

    it('Debería rechazar login con email inexistente (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@innovatech.cl',
          password: 'SomePassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar login sin email o password (400)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // password faltante
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/logout - Cerrar sesión', () => {
    let validToken;

    beforeAll(async () => {
      // Obtener token válido para tests de logout
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      validToken = loginResponse.body.data.token;
    });

    it('Debería hacer logout exitosamente con token válido (200)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-07');
    });

    it('Debería rechazar logout sin token (401)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar logout con token inválido (401)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token-xyz')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
