// @ts-nocheck
export {};
// AS-TASK-23: Configuración centralizada de variables de entorno
require('dotenv').config();

const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

module.exports = {
  // Servidor
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_ISSUER: process.env.JWT_ISSUER || 'innovatech-auth',
  
  // Base de datos
  DATABASE_URL: (process.env.DATABASE_URL || '').trim(),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: int(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME || 'innovatech_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // Bcrypt
  BCRYPT_SALT_ROUNDS: int(process.env.BCRYPT_SALT_ROUNDS, 10),
  
  // Circuit Breaker
  CIRCUIT_BREAKER_TIMEOUT: int(process.env.CIRCUIT_BREAKER_TIMEOUT, 3000),
  CIRCUIT_BREAKER_ERROR_THRESHOLD: int(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD, 50),
  CIRCUIT_BREAKER_RESET_TIMEOUT: int(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 30000),
  
  // Elasticsearch (Auditoría centralizada)
  // Sin ELASTICSEARCH_NODE solo se usan logs locales con Winston
  elasticsearch: {
    node: (process.env.ELASTICSEARCH_NODE || '').trim(),
    index: (process.env.ELASTICSEARCH_AUDIT_INDEX || 'auth-audit').trim(),
    apiKey: (process.env.ELASTICSEARCH_API_KEY || '').trim(),
    username: (process.env.ELASTICSEARCH_USERNAME || '').trim(),
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    tlsInsecure: process.env.ELASTICSEARCH_TLS_INSECURE === '1'
  }
};
