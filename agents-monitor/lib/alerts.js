/**
 * Alert System
 * Manages agent alerts, rules, and notifications
 */

const fs = require('fs');
const path = require('path');

class AlertManager {
  constructor(options = {}) {
    this.alertsDir = options.alertsDir || '/tmp/agent-alerts';
    this.configFile = options.configFile || path.join(this.alertsDir, 'alert-rules.json');
    this.historyFile = options.historyFile || path.join(this.alertsDir, 'alert-history.json');
    this.deduplicationWindow = options.deduplicationWindow || 300000; // 5 minutes in ms

    // Ensure directories exist
    if (!fs.existsSync(this.alertsDir)) {
      fs.mkdirSync(this.alertsDir, { recursive: true });
    }

    this.rules = this.loadRules();
    this.history = this.loadHistory();
    this.notifiers = {};
  }

  /**
   * Load alert rules from configuration file
   * @returns {Object} Alert rules
   */
  loadRules() {
    try {
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading alert rules:', error.message);
    }
    return this.getDefaultRules();
  }

  /**
   * Get default alert rules
   * @returns {Object} Default rules
   */
  getDefaultRules() {
    return {
      enabled: true,
      severityLevels: ['critical', 'warning', 'info'],
      rules: [
        {
          id: 'agent-failure',
          name: 'Agent Failure',
          severity: 'critical',
          condition: 'status === "failed"',
          enabled: true,
          notifyOn: ['email', 'slack', 'github'],
        },
        {
          id: 'low-success-rate',
          name: 'Low Success Rate',
          severity: 'warning',
          threshold: 0.8,
          condition: 'successRate < 0.8',
          enabled: true,
          notifyOn: ['email', 'slack'],
        },
        {
          id: 'slow-execution',
          name: 'Slow Execution',
          severity: 'warning',
          threshold: 30000, // 30 seconds
          condition: 'executionTime > 30000',
          enabled: true,
          notifyOn: ['slack'],
        },
        {
          id: 'high-token-usage',
          name: 'High Token Usage',
          severity: 'info',
          threshold: 50000,
          condition: 'totalTokens > 50000',
          enabled: true,
          notifyOn: ['email'],
        },
      ],
      notificationChannels: {
        email: {
          enabled: false,
          provider: 'smtp',
          recipients: [],
        },
        slack: {
          enabled: false,
          webhookUrl: null,
        },
        github: {
          enabled: false,
          autoCreateIssues: false,
        },
      },
    };
  }

