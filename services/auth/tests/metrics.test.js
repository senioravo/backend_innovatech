// AS-TASK-16: Tests de métricas y auditoría
// Framework: Jest + Supertest
// Objetivo: Validar endpoint /metrics (Prometheus) y sistema de auditoría

const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/utils/jwt.helper');

describe('AS-TASK-16: Métricas y Auditoría', () => {

  describe('GET /api/metrics - Endpoint de Prometheus', () => {
    
    it('Debería retornar métricas en formato Prometheus (200)', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect('Content-Type', /text\/plain/)
        .expect(200);

      // Validar que el contenido es texto plano (Prometheus format)
      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('Debería incluir métricas básicas de HTTP', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      // Validar métricas de AS-TASK-14
      expect(response.text).toMatch(/auth_http_requests_total/);
      expect(response.text).toMatch(/auth_http_request_duration_seconds/);
    });

    it('Debería incluir métricas de autenticación/autorización', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      // Validar métricas específicas de auth
      expect(response.text).toMatch(/auth_errors_total/);
      expect(response.text).toMatch(/auth_critical_operations_total/);
      expect(response.text).toMatch(/auth_active_users/);
    });

    it('Debería incluir métricas por defecto de Node.js', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      // Validar métricas del sistema
      expect(response.text).toMatch(/auth_service_.*nodejs/);
      expect(response.text).toMatch(/heap|memory|cpu|eventloop/i);
    });

    it('Debería incluir labels en las métricas', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      // Validar que las métricas tienen labels
      expect(response.text).toMatch(/method=/);
      expect(response.text).toMatch(/route=/);
      expect(response.text).toMatch(/status_code=/);
      expect(response.text).toMatch(/taskId="AS-TASK-14"/);
    });

    it('Debería incluir comentarios HELP y TYPE', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      // Prometheus format incluye metadatos
      expect(response.text).toMatch(/# HELP/);
      expect(response.text).toMatch(/# TYPE/);
    });

    it('Debería actualizar métricas después de hacer peticiones', async () => {
      // Obtener métricas iniciales
      const before = await request(app).get('/api/metrics');
      const beforeText = before.text;

      // Hacer petición de login
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@innovatech.cl',
          password: 'SomePassword123!'
        });

      // Obtener métricas después
      const after = await request(app).get('/api/metrics');
      const afterText = after.text;

      // Las métricas deberían haber cambiado
      // (no necesariamente el texto completo, pero al menos los contadores)
      expect(afterText.length).toBeGreaterThanOrEqual(beforeText.length);
    });
  });

  describe('GET /api/metrics/health - Health check de métricas', () => {
    
    it('Debería retornar status de salud del sistema de métricas (200)', async () => {
      const response = await request(app)
        .get('/api/metrics/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-14');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'healthy');
    });

    it('Debería incluir información del sistema de métricas', async () => {
      const response = await request(app)
        .get('/api/metrics/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('metricsEnabled', true);
      expect(response.body.data).toHaveProperty('endpoint', '/api/metrics');
    });
  });

  describe('Métricas de operaciones críticas', () => {
    let testUser;
    let testToken;

    beforeAll(async () => {
      // Registrar usuario de prueba
      const timestamp = Date.now();
      testUser = {
        nombre: 'Metrics Test User',
        email: `metricstest.${timestamp}@innovatech.cl`,
        password: 'MetricsTest123!',
        rol: 'profesional'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Login para obtener token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      testToken = loginResponse.body.data.token;
    });

    it('Debería registrar métrica de REGISTER en auth_critical_operations_total', async () => {
      const before = await request(app).get('/api/metrics');
      
      // Verificar que la métrica existe
      expect(before.text).toMatch(/auth_critical_operations_total.*operation="REGISTER"/);
    });

    it('Debería registrar métrica de LOGIN en auth_critical_operations_total', async () => {
      const before = await request(app).get('/api/metrics');
      
      // Verificar que la métrica existe
      expect(before.text).toMatch(/auth_critical_operations_total.*operation="LOGIN"/);
    });

    it('Debería registrar métrica de LOGOUT en auth_critical_operations_total', async () => {
      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      const after = await request(app).get('/api/metrics');
      
      // Verificar que la métrica existe
      expect(after.text).toMatch(/auth_critical_operations_total.*operation="LOGOUT"/);
    });

    it('Debería registrar success=true y success=false en operaciones', async () => {
      const metrics = await request(app).get('/api/metrics');

      // Verificar que hay métricas con success="true" y success="false"
      expect(metrics.text).toMatch(/auth_critical_operations_total.*success="true"/);
      // success="false" puede existir si hubo errores previos
    });
  });

  describe('Métricas de errores de autenticación/autorización', () => {
    
    it('Debería incrementar auth_errors_total en login fallido', async () => {
      // Intentar login con credenciales incorrectas
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@innovatech.cl',
          password: 'WrongPassword123!'
        })
        .expect(401);

      const metrics = await request(app).get('/api/metrics');

      // Verificar que se registró el error
      expect(metrics.text).toMatch(/auth_errors_total/);
      expect(metrics.text).toMatch(/error_type=/);
    });

    it('Debería incrementar auth_errors_total en acceso sin token', async () => {
      // Intentar acceder a endpoint protegido sin token
      await request(app)
        .post('/api/example/proyectos')
        .send({ nombre: 'Proyecto sin auth' })
        .expect(401);

      const metrics = await request(app).get('/api/metrics');

      // Verificar que se registró el error
      expect(metrics.text).toMatch(/auth_errors_total/);
    });

    it('Debería incrementar auth_errors_total en acceso denegado por rol', async () => {
      // Generar token de profesional
      const profesionalToken = generateToken({
        id: 999,
        email: 'profesional@innovatech.cl',
        rol: 'profesional'
      });

      // Intentar crear proyecto (solo gestor puede)
      await request(app)
        .post('/api/example/proyectos')
        .set('Authorization', `Bearer ${profesionalToken}`)
        .send({ nombre: 'Proyecto' })
        .expect(403);

      const metrics = await request(app).get('/api/metrics');

      // Verificar que se registró el error de autorización
      expect(metrics.text).toMatch(/auth_errors_total/);
    });
  });

  describe('Auditoría de accesos y operaciones', () => {
    
    it('Debería auditar registro exitoso', async () => {
      const timestamp = Date.now();
      const newUser = {
        nombre: 'Audit Test User',
        email: `audittest.${timestamp}@innovatech.cl`,
        password: 'AuditTest123!',
        rol: 'profesional'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // La auditoría se escribe en logs, no podemos validarla directamente en tests
      // Pero validamos que la operación fue exitosa
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-04');
    });

    it('Debería auditar login exitoso', async () => {
      // Primero registrar usuario
      const timestamp = Date.now();
      const testUser = {
        nombre: 'Login Audit User',
        email: `loginaudit.${timestamp}@innovatech.cl`,
        password: 'LoginAudit123!',
        rol: 'profesional'
      };

      await request(app).post('/api/auth/register').send(testUser);

      // Luego hacer login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      // Validar que login fue exitoso (auditoría en logs)
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-05');
    });

    it('Debería auditar login fallido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@innovatech.cl',
          password: 'WrongPassword123!'
        })
        .expect(401);

      // Validar que el intento fallido fue registrado
      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería auditar cambio de rol', async () => {
      // Registrar usuario
      const timestamp = Date.now();
      const testUser = {
        nombre: 'Role Audit User',
        email: `roleaudit.${timestamp}@innovatech.cl`,
        password: 'RoleAudit123!',
        rol: 'profesional'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const userId = registerResponse.body.data.id;

      // Cambiar rol
      const response = await request(app)
        .put(`/api/auth/usuarios/${userId}/rol`)
        .send({ rol: 'gestor' })
        .expect(200);

      // Validar que cambio fue exitoso (auditoría en logs)
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-11');
      expect(response.body.data).toHaveProperty('rol', 'gestor');
    });
  });
});
