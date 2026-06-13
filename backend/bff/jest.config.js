module.exports = {
  preset: 'ts-jest',
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
    '!src/**/*.spec.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
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
