/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/app.{js,ts}',
    '!src/server.{js,ts}',
    '!src/controllers/**',
    '!src/routes/**',
    '!src/services/**',
    '!src/clients/**',
    '!src/middleware/**',
    '!src/utils/logger.ts',
    '!src/**/*.spec.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 }
  },
  testTimeout: 5000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  testPathIgnorePatterns: ['/node_modules/', '/logs/', '/coverage/', 'metrics.test.js', 'http-validation.test.js'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Auth Service - Test Report (AS-TASK-16)',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss'
      }
    ]
  ]
};
