/**
 * Verificación de conectividad a PostgreSQL al arrancar ms-project-manager.
 */
import { getPool } from './pool.js';
import config from '../config/index.js';

/**
 * Ejecuta SELECT 1 contra el pool. No bloquea el arranque si falla.
 * @returns {Promise<boolean>} true si la conexión respondió
 */
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

export { verifyDatabase };
