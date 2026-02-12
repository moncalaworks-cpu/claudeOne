/**
 * Alert System Tests
 * Testing AlertManager, rule evaluation, and notifications
 */

const AlertManager = require('../../lib/alerts');
const fs = require('fs');
const path = require('path');

describe('AlertManager', () => {
  let alertManager;
  const testDir = '/tmp/test-alerts';

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }

    alertManager = new AlertManager({
      alertsDir: testDir,
      deduplicationWindow: 300000,
    });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('Initialization', () => {
    it('should create directories on initialization', () => {
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should load default rules if no config exists', () => {
      expect(alertManager.rules).toBeDefined();
      expect(alertManager.rules.rules.length).toBeGreaterThan(0);
    });

    it('should have severity levels', () => {
      expect(alertManager.rules.severityLevels).toContain('critical');
      expect(alertManager.rules.severityLevels).toContain('warning');
      expect(alertManager.rules.severityLevels).toContain('info');
    });
  });

  describe('Rule Evaluation', () => {
    it('should evaluate agent failure condition', () => {
      const metrics = {
        agentId: 'agent-1',
        agentName: 'Email Processor',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);
      const failureAlert = alerts.find((a) => a.id === 'agent-failure');

      expect(failureAlert).toBeDefined();
      expect(failureAlert.severity).toBe('critical');
    });

    it('should evaluate low success rate condition', () => {
      const metrics = {
        agentId: 'agent-2',
        agentName: 'GitHub Monitor',
        status: 'running',
        successRate: 0.75,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);
      const lowSuccessAlert = alerts.find((a) => a.id === 'low-success-rate');

      expect(lowSuccessAlert).toBeDefined();
      expect(lowSuccessAlert.severity).toBe('warning');
    });

    it('should evaluate slow execution condition', () => {
      const metrics = {
        agentId: 'agent-3',
        agentName: 'Slow Agent',
        status: 'running',
        successRate: 0.95,
        executionTime: 45000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);
      const slowAlert = alerts.find((a) => a.id === 'slow-execution');

      expect(slowAlert).toBeDefined();
      expect(slowAlert.severity).toBe('warning');
    });

    it('should evaluate high token usage condition', () => {
      const metrics = {
        agentId: 'agent-4',
        agentName: 'Token Heavy Agent',
        status: 'running',
        successRate: 0.95,
        executionTime: 5000,
        totalTokens: 75000,
      };

      const alerts = alertManager.evaluateRules(metrics);
      const tokenAlert = alerts.find((a) => a.id === 'high-token-usage');

      expect(tokenAlert).toBeDefined();
      expect(tokenAlert.severity).toBe('info');
    });

    it('should not trigger alert if condition not met', () => {
      const metrics = {
        agentId: 'agent-5',
        agentName: 'Healthy Agent',
        status: 'running',
        successRate: 0.99,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);

      expect(alerts.length).toBe(0);
    });

    it('should handle disabled rules', () => {
      alertManager.updateRule('agent-failure', { enabled: false });

      const metrics = {
        agentId: 'agent-6',
        agentName: 'Failed Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);

      expect(alerts.find((a) => a.id === 'agent-failure')).toBeUndefined();
    });

    it('should handle invalid condition gracefully', () => {
      alertManager.updateRule('agent-failure', {
        condition: 'status === "unknown" && undefined.prop',
      });

      const metrics = {
        agentId: 'agent-7',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      expect(() => {
        alertManager.evaluateRules(metrics);
      }).not.toThrow();
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate recent alerts for same rule+agent', () => {
      const metrics = {
        agentId: 'agent-8',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      // First evaluation should trigger alert
      const alerts1 = alertManager.evaluateRules(metrics);
      expect(alerts1.length).toBeGreaterThan(0);

      // Second immediate evaluation should be deduplicated
      const alerts2 = alertManager.evaluateRules(metrics);
      expect(alerts2.length).toBe(0);
    });

    it('should allow alerts after deduplication window expires', () => {
      // Set short deduplication window for testing
      alertManager.deduplicationWindow = 100; // 100ms

      const metrics = {
        agentId: 'agent-9',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      // First alert
      let alerts = alertManager.evaluateRules(metrics);
      expect(alerts.length).toBeGreaterThan(0);

      // Wait for dedup window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          alerts = alertManager.evaluateRules(metrics);
          expect(alerts.length).toBeGreaterThan(0);
          resolve();
        }, 150);
      });
    });
  });

  describe('Alert History', () => {
    it('should record alerts in history', () => {
      const metrics = {
        agentId: 'agent-10',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      alertManager.evaluateRules(metrics);
      const history = alertManager.getHistory();

      expect(history.length).toBeGreaterThan(0);
    });

    it('should filter history by agentId', () => {
      // Create alerts for different agents
      ['agent-a', 'agent-b', 'agent-c'].forEach((agentId) => {
        const metrics = {
          agentId,
          agentName: `Agent ${agentId}`,
          status: 'failed',
          successRate: 1.0,
          executionTime: 1000,
          totalTokens: 5000,
        };
        alertManager.evaluateRules(metrics);
      });

      const history = alertManager.getHistory({ agentId: 'agent-a' });

      expect(history.length).toBeGreaterThan(0);
      expect(history.every((a) => a.agentId === 'agent-a')).toBe(true);
    });

    it('should filter history by severity', () => {
      const criticalMetrics = {
        agentId: 'agent-11',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const warningMetrics = {
        agentId: 'agent-12',
        agentName: 'Agent',
        status: 'running',
        successRate: 0.7,
        executionTime: 1000,
        totalTokens: 5000,
      };

      alertManager.evaluateRules(criticalMetrics);
      // Reset dedup to avoid filtering second alert
      alertManager.deduplicationWindow = 0;
      alertManager.evaluateRules(warningMetrics);

      const warnings = alertManager.getHistory({ severity: 'warning' });

      expect(warnings.every((a) => a.severity === 'warning')).toBe(true);
    });

    it('should limit history to last 1000 alerts', () => {
      // Create more than 1000 alerts
      for (let i = 0; i < 1100; i++) {
        alertManager.recordAlert({
          id: `rule-${i % 5}`,
          name: 'Test Alert',
          severity: 'info',
          agentId: `agent-${i}`,
          agentName: `Agent ${i}`,
          timestamp: Date.now() + i,
          message: 'Test message',
          metrics: {},
        });
      }

      expect(alertManager.history.length).toBe(1000);
    });

    it('should clear history', () => {
      const metrics = {
        agentId: 'agent-13',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      alertManager.evaluateRules(metrics);
      expect(alertManager.getHistory().length).toBeGreaterThan(0);

      alertManager.clearHistory();
      expect(alertManager.getHistory().length).toBe(0);
    });
  });

  describe('Rule Management', () => {
    it('should update all rules', () => {
      const newRules = { enabled: false };
      alertManager.updateRules(newRules);

      expect(alertManager.rules.enabled).toBe(false);
    });

    it('should update specific rule', () => {
      alertManager.updateRule('agent-failure', { severity: 'warning' });

      const rule = alertManager.rules.rules.find((r) => r.id === 'agent-failure');
      expect(rule.severity).toBe('warning');
    });

    it('should save rules to file', () => {
      alertManager.updateRule('agent-failure', { enabled: false });
      alertManager.saveRules();

      const loaded = new AlertManager({ alertsDir: testDir });
      const rule = loaded.rules.rules.find((r) => r.id === 'agent-failure');

      expect(rule.enabled).toBe(false);
    });
  });

  describe('Notifications', () => {
    it('should register notifiers', () => {
      const mockNotifier = {
        send: jest.fn(),
      };

      alertManager.registerNotifier('test', mockNotifier);

      expect(alertManager.notifiers.test).toBe(mockNotifier);
    });

    it('should send alerts to registered notifiers', async () => {
      const mockNotifier = {
        send: jest.fn().mockResolvedValue({ success: true }),
      };

      alertManager.registerNotifier('email', mockNotifier);
      alertManager.rules.notificationChannels.email = { enabled: true };

      // Disable other rules to avoid multiple triggers
      alertManager.rules.rules.forEach((r) => {
        r.enabled = false;
      });

      // Add a rule that uses the email notifier
      alertManager.rules.rules.push({
        id: 'test-rule',
        name: 'Test Rule',
        severity: 'critical',
        condition: 'status === "failed"',
        enabled: true,
        notifyOn: ['email'],
      });

      const metrics = {
        agentId: 'agent-test',
        agentName: 'Test Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      const alerts = alertManager.evaluateRules(metrics);
      await alertManager.sendAlerts(alerts);

      expect(mockNotifier.send).toHaveBeenCalled();
      expect(alerts[0].id).toBe('test-rule');
    });
  });

  describe('Statistics', () => {
    it('should generate statistics', () => {
      const metrics = {
        agentId: 'agent-14',
        agentName: 'Agent',
        status: 'failed',
        successRate: 1.0,
        executionTime: 1000,
        totalTokens: 5000,
      };

      alertManager.evaluateRules(metrics);
      const stats = alertManager.getStatistics();

      expect(stats).toHaveProperty('totalAlerts');
      expect(stats).toHaveProperty('alertsLast24h');
      expect(stats).toHaveProperty('bySeverity');
      expect(stats).toHaveProperty('byRule');
    });
  });

  describe('Alert Messages', () => {
    it('should generate meaningful alert messages', () => {
      const metrics = {
        agentId: 'agent-15',
        agentName: 'Email Processor',
        status: 'failed',
        successRate: 0.75,
        executionTime: 45000,
        totalTokens: 75000,
      };

      const alerts = alertManager.evaluateRules(metrics);

      expect(alerts.length).toBeGreaterThan(0);
      alerts.forEach((alert) => {
        expect(alert.message).toBeTruthy();
        expect(alert.message.length).toBeGreaterThan(0);
      });
    });
  });
});
