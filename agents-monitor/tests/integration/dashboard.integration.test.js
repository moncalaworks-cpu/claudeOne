/**
 * Dashboard Integration Tests
 * Tests dashboard startup, UI rendering, and process lifecycle
 */

const { spawn } = require('child_process');
const path = require('path');

describe('Dashboard Integration', () => {
  let dashboardProcess;

  afterEach(() => {
    // Clean up - kill dashboard if still running
    if (dashboardProcess && !dashboardProcess.killed) {
      dashboardProcess.kill('SIGTERM');
    }
  });

  it('should start dashboard without errors', (done) => {
    dashboardProcess = spawn('node', ['src/index.js', 'start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let output = '';
    let errorOutput = '';
    let started = false;

    dashboardProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    dashboardProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;

      // Check for successful startup messages (now on stderr)
      if (errorOutput.includes('🚀 Starting Agents Monitoring Dashboard')) {
        started = true;
      }

      if (
        errorOutput.includes('✅ Dashboard initialized') &&
        errorOutput.includes('✅ Dashboard started')
      ) {
        // Dashboard started successfully - kill it and pass test
        dashboardProcess.kill('SIGTERM');
        expect(started).toBe(true);
        expect(errorOutput).toContain('🚀 Starting Agents Monitoring Dashboard');
        expect(errorOutput).toContain('✅ Dashboard initialized');
        expect(errorOutput).toContain('✅ Dashboard started');
        done();
      }

      // Check for dashboard errors
      if (errorOutput.includes('Error starting dashboard')) {
        dashboardProcess.kill('SIGTERM');
        done(new Error(`Dashboard error: ${errorOutput}`));
      }
    });

    dashboardProcess.on('error', (error) => {
      done(new Error(`Failed to start dashboard: ${error.message}`));
    });

    // Timeout if dashboard doesn't start in 5 seconds
    setTimeout(() => {
      if (!started) {
        dashboardProcess.kill('SIGTERM');
        done(new Error('Dashboard did not start within 5 seconds'));
      }
    }, 5000);
  }, 10000);

  it('should keep dashboard running (not exit immediately)', (done) => {
    dashboardProcess = spawn('node', ['src/index.js', 'start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let processExited = false;

    dashboardProcess.on('exit', (code) => {
      processExited = true;
      if (!doneCalled) {
        done(new Error(`Process exited with code ${code}`));
        doneCalled = true;
      }
    });

    dashboardProcess.on('error', (error) => {
      if (!doneCalled) {
        done(error);
        doneCalled = true;
      }
    });

    // After 2 seconds, check if process is still alive
    let doneCalled = false;
    const checkTimeout = setTimeout(() => {
      if (!doneCalled) {
        if (processExited) {
          done(new Error('Process exited before test check'));
          doneCalled = true;
        } else if (dashboardProcess.exitCode === null && !dashboardProcess.killed) {
          // Process is still alive - success!
          dashboardProcess.kill('SIGTERM');
          done();
          doneCalled = true;
        }
      }
    }, 2000);

    // Safeguard timeout
    const safeTimeout = setTimeout(() => {
      if (!doneCalled) {
        dashboardProcess.kill('SIGTERM');
        done(new Error('Test timeout'));
        doneCalled = true;
      }
    }, 5000);

    dashboardProcess.on('exit', () => {
      clearTimeout(checkTimeout);
      clearTimeout(safeTimeout);
    });
  }, 10000);

  it('should not crash on startup', (done) => {
    dashboardProcess = spawn('node', ['src/index.js', 'start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let crashed = false;
    let errorMessages = [];
    let dashboardStarted = false;

    dashboardProcess.stderr.on('data', (data) => {
      const error = data.toString();
      errorMessages.push(error);

      // Track successful startup
      if (error.includes('✅ Dashboard started')) {
        dashboardStarted = true;
      }

      // Check for crash indicators - especially blessed rendering errors
      if (
        error.includes('Error starting dashboard') ||
        error.includes('TypeError') ||
        error.includes('ReferenceError') ||
        error.includes('String.prototype.bold') ||
        error.includes('Error on xterm') ||
        error.includes('at bold')
      ) {
        crashed = true;
      }
    });

    dashboardProcess.on('exit', (code) => {
      if (code !== null && code !== 0 && code !== 143) {
        // 143 = SIGTERM exit code
        crashed = true;
      }
    });

    // Let it run for 4 seconds to allow rendering and catch any rendering errors
    setTimeout(() => {
      expect(dashboardStarted).toBe(true);
      expect(crashed).toBe(false);
      if (errorMessages.some(msg => msg.includes('Error') || msg.includes('TypeError'))) {
        console.log('Dashboard stderr:', errorMessages.join(''));
      }
      dashboardProcess.kill('SIGTERM');
      done();
    }, 4000);
  }, 10000);

  it('should respond to keyboard interrupt (Ctrl+C)', (done) => {
    dashboardProcess = spawn('node', ['src/index.js', 'start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let started = false;
    let exitedCleanly = false;

    dashboardProcess.stderr.on('data', (data) => {
      const output = data.toString();

      if (output.includes('✅ Dashboard started') && !started) {
        started = true;
        // Send Ctrl+C after dashboard starts
        setTimeout(() => {
          dashboardProcess.kill('SIGINT');
        }, 500);
      }
    });

    dashboardProcess.on('exit', (code, signal) => {
      // Should exit with code 0 or due to SIGINT
      if (code === 0 || signal === 'SIGINT') {
        exitedCleanly = true;
      }
      expect(started).toBe(true);
      expect(exitedCleanly).toBe(true);
      done();
    });

    // Timeout
    setTimeout(() => {
      if (!exitedCleanly) {
        dashboardProcess.kill('SIGTERM');
        done(new Error('Dashboard did not exit cleanly on Ctrl+C'));
      }
    }, 5000);
  }, 10000);

  it('should have required UI elements in output', (done) => {
    dashboardProcess = spawn('node', ['src/index.js', 'start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let output = '';
    let foundInitialized = false;
    let foundStarted = false;

    dashboardProcess.stderr.on('data', (data) => {
      output += data.toString();

      // Check for required UI elements
      if (output.includes('✅ Dashboard initialized')) {
        foundInitialized = true;
      }
      if (output.includes('✅ Dashboard started')) {
        foundStarted = true;
      }

      if (foundInitialized && foundStarted) {
        dashboardProcess.kill('SIGTERM');
        done();
      }
    });

    // Timeout
    setTimeout(() => {
      if (!foundInitialized || !foundStarted) {
        dashboardProcess.kill('SIGTERM');
        done(
          new Error(
            `Missing UI elements. Found initialized: ${foundInitialized}, started: ${foundStarted}. Output: ${output.substring(0, 500)}`
          )
        );
      }
    }, 5000);
  }, 10000);
});
