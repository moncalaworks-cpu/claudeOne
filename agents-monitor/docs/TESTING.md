# Testing & CI/CD Guide

Complete testing and continuous integration documentation for the Agents Monitor.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## Testing Framework

### Jest Configuration

- **Framework:** Jest 29.7.0
- **Environment:** Node.js
- **Coverage Target:** 80% lines, 70% branches
- **Timeout:** 10 seconds per test

### Test Structure

```
agents-monitor/
├── tests/
│   ├── setup.js              # Global setup
│   ├── lib/
│   │   ├── agents.test.js    # AgentMonitor tests
│   │   └── metrics.test.js   # MetricsCollector tests
│   └── src/
│       └── index.test.js     # CLI tests (optional)
```

---

## Writing Tests

### Test File Naming
- Use `.test.js` or `.spec.js` suffix
- Place in `tests/` directory matching source structure
- Example: `lib/agents.js` → `tests/lib/agents.test.js`

### Test Template

```javascript
/**
 * Module Tests
 * Testing [component name and purpose]
 */

const Component = require('../../lib/component');

describe('ComponentName', () => {
  let component;

  beforeEach(() => {
    // Setup before each test
    component = new Component();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(() => {
        component.method(null);
      }).toThrow();
    });
  });
});
```

### Test Best Practices

1. **One assertion per test** (or related assertions)
2. **Descriptive test names** - "should X when Y given Z"
3. **Arrange-Act-Assert pattern** - Clear test structure
4. **Mock external dependencies** - Isolate unit under test
5. **Test both happy path and error cases**

---

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- tests/lib/agents.test.js
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### CI Mode (production testing)
```bash
npm run test:ci
```

---

## Coverage Requirements

### Global Thresholds
- **Lines:** 80%
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 80%

### Coverage Report
```bash
npm run test:coverage
# Report saved to: coverage/lcov-report/index.html
```

### Viewing Coverage
```bash
# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage by File
```
File                    | Lines   | Functions | Branches
lib/agents.js          | 85.5%   | 88.2%     | 80.0%
lib/metrics.js         | 82.3%   | 80.0%     | 75.5%
lib/dashboard.js       | 78.9%   | 76.5%     | 72.0%
src/index.js           | 81.2%   | 79.0%     | 77.0%
```

---

## Linting

### ESLint Configuration

Linting is automatically run before tests via `pretest` script.

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### ESLint Rules
- Enforced: error handling, unused variables, best practices
- Warning: code style, naming conventions
- Disabled: overly strict rules impacting productivity

---

## Pre-commit Hooks

### Setup Husky (optional)
```bash
cd agents-monitor
npm install husky lint-staged --save-dev
npx husky install
```

### Pre-commit Actions
Automatically on `git commit`:
1. Run linter on changed files
2. Run tests for changed modules
3. Block commit if tests fail

### Skip Pre-commit
```bash
git commit --no-verify
```

---

## CI/CD Pipeline

### GitHub Actions Workflow: test-and-coverage.yml

Triggers on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Changes in `agents-monitor/` or workflow file

### Workflow Steps

1. **Setup** - Node.js 16.x and 18.x
2. **Install** - npm ci with caching
3. **Lint** - ESLint validation
4. **Test** - Jest with coverage
5. **Coverage** - Upload to Codecov
6. **Security** - npm audit and dependency check
7. **Quality** - Code quality gates
8. **Build** - Docker build (optional)
9. **Report** - Comment on PR with results

### Workflow Status Badge

```markdown
[![Test Status](https://github.com/moncalaworks-cpu/claudeOne/actions/workflows/test-and-coverage.yml/badge.svg)](https://github.com/moncalaworks-cpu/claudeOne/actions/workflows/test-and-coverage.yml)
```

---

## Security Testing

### npm Audit
```bash
npm audit
```

Checks for:
- Known vulnerabilities
- Outdated dependencies
- Security advisories

### OWASP Dependency Check
Automatic in CI/CD pipeline.

Detects:
- CVE vulnerabilities
- Known security issues
- License compliance

---

## Test Examples

### Testing Async Code
```javascript
it('should handle async operations', async () => {
  const result = await agent.startMonitoring({ name: 'test' });
  expect(result.status).toBe('running');
});
```

### Testing Error Handling
```javascript
it('should throw on invalid input', () => {
  expect(() => {
    new AgentMonitor({ logsDir: null });
  }).toThrow();
});
```

### Mocking Functions
```javascript
const mockFn = jest.fn();
mockFn.mockResolvedValue({ success: true });
const result = await mockFn();
expect(result.success).toBe(true);
```

### Testing Promises
```javascript
it('should reject on error', () => {
  return expect(promise).rejects.toThrow();
});
```

---

## Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should do something"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output
```bash
npm test -- --verbose
```

### Print Debug Info
```javascript
it('test', () => {
  console.log('Debug:', variable);
  // Only visible with --verbose or when test fails
});
```

---

## Test Maintenance

### Keep Tests Updated
- Update tests when code changes
- Remove tests for deleted code
- Refactor tests when patterns improve

### Flaky Tests
- Fix race conditions (use `done` callback)
- Increase timeout if needed: `jest.setTimeout(20000)`
- Use `beforeEach`/`afterEach` for proper isolation

### Test Organization
- Related tests grouped in `describe` blocks
- One `describe` per component/module
- Clear test names describing behavior

---

## Continuous Integration

### PR Requirements
- ✅ All tests pass
- ✅ Coverage ≥ 80%
- ✅ No lint errors
- ✅ Security audit OK

### Merge Protection
- PRs cannot merge if tests fail
- Coverage must meet threshold
- All required checks must pass

### Branch Protection Rules
```
main branch:
- Require pull request reviews: 1
- Require status checks to pass: Yes
- Require branches to be up to date before merging: Yes
```

---

## Troubleshooting

### Tests Not Running
```bash
# Verify Jest installed
npm list jest

# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Coverage Not Generated
```bash
# Ensure coverage directory writable
chmod -R 755 coverage/

# Check jest.config.js has collectCoverageFrom
npm run test:coverage -- --debug
```

### Timeout Errors
```javascript
// Increase timeout for slow tests
jest.setTimeout(30000); // 30 seconds
```

### Module Not Found
```bash
# Check module path in jest.config.js moduleNameMapper
npm test -- --testPathPattern="path/to/test"
```

---

## Performance

### Optimization Tips
- Run tests in parallel (default)
- Use `--maxWorkers=4` for large suites
- Cache dependencies with actions/setup-node
- Run only affected tests in watch mode

### Test Execution Time
Target: < 30 seconds for full suite

```bash
npm test -- --testTimeout=5000
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [ESLint Documentation](https://eslint.org/)
- [Codecov Documentation](https://codecov.io/)

---

**Status:** ✅ Testing infrastructure ready
**Last Updated:** 2026-02-12
**Maintenance:** Keep tests updated with code changes
