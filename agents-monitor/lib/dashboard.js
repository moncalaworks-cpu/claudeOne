const blessed = require('blessed');
const AgentMonitor = require('./agents');
const MetricsCollector = require('./metrics');

/**
 * Dashboard - Terminal UI for monitoring agents
 * Uses blessed library for a rich terminal interface
 */
class Dashboard {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3000,
      refreshInterval: options.refresh || 1000,
      ...options
    };

    this.monitor = new AgentMonitor();
    this.metrics = new MetricsCollector();
    this.screen = null;
    this.running = false;
  }

  /**
   * Initialize the dashboard
   */
  async init() {
    try {
      // Use text-based output instead of blessed UI
      // Blessed has terminal compatibility issues in many environments
      // Text mode is simpler and works reliably across all terminals
      process.stderr.write('📊 Dashboard running in text mode\n');
      this.screen = null;

      // Create main layout
      this.createLayout();

      // Handle keyboard shortcuts
      this.setupKeyboardHandlers();

      // Write to stderr to ensure message appears immediately and isn't buffered
      process.stderr.write('✅ Dashboard initialized\n');
    } catch (error) {
      console.error('❌ Error during initialization:', error.message);
      throw error;
    }
  }

  /**
   * Create the main dashboard layout
   */
  createLayout() {
    // Skip layout creation if no screen (text mode)
    if (!this.screen) {
      return;
    }

    // Title
    this.title = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: 'Claude Code Agents Monitor',
      contentAlignment: 'center',
      style: {
        bg: 'blue',
        fg: 'white',
        bold: true
      }
    });

    // Agents list (left side)
    this.agentsList = blessed.list({
      parent: this.screen,
      top: 3,
      left: 0,
      width: '50%',
      height: '50%-2',
      label: ' Active Agents ',
      border: 'line',
      style: {
        selected: {
          bg: 'green',
          fg: 'black'
        }
      }
    });

    // Metrics panel (right side, top)
    this.metricsBox = blessed.box({
      parent: this.screen,
      top: 3,
      right: 0,
      width: '50%',
      height: '25%-2',
      label: ' Metrics ',
      border: 'line',
      content: 'Waiting for metrics...',
      style: {
        border: 'green'
      }
    });

    // Performance chart (right side, middle)
    this.perfBox = blessed.box({
      parent: this.screen,
      top: '28%',
      right: 0,
      width: '50%',
      height: '22%-2',
      label: ' Performance ',
      border: 'line',
      content: 'Waiting for performance data...',
      style: {
        border: 'yellow'
      }
    });

    // Logs viewer (bottom)
    this.logsBox = blessed.log({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '50%-2',
      label: ' Recent Logs ',
      border: 'line',
      scrollable: true,
      mouse: true,
      keys: true,
      style: {
        border: 'magenta'
      }
    });

    // Status bar (bottom right)
    this.statusBar = blessed.box({
      parent: this.screen,
      bottom: 0,
      right: 0,
      width: 30,
      height: 1,
      content: '{right}Press q to quit | ? for help{/right}',
      style: {
        bg: 'black',
        fg: 'white'
      }
    });
  }

  /**
   * Setup keyboard handlers
   */
  setupKeyboardHandlers() {
    // Skip keyboard handlers if no screen (text mode)
    if (!this.screen) {
      return;
    }

    // Quit
    this.screen.key(['q', 'C-c'], () => {
      this.running = false;
      return process.exit(0);
    });

    // Refresh
    this.screen.key(['r'], () => {
      this.updateDashboard();
    });

    // Help
    this.screen.key(['?'], () => {
      this.showHelp();
    });

    // Navigate
    this.screen.key(['tab'], () => {
      this.screen.focusNext();
    });

    this.screen.key(['shift-tab'], () => {
      this.screen.focusPrev();
    });
  }

  /**
   * Start the dashboard
   */
  async start() {
    try {
      this.running = true;
      // Write to stderr to ensure message appears immediately and isn't buffered
      process.stderr.write('✅ Dashboard started\n');
      process.stderr.write('\n========== AGENTS MONITORING DASHBOARD ==========\n');
      process.stderr.write('Updating metrics every second...\n');
      process.stderr.write('Press Ctrl+C to quit\n');
      process.stderr.write('===================================================\n\n');

      // Initial update
      await this.updateDashboard();

      // Setup refresh interval
      this.refreshInterval = setInterval(async () => {
        if (this.running) {
          try {
            await this.updateDashboard();
          } catch (error) {
            console.error('Error updating dashboard:', error.message);
          }
        }
      }, this.options.refreshInterval);

      // Render the screen if blessed is available
      if (this.screen) {
        this.screen.render();
      }

      // Keep the process alive - CRITICAL for blessed to work
      // stdin.resume() keeps the event loop active for keyboard input
      process.stdin.resume();

      // Handle exit signals gracefully
      if (!process.listeners('SIGINT').length) {
        process.on('SIGINT', () => {
          this.running = false;
          clearInterval(this.refreshInterval);
          if (this.screen) {
            this.screen.destroy();
          }
          process.exit(0);
        });
      }

      // Also handle SIGTERM
      if (!process.listeners('SIGTERM').length) {
        process.on('SIGTERM', () => {
          this.running = false;
          clearInterval(this.refreshInterval);
          if (this.screen) {
            this.screen.destroy();
          }
          process.exit(0);
        });
      }

      // Set up dummy interval to keep event loop active
      // This prevents Node.js from exiting even if there are no other active handles
      // eslint-disable-next-line no-unused-vars
      const keepAliveInterval = setInterval(() => {
        // Dummy operation - just to keep the event loop running
      }, 1000);

      // Return a promise that never resolves - keeps the dashboard running indefinitely
      // This ensures the process stays alive and doesn't exit after start() completes
      return new Promise(() => {
        // Never resolve - dashboard runs until process is killed
        // Keep-alive interval ensures event loop stays active
      });
    } catch (error) {
      console.error('❌ Error starting dashboard:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Update dashboard with latest data
   */
  async updateDashboard() {
    try {
      // Get data
      const agents = await this.monitor.getActiveAgents();
      const metrics = await this.metrics.getMetrics();

      // Update agents list
      this.updateAgentsList(agents);

      // Update metrics
      this.updateMetrics(metrics);

      // Update performance chart
      this.updatePerformance(metrics);

      // Update logs
      this.updateLogs();

      // Render if blessed is available
      if (this.screen) {
        this.screen.render();
      } else {
        // Text mode: print formatted metrics to stderr
        const time = new Date().toLocaleTimeString();
        const line = `[${time}] Agents: ${agents.length} | Success: ${metrics.successRate}% | Avg Time: ${metrics.avgExecutionTime}ms | Total Tokens: ${metrics.totalTokensUsed}`;
        process.stderr.write(line + '\n');
      }
    } catch (error) {
      if (this.logsBox) {
        this.logsBox.log(`Error updating dashboard: ${error.message}`);
      } else {
        process.stderr.write(`Error updating dashboard: ${error.message}\n`);
      }
    }
  }

  /**
   * Update agents list panel
   */
  updateAgentsList(agents) {
    if (!this.agentsList) {
      return;
    }

    this.agentsList.clearItems();

    if (agents.length === 0) {
      this.agentsList.addItem('📭 No active agents');
      return;
    }

    agents.forEach(agent => {
      const statusIcon = agent.status === 'running' ? '🟢' : '🔴';
      const item = `${statusIcon} ${agent.name} (${agent.tokensUsed} tokens)`;
      this.agentsList.addItem(item);
    });

    this.agentsList.setLabel(` Active Agents (${agents.length}) `);
  }

  /**
   * Update metrics panel
   */
  updateMetrics(metrics) {
    if (!this.metricsBox) {
      return;
    }

    const content = `
 Total: ${metrics.totalAgents} | Active: ${metrics.activeAgents} | Failed: ${metrics.failedAgents}
 Success Rate: ${metrics.successRate}%
 Avg Time: ${metrics.avgExecutionTime}ms
 Total Tokens: ${metrics.totalTokensUsed}
    `.trim();

    this.metricsBox.setContent(content);
  }

  /**
   * Update performance chart
   */
  updatePerformance(metrics) {
    if (!this.perfBox) {
      return;
    }

    const chartContent = `
 Execution Time: ${this.getBar(metrics.avgExecutionTime, 5000)}
 Token Usage: ${this.getBar(metrics.totalTokensUsed, 100000)}
 Success Rate: ${this.getBar(metrics.successRate, 100)}
    `.trim();

    this.perfBox.setContent(chartContent);
  }

  /**
   * Generate simple bar chart
   */
  getBar(value, max) {
    const percentage = Math.min((value / max) * 100, 100);
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    // No markup tags - blessed can't parse them properly in this context
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(0)}%`;
  }

  /**
   * Update logs panel
   */
  updateLogs() {
    // This would fetch latest logs from agents
    // For now, it's a placeholder
  }

  /**
   * Show help information
   */
  showHelp() {
    const help = `
Keyboard Shortcuts:
  q / Ctrl+C  - Quit
  r           - Refresh
  Tab         - Next panel
  Shift+Tab   - Previous panel
  ? / h       - This help

Status Indicators:
  🟢 - Agent running
  🔴 - Agent failed
  🟡 - Agent idle
    `.trim();

    if (this.logsBox) {
      this.logsBox.log(help);
    } else {
      process.stderr.write(help + '\n');
    }

    if (this.screen) {
      this.screen.render();
    }
  }

  /**
   * Stop the dashboard
   */
  stop() {
    this.running = false;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.screen) {
      this.screen.destroy();
    }
  }
}

module.exports = Dashboard;
