/**
 * AgentMonitor Tests
 * Testing agent tracking and log management
 */

const AgentMonitor = require('../../lib/agents');
const fs = require('fs');
const path = require('path');

describe('AgentMonitor', () => {
  let monitor;
  const testAgentsFile = '/tmp/test-agents.json';
  const testLogsDir = '/tmp/test-logs';

  beforeEach(() => {
    // Clean test files before each test
    if (fs.existsSync(testAgentsFile)) {
      fs.unlinkSync(testAgentsFile);
    }

    monitor = new AgentMonitor({
      agentsFile: testAgentsFile,
      logsDir: testLogsDir
    });
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testAgentsFile)) {
      fs.unlinkSync(testAgentsFile);
    }
  });

  describe('registerAgent', () => {
    it('should register a new agent', async () => {
      const agent = {
        id: 'test-001',
        name: 'test-agent',
        status: 'running',
        tokensUsed: 1000
      };

      const result = await monitor.registerAgent(agent);

      expect(result.id).toBe('test-001');
      expect(result.name).toBe('test-agent');
    });

    it('should update existing agent', async () => {
      const agent1 = {
        id: 'test-001',
        name: 'test-agent',
        status: 'running',
        tokensUsed: 1000
      };

      const agent2 = {
        id: 'test-001',
        name: 'test-agent',
        status: 'stopped',
        tokensUsed: 2000
      };

      await monitor.registerAgent(agent1);
      await monitor.registerAgent(agent2);

      const agents = await monitor.getAllAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].tokensUsed).toBe(2000);
    });
  });

  describe('getActiveAgents', () => {
    it('should return only running agents', async () => {
      const agents = [
        {
          id: 'agent-001',
          name: 'running-agent',
          status: 'running'
        },
        {
          id: 'agent-002',
          name: 'stopped-agent',
          status: 'stopped'
        }
      ];

      for (const agent of agents) {
        await monitor.registerAgent(agent);
      }

      const active = await monitor.getActiveAgents();
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('running-agent');
    });

    it('should return empty array when no agents', async () => {
      const active = await monitor.getActiveAgents();
      expect(active).toEqual([]);
    });
  });

  describe('getAgentLogs', () => {
    it('should read logs for an agent', async () => {
      const logFile = path.join(testLogsDir, 'test-agent.log');
      const logContent = `[2026-02-12 10:00:00] [INFO] Test log 1
[2026-02-12 10:00:01] [INFO] Test log 2
[2026-02-12 10:00:02] [INFO] Test log 3`;

      fs.writeFileSync(logFile, logContent);

      const logs = await monitor.getAgentLogs('test-agent', { lines: 10 });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('Test log');
    });

    it('should filter logs by pattern', async () => {
      const logFile = path.join(testLogsDir, 'test-agent.log');
      const logContent = `[2026-02-12 10:00:00] [INFO] Start
[2026-02-12 10:00:01] [ERROR] Failed
[2026-02-12 10:00:02] [INFO] Recovered`;

      fs.writeFileSync(logFile, logContent);

      const logs = await monitor.getAgentLogs('test-agent', {
        lines: 10,
        filter: 'ERROR'
      });

      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('ERROR');
    });

    it('should return empty array for missing logs', async () => {
      const logs = await monitor.getAgentLogs('nonexistent-agent');
      expect(logs).toEqual([]);
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring an agent', async () => {
      const agent = await monitor.startMonitoring({
        name: 'new-agent',
        pid: 12345
      });

      expect(agent.status).toBe('running');
      expect(agent.startTime).toBeDefined();
      expect(agent.id).toBeDefined();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring an agent', async () => {
      const agent = await monitor.startMonitoring({
        name: 'test-agent'
      });

      const stopped = await monitor.stopMonitoring('test-agent');

      expect(stopped.status).toBe('stopped');
      expect(stopped.endTime).toBeDefined();
    });
  });

  describe('updateHeartbeat', () => {
    it('should update agent heartbeat', async () => {
      await monitor.startMonitoring({ name: 'test-agent' });

      const updated = await monitor.updateHeartbeat('test-agent');

      expect(updated.lastHeartbeat).toBeDefined();
    });
  });

  describe('getAgentStatus', () => {
    it('should return agent status', async () => {
      await monitor.startMonitoring({ name: 'test-agent' });

      const status = await monitor.getAgentStatus('test-agent');

      expect(status).toBeDefined();
      expect(status.name).toBe('test-agent');
      expect(status.status).toBe('running');
    });

    it('should return null for nonexistent agent', async () => {
      const status = await monitor.getAgentStatus('nonexistent');
      expect(status).toBeNull();
    });
  });
});
