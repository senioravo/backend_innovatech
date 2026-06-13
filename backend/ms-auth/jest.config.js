// AS-TASK-16: Configuración de Jest para testing
// Framework: Jest + Supertest
// Objetivo: Pruebas unitarias e integración del microservicio Auth

module.exports = {
  preset: 'ts-jest',
  // Entorno de ejecución: Node.js
  testEnvironment: 'node',

  // Directorio raíz para tests
  roots: ['<rootDir>/tests'],

  // Patrón de archivos de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Archivos a incluir en cobertura
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

  // Umbrales de cobertura (opcional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Timeout para tests (5 segundos)
  testTimeout: 5000,

  // Variables de entorno para tests
  setupFiles: ['<rootDir>/tests/setup.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Verbose output
  verbose: true,

  // Limpiar mocks entre tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,

  // Ignorar carpetas
  testPathIgnorePatterns: [
    '/node_modules/',
    '/logs/',
    '/coverage/',
    'metrics.test.js',
    'http-validation.test.js'
  ],

  // Transformaciones (si se necesita Babel en el futuro)
  // transform: {},

  // Configuración de reportes
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
