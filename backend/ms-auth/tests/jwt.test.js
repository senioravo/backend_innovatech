// Test básico de JWT
import jwtHelper from '../src/utils/jwt.helper.js';

describe('JWT - Generación y verificación de tokens', () => {
  
  it('Debería generar un token JWT', () => {
    const payload = { id: 1, email: 'test@innovatech.cl', rol: 'gestor' };
    const token = jwtHelper.generateToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('Debería verificar un token válido', () => {
    const payload = { id: 1, email: 'test@innovatech.cl', rol: 'gestor' };
    const token = jwtHelper.generateToken(payload);
    
    const decoded = jwtHelper.verifyToken(token);
    
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('test@innovatech.cl');
  });

  it('Debería rechazar un token inválido', () => {
    const tokenInvalido = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    
    expect(() => {
      jwtHelper.verifyToken(tokenInvalido);
    }).toThrow();
  });

});
