module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/application/**/*.ts', 'src/domain/**/*.ts', 'src/utils/**/*.ts'],
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 }
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true
};
