const { joinUrl } = require('../src/infrastructure/http/httpUpstream');

describe('httpUpstream.joinUrl', () => {
  test('une base y path sin doble barra', () => {
    expect(joinUrl('http://localhost:3002/', '/api/v1/projects')).toBe(
      'http://localhost:3002/api/v1/projects'
    );
  });

  test('añade barra inicial si falta en path', () => {
    expect(joinUrl('http://localhost:3001', 'api/auth/login')).toBe(
      'http://localhost:3001/api/auth/login'
    );
  });
});
