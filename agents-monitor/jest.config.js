module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  bail: false,
  errorOnDeprecated: true,
  // Force Jest to exit even if there are open handles
  // This is necessary because the keep-alive interval in dashboard tests
  // and subprocess handling can leave event handles active
  forceExit: true,
  // Limit workers in CI environments to avoid resource contention
  // This helps Jest discover and run all test files consistently
  // In GitHub Actions, 1-2 workers work better than auto (which can cause issues)
  maxWorkers: process.env.CI ? 2 : '50%'
};
