/**
 * Aplica db/migrations/001_schema.sql usando DATABASE_URL.
 * Uso: npm run db:migrate
 */
const { readFileSync } = require('fs');
const path = require('path');
const { getPool, endPool } = require('../src/db/pool');

async function main() {
  const sqlPath = path.join(__dirname, '..', 'db', 'migrations', '001_schema.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migración 001_schema.sql aplicada correctamente.');
  } finally {
    client.release();
    await endPool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
