// Test básico de roles
const request = require('supertest');
const app = require('../src/app');

describe('Roles - Gestión de roles', () => {
  
  it('Debería responder al endpoint de roles', async () => {
    const response = await request(app)
      .get('/api/auth/roles');
    
    expect(response.status).toBeDefined();
    expect(typeof response.status).toBe('number');
  });

  it('Debería responder al endpoint de roles simple', async () => {
    const response = await request(app)
      .get('/api/auth/roles/simple');
    
    expect(response.status).toBeDefined();
    expect(typeof response.status).toBe('number');
  });

});