  /**
   * Load alert history from file
   * @returns {Array} Alert history
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading alert history:', error.message);
    }
    return [];
  }

  /**
   * Save alert rules to file
   */
  saveRules() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.rules, null, 2));
    } catch (error) {
      console.error('Error saving alert rules:', error.message);
    }
  }

  /**
   * Save alert history to file
   */
  saveHistory() {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
    } catch (error) {
      console.error('Error saving alert history:', error.message);
    }
  }

  /**
   * Register a notifier
   * @param {string} name - Notifier name
   * @param {Object} notifier - Notifier instance
   */
  registerNotifier(name, notifier) {
    this.notifiers[name] = notifier;
  }

  /**
   * Evaluate rules against agent metrics
   * @param {Object} agentMetrics - Agent metrics data
   * @returns {Array} Triggered alerts
   */
  evaluateRules(agentMetrics) {
    if (!this.rules.enabled) {
      return [];
    }

    const alerts = [];

    this.rules.rules.forEach((rule) => {
      if (!rule.enabled) return;

      // Check if alert is deduped
      if (this.isDeduplicated(rule.id, agentMetrics.agentId)) {
        return;
      }

      try {
        // Safely evaluate rule condition
        const conditionMet = this.evaluateCondition(rule.condition, agentMetrics);

        if (conditionMet) {
          const alert = {
            id: rule.id,
            name: rule.name,
            severity: rule.severity,
            agentId: agentMetrics.agentId,
            agentName: agentMetrics.agentName,
            timestamp: Date.now(),
            message: this.generateAlertMessage(rule, agentMetrics),
            metrics: agentMetrics,
          };

          alerts.push(alert);
          this.recordAlert(alert);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error.message);
      }
    });

    return alerts;
  }

  /**
   * Safely evaluate condition against metrics
   * @param {string} condition - Condition string
   * @param {Object} metrics - Metrics object
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition, metrics) {
    // Create a safe evaluation context
    const context = {
      status: metrics.status,
      successRate: metrics.successRate,
      executionTime: metrics.executionTime,
      totalTokens: metrics.totalTokens,
      errorCount: metrics.errorCount,
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
    };

    try {
      // Use Function with safe context to avoid eval
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('Error evaluating condition:', error.message);
      return false;
    }
  }

  /**
   * Check if alert is deduplicated
   * @param {string} ruleId - Rule ID
   * @param {string} agentId - Agent ID
   * @returns {boolean} Is deduplicated
   */
  isDeduplicated(ruleId, agentId) {
    const now = Date.now();

    // Find recent alert for this rule+agent
    const recentAlert = this.history.find(
      (alert) => alert.id === ruleId && alert.agentId === agentId && now - alert.timestamp < this.deduplicationWindow,
    );

    return !!recentAlert;
  }

  /**
   * Record alert in history
   * @param {Object} alert - Alert to record
   */
  recordAlert(alert) {
    this.history.push(alert);

    // Keep only last 1000 alerts
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    this.saveHistory();
  }

  /**
   * Generate alert message
   * @param {Object} rule - Rule object
   * @param {Object} metrics - Metrics object
   * @returns {string} Alert message
   */
  generateAlertMessage(rule, metrics) {
    let message = `[${rule.severity.toUpperCase()}] ${rule.name}`;

    if (rule.severity === 'critical') {
      message += ` - Agent "${metrics.agentName}" has failed`;
    } else if (rule.id === 'low-success-rate') {
      message += ` - Success rate is ${(metrics.successRate * 100).toFixed(2)}% (threshold: 80%)`;
    } else if (rule.id === 'slow-execution') {
      message += ` - Execution took ${(metrics.executionTime / 1000).toFixed(2)}s (threshold: 30s)`;
    } else if (rule.id === 'high-token-usage') {
      message += ` - Used ${metrics.totalTokens} tokens (threshold: 50000)`;
    }

    return message;
  }

  /**
   * Send alerts to configured notifiers
   * @param {Array} alerts - Alerts to send
   */
  async sendAlerts(alerts) {
    for (const alert of alerts) {
      const rule = this.rules.rules.find((r) => r.id === alert.id);
      if (!rule) continue;

      for (const channel of rule.notifyOn) {
        const notifier = this.notifiers[channel];
        if (notifier && this.rules.notificationChannels[channel]?.enabled) {
          try {
            await notifier.send(alert);
          } catch (error) {
            console.error(`Error sending alert via ${channel}:`, error.message);
          }
        }
      }
    }
  }

  /**
   * Get alert history
   * @param {Object} options - Filter options
   * @returns {Array} Filtered alerts
   */
  getHistory(options = {}) {
    let alerts = [...this.history];

    if (options.agentId) {
      alerts = alerts.filter((a) => a.agentId === options.agentId);
    }

    if (options.severity) {
      alerts = alerts.filter((a) => a.severity === options.severity);
    }

    if (options.ruleId) {
      alerts = alerts.filter((a) => a.id === options.ruleId);
    }

    if (options.since) {
      alerts = alerts.filter((a) => a.timestamp > options.since);
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Update alert rules
   * @param {Object} newRules - New rules object
   */
  updateRules(newRules) {
    this.rules = { ...this.rules, ...newRules };
    this.saveRules();
  }

  /**
   * Update a specific rule
   * @param {string} ruleId - Rule ID
   * @param {Object} updates - Updates to apply
   */
  updateRule(ruleId, updates) {
    const ruleIndex = this.rules.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules.rules[ruleIndex] = { ...this.rules.rules[ruleIndex], ...updates };
      this.saveRules();
    }
  }

  /**
   * Clear alert history
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Get summary statistics
   * @returns {Object} Alert statistics
   */
  getStatistics() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const alertsLast24h = this.history.filter((a) => a.timestamp > last24h);

    return {
      totalAlerts: this.history.length,
      alertsLast24h: alertsLast24h.length,
      bySeverity: {
        critical: alertsLast24h.filter((a) => a.severity === 'critical').length,
        warning: alertsLast24h.filter((a) => a.severity === 'warning').length,
        info: alertsLast24h.filter((a) => a.severity === 'info').length,
      },
      byRule: this.rules.rules.reduce((acc, rule) => {
        acc[rule.id] = alertsLast24h.filter((a) => a.id === rule.id).length;
        return acc;
      }, {}),
    };
  }
}

module.exports = AlertManager;
