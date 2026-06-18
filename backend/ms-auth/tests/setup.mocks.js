import { jest } from '@jest/globals';

jest.mock('../src/utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    logCriticalOperation: jest.fn(),
    logEndpointAccess: jest.fn()
  }
}));

jest.mock('../src/middleware/metricsMiddleware.js', () => ({
  recordCriticalOperation: jest.fn(),
  metricsMiddleware: (req, res, next) => next()
}));

jest.mock('../src/config/database.js', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}));
