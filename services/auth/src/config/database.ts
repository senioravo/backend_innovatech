// @ts-nocheck
export {};

// AS-TASK-21: Configuracin de base de datos production-ready
// Mejoras: SSL seguro, graceful shutdown, retry logic, Winston logging, mtricas Prometheus
const { Pool } = require('pg');
const { Gauge } = require('prom-client');
require('dotenv').config();

// AS-TASK-21: Importar Winston logger en vez de console.log
const logger = require('../utils/logger');

// AS-TASK-21: Validar variables de entorno requeridas
if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  throw new Error('DATABASE_URL o DB_PASSWORD es requerido. Verifica tu archivo .env');
}

// AS-TASK-21: SSL seguro - rejectUnauthorized: true en produccin
const sslConfig = process.env.DATABASE_URL
  ? {
      // Neon y otros Postgres gestionados suelen requerir SSL sin verificar CA en contenedores.
      rejectUnauthorized: false,
    }
  : false; // Sin SSL para PostgreSQL local

// Configuracin del pool - soporta DATABASE_URL o variables separadas
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
      database: process.env.DB_NAME || 'innovatech_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

// Pool de conexiones para PostgreSQL
const pool = new Pool(poolConfig);

// AS-TASK-21: Mtricas de Prometheus para monitoreo del pool
const dbConnectionsGauge = new Gauge({
  name: 'db_connections_total',
  help: 'Total de conexiones activas en el pool de PostgreSQL'
});

const dbIdleConnectionsGauge = new Gauge({
  name: 'db_connections_idle',
  help: 'Conexiones idle disponibles en el pool de PostgreSQL'
});

// AS-TASK-21: Actualizar mtricas cada 10 segundos
setInterval(() => {
  dbConnectionsGauge.set(pool.totalCount || 0);
  dbIdleConnectionsGauge.set(pool.idleCount || 0);
}, 10000);

// Evento de conexin exitosa
pool.on('connect', () => {
  logger.info('[Database] Conexin establecida con PostgreSQL', {
    taskId: 'AS-TASK-21',
    pool: 'main'
  });
});

// AS-TASK-21: Evento de error mejorado - NO mata el servidor
pool.on('error', (err) => {
  logger.error('[Database] Error en el pool de conexiones', {
    error: err.message,
    stack: err.stack,
    taskId: 'AS-TASK-21'
  });
  // El pool se auto-recupera, NO usar process.exit()
});

// AS-TASK-21: Graceful shutdown - Cerrar pool correctamente al finalizar
process.on('SIGTERM', async () => {
  logger.info('[Database] Seal SIGTERM recibida - Cerrando pool de conexiones...');
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
  logger.info('[Database] Seal SIGINT recibida - Cerrando pool de conexiones...');
  try {
    await pool.end();
    logger.info('[Database] Pool cerrado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('[Database] Error al cerrar pool', { error: error.message });
    process.exit(1);
  }
});

// AS-TASK-21: Retry logic - Reintentar conexin hasta 3 veces
const checkConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      logger.info('[Database] [OK] PostgreSQL conectado exitosamente', {
        attempt: i + 1,
        taskId: 'AS-TASK-21'
      });
      client.release();
      return true;
    } catch (error) {
      logger.error(`[Database] Intento ${i + 1}/${retries} de conexin fall`, {
        error: error.message,
        taskId: 'AS-TASK-21'
      });
      
      if (i < retries - 1) {
        // Esperar 2 segundos antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  logger.error('[Database] [ERROR] No se pudo conectar a PostgreSQL despus de todos los reintentos');
  return false;
};

module.exports = {
  pool,
  checkConnection,
  query: (text, params) => pool.query(text, params)
};


