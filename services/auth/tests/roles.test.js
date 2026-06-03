// AS-TASK-16: Tests de roles y autorización
// Framework: Jest + Supertest
// Objetivo: Validar asignación de roles y acceso a endpoints protegidos

const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/utils/jwt.helper');

describe('AS-TASK-16: Roles y Autorización', () => {

  // Usuarios mock con diferentes roles
  const gestorUser = {
    id: 1,
    email: 'gestor@innovatech.cl',
    rol: 'gestor'
  };

  const profesionalUser = {
    id: 2,
    email: 'profesional@innovatech.cl',
    rol: 'profesional'
  };

  const directivoUser = {
    id: 3,
    email: 'directivo@innovatech.cl',
    rol: 'directivo'
  };

  // Generar tokens para cada rol
  const gestorToken = generateToken(gestorUser);
  const profesionalToken = generateToken(profesionalUser);
  const directivoToken = generateToken(directivoUser);

  describe('GET /api/auth/roles - Listar roles disponibles', () => {
    
    it('Debería retornar lista de roles sin autenticación (200)', async () => {
      const response = await request(app)
        .get('/api/auth/roles')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-08');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.data.roles.length).toBeGreaterThan(0);
    });

    it('Debería incluir permisos por rol', async () => {
      const response = await request(app)
        .get('/api/auth/roles')
        .expect(200);

      const roles = response.body.data.roles;
      
      // Validar estructura de cada rol
      roles.forEach(rol => {
        expect(rol).toHaveProperty('name');
        expect(rol).toHaveProperty('description');
        expect(rol).toHaveProperty('permissions');
        expect(typeof rol.permissions).toBe('object');
      });
    });
  });

  describe('GET /api/auth/roles/simple - Listar nombres de roles', () => {
    
    it('Debería retornar array simple de nombres de roles (200)', async () => {
      const response = await request(app)
        .get('/api/auth/roles/simple')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-10');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data.roles)).toBe(true);

      // Validar que contiene roles esperados
      const roleNames = response.body.data.roles;
      expect(roleNames).toContain('gestor');
      expect(roleNames).toContain('profesional');
      expect(roleNames).toContain('directivo');
    });
  });

  describe('PUT /api/auth/usuarios/:id/rol - Asignar rol a usuario', () => {
    let testUserId;

    beforeAll(async () => {
      // Registrar usuario de prueba para asignarle roles
      const timestamp = Date.now();
      const newUser = {
        nombre: 'Role Test User',
        email: `roletest.${timestamp}@innovatech.cl`,
        password: 'RoleTest123!',
        rol: 'profesional'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      testUserId = registerResponse.body.data.id;
    });

    it('Debería cambiar rol de usuario exitosamente (200)', async () => {
      const response = await request(app)
        .put(`/api/auth/usuarios/${testUserId}/rol`)
        .send({ rol: 'gestor' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('taskId', 'AS-TASK-11');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('rol', 'gestor');
    });

    it('Debería rechazar rol inválido (400)', async () => {
      const response = await request(app)
        .put(`/api/auth/usuarios/${testUserId}/rol`)
        .send({ rol: 'rol-inexistente' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar ID de usuario inexistente (404)', async () => {
      const response = await request(app)
        .put('/api/auth/usuarios/99999999/rol')
        .send({ rol: 'gestor' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('Debería rechazar petición sin campo rol (400)', async () => {
      const response = await request(app)
        .put(`/api/auth/usuarios/${testUserId}/rol`)
        .send({}) // Sin campo rol
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Endpoints protegidos - Autorización por rol', () => {

    describe('Endpoints de Gestor (solo gestor puede acceder)', () => {
      
      it('Gestor PUEDE crear proyectos (200)', async () => {
        const response = await request(app)
          .post('/api/example/proyectos')
          .set('Authorization', `Bearer ${gestorToken}`)
          .send({ nombre: 'Nuevo Proyecto' })
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('taskId', 'AS-TASK-09');
      });

      it('Profesional NO PUEDE crear proyectos (403)', async () => {
        const response = await request(app)
          .post('/api/example/proyectos')
          .set('Authorization', `Bearer ${profesionalToken}`)
          .send({ nombre: 'Nuevo Proyecto' })
          .expect('Content-Type', /json/)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toMatch(/acceso.*denegado|no autorizado/i);
      });

      it('Directivo NO PUEDE crear proyectos (403)', async () => {
        const response = await request(app)
          .post('/api/example/proyectos')
          .set('Authorization', `Bearer ${directivoToken}`)
          .send({ nombre: 'Nuevo Proyecto' })
          .expect('Content-Type', /json/)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('Endpoints de Directivo (solo directivo puede acceder)', () => {
      
      it('Directivo PUEDE ver KPIs (200)', async () => {
        const response = await request(app)
          .get('/api/example/reportes/kpis')
          .set('Authorization', `Bearer ${directivoToken}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('taskId', 'AS-TASK-09');
      });

      it('Gestor NO PUEDE ver KPIs (403)', async () => {
        const response = await request(app)
          .get('/api/example/reportes/kpis')
          .set('Authorization', `Bearer ${gestorToken}`)
          .expect('Content-Type', /json/)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
      });

      it('Profesional NO PUEDE ver KPIs (403)', async () => {
        const response = await request(app)
          .get('/api/example/reportes/kpis')
          .set('Authorization', `Bearer ${profesionalToken}`)
          .expect('Content-Type', /json/)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('Endpoints compartidos (múltiples roles)', () => {
      
      it('Todos los roles PUEDEN ver proyectos (200)', async () => {
        const tokens = [gestorToken, profesionalToken, directivoToken];

        for (const token of tokens) {
          const response = await request(app)
            .get('/api/example/proyectos')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);

          expect(response.body).toHaveProperty('success', true);
        }
      });

      it('Gestor y Profesional PUEDEN actualizar tareas (200)', async () => {
        const tokens = [gestorToken, profesionalToken];

        for (const token of tokens) {
          const response = await request(app)
            .put('/api/example/tareas/123')
            .set('Authorization', `Bearer ${token}`)
            .send({ estado: 'completada' })
            .expect('Content-Type', /json/)
            .expect(200);

          expect(response.body).toHaveProperty('success', true);
        }
      });

      it('Directivo NO PUEDE actualizar tareas (403)', async () => {
        const response = await request(app)
          .put('/api/example/tareas/123')
          .set('Authorization', `Bearer ${directivoToken}`)
          .send({ estado: 'completada' })
          .expect('Content-Type', /json/)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('Endpoints sin autenticación', () => {
      
      it('Debería rechazar acceso sin token (401)', async () => {
        const response = await request(app)
          .post('/api/example/proyectos')
          .send({ nombre: 'Proyecto sin auth' })
          .expect('Content-Type', /json/)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toMatch(/token.*requerido|no autenticado/i);
      });

      it('Debería rechazar token inválido (401)', async () => {
        const response = await request(app)
          .get('/api/example/proyectos')
          .set('Authorization', 'Bearer token-invalido-xyz')
          .expect('Content-Type', /json/)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
      });

      it('Debería rechazar formato de Authorization incorrecto (401)', async () => {
        const response = await request(app)
          .get('/api/example/proyectos')
          .set('Authorization', gestorToken) // Sin "Bearer "
          .expect('Content-Type', /json/)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
      });
    });
  });
});
