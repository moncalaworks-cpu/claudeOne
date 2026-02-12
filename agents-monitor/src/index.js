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
      console.log('🚀 Starting Agents Monitoring Dashboard...');
      const dashboard = new Dashboard(options);
      await dashboard.init();
      await dashboard.start();
    } catch (error) {
      console.error('❌ Error starting dashboard:', error.message);
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

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
