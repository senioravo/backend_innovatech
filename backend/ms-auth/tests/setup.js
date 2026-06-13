// AS-TASK-16: Setup para tests
// Configuración de variables de entorno para ambiente de testing

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.PORT = 3002; // Puerto diferente para tests
process.env.JWT_SECRET = 'test-secret-key-for-jwt-AS-TASK-16';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';

// Database (usar BD de test o mock)
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'innovatech_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';

// Circuit Breaker
process.env.CIRCUIT_BREAKER_TIMEOUT = '3000';
process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD = '50';
process.env.CIRCUIT_BREAKER_RESET_TIMEOUT = '30000';

// Desactivar logs durante tests (opcional)
process.env.LOG_LEVEL = 'error';

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  logCriticalOperation: jest.fn(),
  logEndpointAccess: jest.fn()
}));

jest.mock('../src/middleware/metricsMiddleware', () => ({
  recordCriticalOperation: jest.fn(),
  metricsMiddleware: (req, res, next) => next()
}));

const usersByEmail = new Map();

jest.mock('../src/config/database', () => ({
  query: jest.fn().mockImplementation(async (sql, params = []) => {
    const text = String(sql).toLowerCase();

    if (text.includes('insert into usuarios')) {
      const email = String(params[1]).toLowerCase();
      if (usersByEmail.has(email)) {
        const err = new Error('duplicate key value violates unique constraint');
        err.code = '23505';
        throw err;
      }
      const user = {
        id: usersByEmail.size + 1,
        nombre: params[0],
        email,
        password: params[2],
        rol: params[3] || 'gestor',
        created_at: new Date().toISOString()
      };
      usersByEmail.set(email, user);
      return {
        rows: [
          {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            created_at: user.created_at
          }
        ]
      };
    }

    if (text.includes('select') && text.includes('usuarios') && text.includes('email')) {
      const email = String(params[0]).toLowerCase();
      const user = usersByEmail.get(email);
      return { rows: user ? [user] : [] };
    }

    if (text.includes('select') && text.includes('usuarios') && text.includes('where id')) {
      const user = [...usersByEmail.values()].find((u) => u.id === Number(params[0]));
      return { rows: user ? [user] : [] };
    }

    if (text.includes('update usuarios') && text.includes('rol')) {
      const user = [...usersByEmail.values()].find((u) => u.id === Number(params[1]));
      if (!user) return { rows: [] };
      user.rol = params[0];
      return {
        rows: [
          {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            updated_at: new Date().toISOString()
          }
        ]
      };
    }

    return { rows: [] };
  })
}));
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };

console.log('🧪 Test environment configured for AS-TASK-16');
