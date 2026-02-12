#!/usr/bin/env node

/**
 * Claude Code Agents Monitoring Dashboard
 * CLI tool for real-time monitoring of autonomous agents
 *
 * Features:
 * - Display active agents and their status
 * - Real-time performance metrics
 * - Log viewer with filtering
 * - Resource utilization charts
 * - Alert configuration
 * - GitHub integration
 */

const { Command } = require('commander');
const Dashboard = require('../lib/dashboard');
const AgentMonitor = require('../lib/agents');

const program = new Command();

program
  .name('agents-monitor')
  .description('CLI monitoring dashboard for Claude Code agents')
  .version('1.0.0');

program
  .command('start')
  .description('Start the monitoring dashboard')
  .option('--port <number>', 'Port for metrics server', 3000)
  .option('--refresh <ms>', 'Refresh interval in milliseconds', 1000)
  .action(async (options) => {
    try {
      process.stderr.write('🚀 Starting Agents Monitoring Dashboard\n');
      const dashboard = new Dashboard(options);
      await dashboard.init();
      await dashboard.start();
    } catch (error) {
      process.stderr.write(`❌ Error starting dashboard: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('agents')
  .description('List active agents')
  .action(async () => {
    try {
      const monitor = new AgentMonitor();
      const agents = await monitor.getActiveAgents();

      if (agents.length === 0) {
        console.log('📭 No active agents');
        return;
      }

      console.log('\n📊 Active Agents:');
      console.log('================\n');

      agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name}`);
        console.log(`   Status: ${agent.status}`);
        console.log(`   PID: ${agent.pid}`);
        console.log(`   Uptime: ${agent.uptime}s`);
        console.log(`   Tokens Used: ${agent.tokensUsed}`);
        console.log('');
      });
    } catch (error) {
      console.error('❌ Error listing agents:', error.message);
      process.exit(1);
    }
  });

program
  .command('logs <agent-name>')
  .description('View logs for a specific agent')
  .option('--lines <number>', 'Number of lines to show', 50)
  .option('--filter <pattern>', 'Filter logs by pattern')
  .action(async (agentName, options) => {
    try {
      const monitor = new AgentMonitor();
      const logs = await monitor.getAgentLogs(agentName, {
        lines: parseInt(options.lines),
        filter: options.filter
      });

      if (logs.length === 0) {
        console.log(`📭 No logs found for agent: ${agentName}`);
        return;
      }

      console.log(`\n📋 Logs for ${agentName}:`);
      console.log('====================\n');
      logs.forEach(log => console.log(log));
    } catch (error) {
      console.error('❌ Error fetching logs:', error.message);
      process.exit(1);
    }
  });

program
  .command('metrics')
  .description('Show performance metrics')
  .action(async () => {
    try {
      const metrics = new (require('../lib/metrics'))();
      const data = await metrics.getMetrics();

      console.log('\n📈 Performance Metrics:');
      console.log('======================\n');
      console.log(`Total Agents: ${data.totalAgents}`);
      console.log(`Active Agents: ${data.activeAgents}`);
      console.log(`Stopped Agents: ${data.stoppedAgents}`);
      console.log(`Total Tokens Used: ${data.totalTokensUsed}`);
      console.log(`Total Executions: ${data.totalExecutions}`);
      console.log(`Success Rate: ${data.successRate}%`);
      console.log(`\nUptime:`);
      if (data.uptime.longestRunning) {
        console.log(`  Longest Running: ${data.uptime.longestRunning.agent} (${data.uptime.longestRunning.uptime}s)`);
      }
    } catch (error) {
      console.error('❌ Error fetching metrics:', error.message);
      process.exit(1);
    }
  });

program
  .command('alerts <subcommand> [options...]')
  .description('Manage alerts')
  .allowUnknownOption(true)
  .action(async (subcommand, options) => {
    const AlertManager = require('../lib/alerts');
    const alertManager = new AlertManager();

    try {
      switch (subcommand) {
        case 'list': {
          const limit = options[0] ? parseInt(options[0]) : 10;
          const alerts = alertManager.getHistory().slice(0, limit);
          if (alerts.length === 0) {
            console.log('📭 No alerts recorded');
          } else {
            console.log(`\n⚠️  Recent Alerts (last ${alerts.length}):\n`);
            alerts.forEach((alert, index) => {
              const date = new Date(alert.timestamp).toISOString();
              console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.name}`);
              console.log(`   Agent: ${alert.agentName}`);
              console.log(`   Time: ${date}`);
              console.log(`   Message: ${alert.message}\n`);
            });
          }
          break;
        }

        case 'rules': {
          const { rules } = alertManager.rules;
          console.log('\n📋 Alert Rules:\n');
          rules.forEach((rule, index) => {
            const status = rule.enabled ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${rule.name}`);
            console.log(`   ID: ${rule.id}`);
            console.log(`   Severity: ${rule.severity}`);
            console.log(`   Condition: ${rule.condition}`);
            console.log(`   Notify via: ${rule.notifyOn.join(', ')}\n`);
          });
          break;
        }

        case 'stats': {
          const stats = alertManager.getStatistics();
          console.log('\n📊 Alert Statistics:\n');
          console.log(`Total Alerts: ${stats.totalAlerts}`);
          console.log(`Alerts (Last 24h): ${stats.alertsLast24h}`);
          console.log('\nBy Severity (Last 24h):');
          console.log(`  Critical: ${stats.bySeverity.critical}`);
          console.log(`  Warning: ${stats.bySeverity.warning}`);
          console.log(`  Info: ${stats.bySeverity.info}\n`);
          break;
        }

        case 'clear': {
          alertManager.clearHistory();
          console.log('✅ Alert history cleared');
          break;
        }

        case 'history': {
          const history = alertManager.getHistory({
            severity: options[0],
            agentId: options[1],
          });
          if (history.length === 0) {
            console.log('📭 No alerts match the filter');
          } else {
            console.log(`\n📋 Alert History (${history.length} results):\n`);
            history.slice(0, 20).forEach((alert, index) => {
              const date = new Date(alert.timestamp).toLocaleString();
              console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.name}`);
              console.log(`   Agent: ${alert.agentName} (${alert.agentId})`);
              console.log(`   Time: ${date}\n`);
            });
          }
          break;
        }

        default:
          console.log('\n⚠️  Alert Commands:\n');
          console.log('  alerts list              Show recent alerts');
          console.log('  alerts history           Show alert history');
          console.log('  alerts rules             Show configured rules');
          console.log('  alerts stats             Show alert statistics');
          console.log('  alerts clear             Clear alert history\n');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
