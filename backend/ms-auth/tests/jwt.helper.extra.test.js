const jwtHelper = require('../src/utils/jwt.helper');

describe('jwt.helper - utilidades', () => {
  test('validateEmail valida formato', () => {
    expect(jwtHelper.validateEmail('user@innovatech.cl')).toBe(true);
    expect(jwtHelper.validateEmail('invalido')).toBe(false);
  });

  test('validatePassword detecta reglas mínimas', () => {
    expect(jwtHelper.validatePassword('abc123').valid).toBe(true);
    expect(jwtHelper.validatePassword('123').valid).toBe(false);
    expect(jwtHelper.validatePassword('abcdef').valid).toBe(false);
  });

  test('getConfig expone algoritmo RS256', () => {
    const config = jwtHelper.getConfig();
    expect(config.algorithm).toBe('RS256');
    expect(config.expirationSeconds).toBeGreaterThan(0);
  });

  test('generateToken rechaza payload incompleto', () => {
    expect(() => jwtHelper.generateToken({ id: 1 })).toThrow();
  });

  test('verifyToken rechaza token vacío', () => {
    expect(() => jwtHelper.verifyToken('')).toThrow('Error al verificar token');
  });

  test('decodeToken devuelve estructura del token', () => {
    const token = jwtHelper.generateToken({ id: 1, email: 'a@b.cl', rol: 'gestor' });
    const decoded = jwtHelper.decodeToken(token);
    expect(decoded).toHaveProperty('payload');
  });
});
