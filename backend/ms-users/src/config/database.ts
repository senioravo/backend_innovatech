import { Pool } from 'pg';
import { Gauge } from 'prom-client';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasLocalDbConfig = Boolean(process.env.DB_HOST || process.env.DB_USER || process.env.DB_NAME || process.env.DB_PASSWORD);

if (!hasDatabaseUrl && !hasLocalDbConfig) {
  logger.warn('[Database] No se encontró configuración explícita de DB. Se usarán valores locales por defecto (localhost:5432/postgres).', {
    service: 'ms-users'
  });
}

const sslConfig = process.env.DATABASE_URL
  ? { rejectUnauthorized: false }
  : false;

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
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'innovatech_users',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

const dbConnectionsGauge = new Gauge({
  name: 'users_db_connections_total',
  help: 'Total de conexiones activas en el pool de PostgreSQL (ms-users)'
});

const dbIdleConnectionsGauge = new Gauge({
  name: 'users_db_connections_idle',
  help: 'Conexiones idle disponibles en el pool de PostgreSQL (ms-users)'
});

setInterval(() => {
  dbConnectionsGauge.set(pool.totalCount || 0);
  dbIdleConnectionsGauge.set(pool.idleCount || 0);
}, 10000);

pool.on('connect', () => {
  logger.info('[Database] Conexión establecida con PostgreSQL', {
    service: 'ms-users',
    pool: 'main'
  });
});

pool.on('error', (err) => {
  logger.error('[Database] Error en el pool de conexiones', {
    error: err.message,
    stack: err.stack,
    service: 'ms-users'
  });
});

process.on('SIGTERM', async () => {
  logger.info('[Database] Señal SIGTERM recibida - Cerrando pool de conexiones...');
  try {
    await pool.end();
    logger.info('[Database] Pool cerrado exitosamente');
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    logger.error('[Database] Error al cerrar pool', { error: err.message });
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
    const err = error as Error;
    logger.error('[Database] Error al cerrar pool', { error: err.message });
    process.exit(1);
  }
});

async function query(text: string, params?: unknown[]) {
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
    const err = error as Error;
    logger.error('[Database] Error en query', {
      error: err.message,
      query: text
    });
    throw error;
  }
}

export { query, pool };
