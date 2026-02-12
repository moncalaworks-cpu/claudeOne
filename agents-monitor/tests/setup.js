/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_DIR = '/tmp/test-logs';
process.env.AGENTS_FILE = '/tmp/test-agents.json';

// Create mock directories
const fs = require('fs');
const path = require('path');

const testDirs = [
  '/tmp/test-logs',
  '/tmp/test-data'
];

testDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup global test timeout
jest.setTimeout(10000);

// Suppress console output during tests (unless explicitly needed)
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
