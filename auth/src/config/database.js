// AS-TASK-04: Configuración de conexión a PostgreSQL
// AS-TASK-19: Soporte para DATABASE_URL (Neon, Heroku, Railway, etc.)
const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool - soporta DATABASE_URL o variables separadas
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Requerido para Neon y otros servicios cloud
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'innovatech_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

// Pool de conexiones para PostgreSQL
const pool = new Pool(poolConfig);

// Evento de conexión exitosa
pool.on('connect', () => {
  console.log('[Database] Conexión establecida con PostgreSQL');
});

// Evento de error en el pool
pool.on('error', (err) => {
  console.error('[Database] Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para verificar la conexión
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('[Database] [OK] PostgreSQL conectado exitosamente');
    client.release();
    return true;
  } catch (error) {
    console.error('[Database] [ERROR] Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  checkConnection,
  query: (text, params) => pool.query(text, params)
};


