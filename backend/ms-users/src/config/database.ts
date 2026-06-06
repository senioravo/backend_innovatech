// @ts-nocheck
export {};
// Configuración de base de datos para ms-users
const { Pool } = require('pg');
const { Gauge } = require('prom-client');
require('dotenv').config();

const logger = require('../utils/logger');

// Validar variables de entorno requeridas
if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  throw new Error('DATABASE_URL o DB_PASSWORD es requerido. Verifica tu archivo .env');
}

// SSL seguro para Neon u otros servicios gestionados
const sslConfig = process.env.DATABASE_URL
  ? {
      rejectUnauthorized: false,
    }
  : false;

// Configuración del pool
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'innovatech_users',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

// Pool de conexiones para PostgreSQL
const pool = new Pool(poolConfig);

// Métricas de Prometheus para monitoreo del pool
const dbConnectionsGauge = new Gauge({
  name: 'users_db_connections_total',
  help: 'Total de conexiones activas en el pool de PostgreSQL (ms-users)'
});

const dbIdleConnectionsGauge = new Gauge({
  name: 'users_db_connections_idle',
  help: 'Conexiones idle disponibles en el pool de PostgreSQL (ms-users)'
});

// Actualizar métricas cada 10 segundos
setInterval(() => {
  dbConnectionsGauge.set(pool.totalCount || 0);
  dbIdleConnectionsGauge.set(pool.idleCount || 0);
}, 10000);

// Evento de conexión exitosa
pool.on('connect', () => {
  logger.info('[Database] Conexión establecida con PostgreSQL', {
    service: 'ms-users',
    pool: 'main'
  });
});

// Evento de error
pool.on('error', (err) => {
  logger.error('[Database] Error en el pool de conexiones', {
    error: err.message,
    stack: err.stack,
    service: 'ms-users'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[Database] Señal SIGTERM recibida - Cerrando pool de conexiones...');
  try {
    await pool.end();
    logger.info('[Database] Pool cerrado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('[Database] Error al cerrar pool', { error: error.message });
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('[Database] Señal SIGINT recibida - Cerrando pool de conexiones...');
  try {
    await pool.end();
    logger.info('[Database] Pool cerrado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('[Database] Error al cerrar pool', { error: error.message });
    process.exit(1);
  }
});

/**
 * Función helper para ejecutar queries
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise} - Resultado de la query
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info('[Database] Query ejecutada', {
      duration: `${duration}ms`,
      rows: res.rowCount
    });
    return res;
  } catch (error) {
    logger.error('[Database] Error en query', {
      error: error.message,
      query: text
    });
    throw error;
  }
}

module.exports = {
  query,
  pool
};
