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
    '!src/presentation/http/controllers/**',
    '!src/presentation/http/routes/**',
    '!src/presentation/http/middlewares/**',
    '!src/infrastructure/clients/**',
    '!src/**/*.spec.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: { lines: 60, statements: 60 }
  },
  injectGlobals: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(.*/infrastructure/clients/authUpstreamClient)\\.js$': '<rootDir>/tests/mocks/authUpstreamClient.js',
    '^(.*/infrastructure/clients/projectManagerUpstreamClient)\\.js$':
      '<rootDir>/tests/mocks/projectManagerUpstreamClient.js',
    '^(.*/infrastructure/clients/kpiUpstreamClient)\\.js$': '<rootDir>/tests/mocks/kpiUpstreamClient.js',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'BFF Service - Test Report',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss'
      }
    ]
  ]
};
