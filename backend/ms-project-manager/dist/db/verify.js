"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { getPool } = require('./pool');
async function verifyDatabase() {
    const pool = getPool();
    await pool.query('SELECT 1');
}
module.exports = { verifyDatabase };
