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
    '!src/middlewares/**',
    '!src/gateway/**',
    '!src/clients/**',
    '!src/metrics/**',
    '!src/lib/**',
    '!src/repositories/**',
    '!src/services/**',
    '!src/models/**',
    '!src/interfaces/**',
    '!src/db/verify.ts',
    '!src/utils/auditLog.ts',
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
    '^(.*/repositories/projectRepository)\\.js$': '<rootDir>/tests/mocks/projectRepository.js',
    '^(.*/repositories/taskRepository)\\.js$': '<rootDir>/tests/mocks/taskRepository.js',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, diagnostics: { warnOnly: true } }]
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
        pageTitle: 'Project Manager - Test Report',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss'
      }
    ]
  ]
};
