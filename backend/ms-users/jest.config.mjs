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
    '!src/controllers/**',
    '!src/routes/**',
    '!src/middleware/**',
    '!src/services/**',
    '!src/repositories/**',
    '!src/config/database.ts',
    '!src/utils/logger.ts',
    '!src/utils/jwt.helper.ts',
    '!src/models/**',
    '!src/**/*.spec.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: { lines: 60, statements: 60 }
  },
  injectGlobals: true,
  testTimeout: 5000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(.*/config/database)\\.js$': '<rootDir>/tests/mocks/database.js',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  clearMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Users Service - Test Report',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss'
      }
    ]
  ]
};
