const fs = require('fs').promises;
const path = require('path');

/**
 * AgentMonitor - Tracks active Claude Code agents
 * Monitors process status, performance, and logs
 */
class AgentMonitor {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(process.env.HOME, '.claudeone-automation/logs');
    this.agentsFile = options.agentsFile || path.join(process.env.HOME, '.claudeone-automation/agents.json');
    this.agents = new Map();
  }

  /**
   * Get list of active agents
   */
  async getActiveAgents() {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf8');
      const agents = JSON.parse(data);
      return agents.filter(a => a.status === 'running') || [];
    } catch (error) {
      // File doesn't exist yet, return empty array
      return [];
    }
  }

  /**
   * Register a new agent
   */
  async registerAgent(agent) {
    try {
      const agents = await this.getAllAgents();
      const existing = agents.findIndex(a => a.id === agent.id);

      if (existing >= 0) {
        agents[existing] = agent;
      } else {
        agents.push(agent);
      }

      await fs.writeFile(
        this.agentsFile,
        JSON.stringify(agents, null, 2),
        'utf8'
      );

      return agent;
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  }

  /**
   * Get all agents (active and inactive)
   */
  async getAllAgents() {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get logs for a specific agent
   */
  async getAgentLogs(agentName, options = {}) {
    try {
      const lines = options.lines || 50;
      const filter = options.filter || null;

      const logFile = path.join(this.logsDir, `${agentName}.log`);
      const content = await fs.readFile(logFile, 'utf8');
      let logLines = content.split('\n').slice(-lines);

      if (filter) {
        logLines = logLines.filter(line =>
          line.toLowerCase().includes(filter.toLowerCase())
        );
      }

      return logLines;
    } catch (error) {
      console.error(`Error reading logs for ${agentName}:`, error);
      return [];
    }
  }

  /**
   * Get performance metrics for an agent
   */
  async getAgentMetrics(agentName) {
    try {
      const logs = await this.getAgentLogs(agentName, { lines: 100 });

      const metrics = {
        name: agentName,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
        tokensUsed: 0,
        lastExecution: null,
        successRate: 0
      };

      // Parse logs for metrics
      logs.forEach(line => {
        if (line.includes('Analyzing issue')) {
          metrics.executionCount++;
        }
        if (line.includes('✅')) {
          metrics.successCount++;
        }
        if (line.includes('ERROR') || line.includes('Failed')) {
          metrics.failureCount++;
        }
      });

      if (metrics.executionCount > 0) {
        metrics.successRate = Math.round(
          (metrics.successCount / metrics.executionCount) * 100
        );
      }

      return metrics;
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      return null;
    }
  }

  /**
   * Start monitoring an agent
   */
  async startMonitoring(agent) {
    try {
      const monitoredAgent = {
        id: agent.id || Date.now().toString(),
        name: agent.name,
        pid: agent.pid || null,
        status: 'running',
        startTime: new Date().toISOString(),
        tokensUsed: 0,
        lastHeartbeat: new Date().toISOString()
      };

      await this.registerAgent(monitoredAgent);
      return monitoredAgent;
    } catch (error) {
      console.error('Error starting agent monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring an agent
   */
  async stopMonitoring(agentName) {
    try {
      const agents = await this.getAllAgents();
      const agent = agents.find(a => a.name === agentName);

      if (agent) {
        agent.status = 'stopped';
        agent.endTime = new Date().toISOString();
        await this.registerAgent(agent);
      }

      return agent;
    } catch (error) {
      console.error('Error stopping agent monitoring:', error);
      throw error;
    }
  }

  /**
   * Update agent heartbeat
   */
  async updateHeartbeat(agentName) {
    try {
      const agents = await this.getAllAgents();
      const agent = agents.find(a => a.name === agentName);

      if (agent) {
        agent.lastHeartbeat = new Date().toISOString();
        await this.registerAgent(agent);
      }

      return agent;
    } catch (error) {
      console.error('Error updating heartbeat:', error);
      throw error;
    }
  }

  /**
   * Get agent status
   */
  async getAgentStatus(agentName) {
    try {
      const agents = await this.getAllAgents();
      const agent = agents.find(a => a.name === agentName);
      return agent || null;
    } catch (error) {
      console.error('Error getting agent status:', error);
      return null;
    }
  }
}

module.exports = AgentMonitor;
