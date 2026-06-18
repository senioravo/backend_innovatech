import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.API_GATEWAY_PREFIX = '/api/v1';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.ENABLE_METRICS = '1';
process.env.LOG_LEVEL = 'error';

const keysDir = path.join(__dirname, '../keys');
const authPublicKey = path.join(__dirname, '../../ms-auth/keys/public.key');
if (fs.existsSync(authPublicKey)) {
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  fs.copyFileSync(authPublicKey, path.join(keysDir, 'public.key'));
}

jest.mock('../src/db/pool.js', () => {
  const mockClient = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: jest.fn()
  };
  return {
    getPool: jest.fn(() => ({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      connect: jest.fn().mockResolvedValue(mockClient)
    })),
    endPool: jest.fn().mockResolvedValue(undefined)
  };
});

jest.mock('../src/db/verify.js', () => ({
  verifyDatabase: jest.fn().mockResolvedValue(undefined)
}));
