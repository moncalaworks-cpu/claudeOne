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
    dashboardProcess = spawn('npm', ['start'], {
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
    dashboardProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let startTime;
    let processAlive = false;
    let allOutput = '';

    dashboardProcess.stdout.on('data', (data) => {
      allOutput += data.toString();
    });

    dashboardProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      allOutput += chunk;

      // Check if dashboard started (message is on stderr now)
      if (chunk.includes('✅ Dashboard started')) {
        startTime = Date.now();
        processAlive = true;
      }
    });

    // Check that process stays alive for at least 2 seconds
    setTimeout(() => {
      if (processAlive && !dashboardProcess.killed) {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThan(1500);
        expect(dashboardProcess.exitCode).toBeNull(); // Process still running
        dashboardProcess.kill('SIGTERM');
        done();
      }
    }, 2500);

    dashboardProcess.on('error', (error) => {
      done(new Error(`Dashboard process error: ${error.message}`));
    });

    dashboardProcess.on('exit', (code) => {
      if (!processAlive) {
        console.log('DEBUG: Dashboard exited with code:', code);
        console.log('DEBUG: All output collected:', allOutput.substring(0, 1000));
      }
    });

    // Timeout
    setTimeout(() => {
      if (!processAlive) {
        dashboardProcess.kill('SIGTERM');
        done(new Error(`Dashboard did not stay alive. Output: ${allOutput.substring(0, 500)}`));
      }
    }, 5000);
  }, 10000);

  it('should not crash on startup', (done) => {
    dashboardProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../../'),
      env: {
        ...process.env,
        TERM: 'xterm',
        NODE_ENV: 'test'
      },
      timeout: 10000
    });

    let crashed = false;
    let errorMessages = [];

    dashboardProcess.stderr.on('data', (data) => {
      const error = data.toString();
      errorMessages.push(error);

      // Check for crash indicators
      if (
        error.includes('Error starting dashboard') ||
        error.includes('TypeError') ||
        error.includes('ReferenceError')
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

    // Let it run for 3 seconds
    setTimeout(() => {
      expect(crashed).toBe(false);
      if (errorMessages.length > 0) {
        // Log errors but don't fail on non-critical errors
        console.log('Dashboard stderr:', errorMessages.join(''));
      }
      dashboardProcess.kill('SIGTERM');
      done();
    }, 3000);
  }, 10000);

  it('should respond to keyboard interrupt (Ctrl+C)', (done) => {
    dashboardProcess = spawn('npm', ['start'], {
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
    dashboardProcess = spawn('npm', ['start'], {
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
