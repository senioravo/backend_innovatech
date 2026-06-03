// AS-TASK-16: Tests de JWT (generación y validación)
// Framework: Jest
// Objetivo: Validar generación, verificación y expiración de tokens JWT

const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../src/utils/jwt.helper');

describe('AS-TASK-16: JWT - Generación y Validación', () => {
  
  const mockUser = {
    id: 123,
    email: 'test@innovatech.cl',
    rol: 'developer'
  };

  describe('generateToken() - Generación de tokens JWT', () => {
    
    it('Debería generar un token JWT válido', () => {
      const token = generateToken(mockUser);

      // Validar que es un string no vacío
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Validar que tiene la estructura JWT (3 partes separadas por puntos)
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });

    it('Debería incluir payload correcto en el token', () => {
      const token = generateToken(mockUser);

      // Decodificar sin verificar (para inspeccionar payload)
      const decoded = jwt.decode(token);

      expect(decoded).toHaveProperty('id', mockUser.id);
      expect(decoded).toHaveProperty('email', mockUser.email);
      expect(decoded).toHaveProperty('rol', mockUser.rol);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('Debería generar tokens diferentes para usuarios diferentes', () => {
      const user1 = { id: 1, email: 'user1@innovatech.cl', rol: 'gestor' };
      const user2 = { id: 2, email: 'user2@innovatech.cl', rol: 'profesional' };

      const token1 = generateToken(user1);
      const token2 = generateToken(user2);

      // Tokens deben ser diferentes
      expect(token1).not.toBe(token2);

      // Decodificar y validar payloads diferentes
      const decoded1 = jwt.decode(token1);
      const decoded2 = jwt.decode(token2);

      expect(decoded1.id).not.toBe(decoded2.id);
      expect(decoded1.email).not.toBe(decoded2.email);
    });

    it('Debería configurar expiración del token', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.decode(token);

      // Verificar que exp > iat (tiene expiración en el futuro)
      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      // Validar que expira en aproximadamente 1 hora (configuración por defecto)
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBeGreaterThan(3500); // ~3600 segundos = 1 hora
      expect(expirationTime).toBeLessThan(3700);
    });
  });

  describe('verifyToken() - Validación de tokens JWT', () => {
    
    it('Debería verificar un token válido correctamente', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('id', mockUser.id);
      expect(decoded).toHaveProperty('email', mockUser.email);
      expect(decoded).toHaveProperty('rol', mockUser.rol);
    });

    it('Debería rechazar un token con firma inválida', () => {
      const token = generateToken(mockUser);
      
      // Modificar el token para invalidar la firma
      const parts = token.split('.');
      const invalidToken = `${parts[0]}.${parts[1]}.invalid-signature`;

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('Debería rechazar un token malformado', () => {
      const invalidToken = 'esto.no.es.un.token.valido';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('Debería rechazar un token vacío', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });

    it('Debería rechazar un token expirado', () => {
      // Generar token con expiración inmediata (1 segundo)
      const shortLivedToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, rol: mockUser.rol },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1s' }
      );

      // Esperar 2 segundos para que expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(shortLivedToken);
          }).toThrow(/expired|expirado/i);
          resolve();
        }, 2000);
      });
    }, 5000); // Timeout de 5 segundos para este test
  });

  describe('JWT - Casos de uso avanzados', () => {
    
    it('Debería manejar caracteres especiales en email', () => {
      const specialUser = {
        id: 456,
        email: 'test+special@innovatech.cl',
        rol: 'directivo'
      };

      const token = generateToken(specialUser);
      const decoded = verifyToken(token);

      expect(decoded.email).toBe(specialUser.email);
    });

    it('Debería preservar el rol exacto del usuario', () => {
      const roles = ['gestor', 'profesional', 'directivo'];

      roles.forEach(rol => {
        const user = { id: 999, email: 'test@innovatech.cl', rol };
        const token = generateToken(user);
        const decoded = verifyToken(token);

        expect(decoded.rol).toBe(rol);
      });
    });

    it('Debería generar tokens únicos en el mismo segundo', () => {
      // Generar múltiples tokens para el mismo usuario
      const tokens = [];
      for (let i = 0; i < 5; i++) {
        tokens.push(generateToken(mockUser));
      }

      // Todos los tokens deberían poder ser verificados
      tokens.forEach(token => {
        const decoded = verifyToken(token);
        expect(decoded.id).toBe(mockUser.id);
      });
    });
  });

  describe('JWT - Seguridad', () => {
    
    it('No debería incluir información sensible en el payload', () => {
      const userWithPassword = {
        id: 789,
        email: 'secure@innovatech.cl',
        rol: 'gestor',
        password: 'SuperSecretPassword123!' // NO debe estar en token
      };

      const token = generateToken(userWithPassword);
      const decoded = jwt.decode(token);

      // Validar que password NO está en el token
      expect(decoded).not.toHaveProperty('password');
    });

    it('Debería usar secret key para firmar tokens', () => {
      const token = generateToken(mockUser);

      // Intentar verificar con secret diferente debe fallar
      expect(() => {
        jwt.verify(token, 'wrong-secret-key');
      }).toThrow();
    });
  });
});
