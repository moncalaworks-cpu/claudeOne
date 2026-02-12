const AgentMonitor = require('./agents');

/**
 * MetricsCollector - Aggregates and analyzes agent metrics
 * Provides overall performance statistics
 */
class MetricsCollector {
  constructor(options = {}) {
    this.monitor = new AgentMonitor(options);
    this.metricsCache = null;
    this.lastUpdate = null;
    this.cacheInterval = options.cacheInterval || 5000; // Cache for 5 seconds
  }

  /**
   * Get aggregated metrics
   */
  async getMetrics() {
    // Return cached metrics if still valid
    if (this.metricsCache && this.lastUpdate) {
      const elapsed = Date.now() - this.lastUpdate;
      if (elapsed < this.cacheInterval) {
        return this.metricsCache;
      }
    }

    try {
      const agents = await this.monitor.getAllAgents();
      const activeAgents = agents.filter(a => a.status === 'running');

      const metrics = {
        timestamp: new Date().toISOString(),
        totalAgents: agents.length,
        activeAgents: activeAgents.length,
        stoppedAgents: agents.filter(a => a.status === 'stopped').length,
        failedAgents: agents.filter(a => a.status === 'failed').length,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
        totalTokensUsed: 0,
        avgTokensPerExecution: 0,
        successRate: 0,
        uptime: {
          longestRunning: null,
          recentlyStarted: null
        }
      };

      // Analyze each agent
      let totalTime = 0;
      let executionCount = 0;

      for (const agent of agents) {
        const agentMetrics = await this.monitor.getAgentMetrics(agent.name);

        if (agentMetrics) {
          metrics.totalExecutions += agentMetrics.executionCount;
          metrics.successfulExecutions += agentMetrics.successCount;
          metrics.failedExecutions += agentMetrics.failureCount;
          totalTime += agentMetrics.totalExecutionTime;
          executionCount += agentMetrics.executionCount;

          // Track uptime
          if (agent.startTime) {
            const startTime = new Date(agent.startTime);
            const uptime = Date.now() - startTime.getTime();

            if (!metrics.uptime.longestRunning ||
                uptime > metrics.uptime.longestRunning.uptime) {
              metrics.uptime.longestRunning = {
                agent: agent.name,
                uptime: Math.floor(uptime / 1000)
              };
            }

            if (!metrics.uptime.recentlyStarted ||
                startTime > new Date(metrics.uptime.recentlyStarted.time)) {
              metrics.uptime.recentlyStarted = {
                agent: agent.name,
                time: agent.startTime
              };
            }
          }
        }
      }

      // Calculate averages
      if (executionCount > 0) {
        metrics.avgExecutionTime = Math.round(totalTime / executionCount);
        metrics.successRate = Math.round(
          (metrics.successfulExecutions / metrics.totalExecutions) * 100
        );
      }

      metrics.totalTokensUsed = activeAgents.reduce(
        (sum, agent) => sum + (agent.tokensUsed || 0),
        0
      );

      if (executionCount > 0) {
        metrics.avgTokensPerExecution = Math.round(
          metrics.totalTokensUsed / executionCount
        );
      }

      // Cache the metrics
      this.metricsCache = metrics;
      this.lastUpdate = Date.now();

      return metrics;
    } catch (error) {
      console.error('Error collecting metrics:', error);
      throw error;
    }
  }

  /**
   * Get metrics by time range
   */
  async getMetricsByTimeRange(startTime, endTime) {
    try {
      const agents = await this.monitor.getAllAgents();
      const metrics = [];

      for (const agent of agents) {
        const logs = await this.monitor.getAgentLogs(agent.name, { lines: 1000 });

        const agentMetrics = {
          agent: agent.name,
          period: { start: startTime, end: endTime },
          executions: 0,
          successes: 0,
          failures: 0
        };

        // Parse logs within time range
        logs.forEach(line => {
          const timestamp = this.extractTimestamp(line);
          if (timestamp && timestamp >= startTime && timestamp <= endTime) {
            agentMetrics.executions++;
            if (line.includes('✅')) agentMetrics.successes++;
            if (line.includes('ERROR')) agentMetrics.failures++;
          }
        });

        metrics.push(agentMetrics);
      }

      return metrics;
    } catch (error) {
      console.error('Error getting metrics by time range:', error);
      return [];
    }
  }

  /**
   * Extract timestamp from log line
   */
  extractTimestamp(logLine) {
    // Expected format: [2026-02-12 11:23:10]
    const match = logLine.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    if (match) {
      return new Date(match[1]).getTime();
    }
    return null;
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    try {
      const metrics = await this.getMetrics();

      const health = {
        status: 'healthy',
        issues: [],
        warnings: []
      };

      // Check for issues
      if (metrics.failedAgents > 0) {
        health.status = 'degraded';
        health.issues.push(`${metrics.failedAgents} failed agents`);
      }

      if (metrics.successRate < 80 && metrics.totalExecutions > 0) {
        health.warnings.push(`Success rate below 80%: ${metrics.successRate}%`);
      }

      if (metrics.activeAgents === 0) {
        health.status = 'offline';
        health.issues.push('No active agents');
      }

      return health;
    } catch (error) {
      console.error('Error getting health status:', error);
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.metricsCache = null;
    this.lastUpdate = null;
  }
}

module.exports = MetricsCollector;
