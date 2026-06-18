import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';
import { getPool, endPool } from '../dist/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Aplica todos los archivos .sql en db/migrations/ en orden lexicográfico.
 * Uso: npm run db:migrate
 */
async function main() {
  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const pool = getPool();
  const client = await pool.connect();
  try {
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = readFileSync(sqlPath, 'utf8');
      await client.query(sql);
      console.log(`Migración aplicada: ${file}`);
    }
  } finally {
    client.release();
    await endPool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
