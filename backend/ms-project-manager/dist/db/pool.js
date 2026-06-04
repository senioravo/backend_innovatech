"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
const config = require('../config');
let pool;
function getPool() {
    if (!pool) {
        if (!config.databaseUrl) {
            throw new Error('DATABASE_URL no está configurada. Copia .env.example a .env y define DATABASE_URL.');
        }
        pool = new Pool({
            connectionString: config.databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 15000
        });
    }
    return pool;
}
async function endPool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
module.exports = { getPool, endPool };
