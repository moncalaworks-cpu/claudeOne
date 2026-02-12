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
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
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
  // Do NOT use forceExit - it may prevent Jest from discovering all test files
  // Jest will exit naturally after all tests complete
  // Limit workers in CI environments to avoid resource contention
  // This helps Jest discover and run all test files consistently
  // In GitHub Actions, 1-2 workers work better than auto (which can cause issues)
  maxWorkers: process.env.CI ? 2 : '50%'
};
