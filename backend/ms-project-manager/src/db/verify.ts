// @ts-nocheck
export {};
const { getPool } = require('./pool');
const config = require('../config');

async function verifyDatabase() {
  if (!config.databaseUrl) {
    console.warn('[DB] DATABASE_URL no está configurada. El servicio iniciará sin verificación de conexión.');
    return false;
  }

  const pool = getPool();
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.warn('[DB] No se pudo verificar la conexión a PostgreSQL. El servicio iniciará igual.', error.message);
    return false;
  }
}

module.exports = { verifyDatabase };
