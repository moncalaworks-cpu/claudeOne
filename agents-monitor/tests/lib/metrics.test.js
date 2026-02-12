/**
 * MetricsCollector Tests
 * Testing metrics aggregation and analysis
 */

const MetricsCollector = require('../../lib/metrics');
const AgentMonitor = require('../../lib/agents');
const fs = require('fs');

jest.mock('../../lib/agents');

describe('MetricsCollector', () => {
  let collector;
  let mockMonitor;

  beforeEach(() => {
    mockMonitor = {
      getAllAgents: jest.fn().mockResolvedValue([
        {
          id: 'agent-001',
          name: 'test-agent-1',
          status: 'running',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          tokensUsed: 1000
        },
        {
          id: 'agent-002',
          name: 'test-agent-2',
          status: 'running',
          startTime: new Date(Date.now() - 1800000).toISOString(),
          tokensUsed: 2000
        }
      ]),
      getAgentMetrics: jest.fn().mockResolvedValue({
        name: 'test-agent',
        executionCount: 10,
        successCount: 9,
        failureCount: 1,
        totalExecutionTime: 5000,
        successRate: 90
      })
    };

    AgentMonitor.mockImplementation(() => mockMonitor);
    collector = new MetricsCollector();
    collector.monitor = mockMonitor;
  });

  describe('getMetrics', () => {
    it('should aggregate metrics across agents', async () => {
      const metrics = await collector.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalAgents).toBe(2);
      expect(metrics.activeAgents).toBe(2);
      expect(metrics.totalTokensUsed).toBeGreaterThan(0);
      expect(metrics.timestamp).toBeDefined();
    });

    it('should calculate success rate', async () => {
      const metrics = await collector.getMetrics();

      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
    });

    it('should cache metrics', async () => {
      await collector.getMetrics();
      const cachedMetrics = await collector.getMetrics();

      expect(cachedMetrics).toBeDefined();
      expect(mockMonitor.getAllAgents).toHaveBeenCalledTimes(1);
    });

    it('should track uptime', async () => {
      const metrics = await collector.getMetrics();

      expect(metrics.uptime).toBeDefined();
      expect(metrics.uptime.longestRunning).toBeDefined();
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status', async () => {
      const health = await collector.getHealthStatus();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'degraded', 'offline']).toContain(health.status);
    });

    it('should identify issues', async () => {
      mockMonitor.getAllAgents.mockResolvedValue([]);

      const health = await collector.getHealthStatus();

      expect(health.status).toBe('offline');
      expect(health.issues.length).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    it('should clear metrics cache', async () => {
      await collector.getMetrics();
      collector.clearCache();

      expect(collector.metricsCache).toBeNull();
      expect(collector.lastUpdate).toBeNull();
    });
  });

  describe('getMetricsByTimeRange', () => {
    it('should return metrics for time range', async () => {
      const startTime = new Date(Date.now() - 86400000).getTime();
      const endTime = Date.now();

      const metrics = await collector.getMetricsByTimeRange(startTime, endTime);

      expect(Array.isArray(metrics)).toBe(true);
    });
  });
});
