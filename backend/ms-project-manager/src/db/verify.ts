// @ts-nocheck
export {};
const { getPool } = require('./pool');

async function verifyDatabase() {
  const pool = getPool();
  await pool.query('SELECT 1');
}

module.exports = { verifyDatabase };
