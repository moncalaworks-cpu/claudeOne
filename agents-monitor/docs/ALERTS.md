# Alert System Guide

Comprehensive guide for configuring and using the Agents Monitor alert system to detect and respond to agent failures, performance issues, and resource constraints.

---

## Quick Start

### View Recent Alerts

```bash
agents-monitor alerts list
agents-monitor alerts list --limit 20
```

### Check Alert History

```bash
agents-monitor alerts history
agents-monitor alerts history --severity critical
agents-monitor alerts history --agent agent-email-processor
```

### View Alert Rules

```bash
agents-monitor alerts rules
```

### Get Statistics

```bash
agents-monitor alerts stats
```

---

## Alert System Architecture

### Components

1. **AlertManager** - Core engine for rule evaluation and alert management
2. **Rules Engine** - Configurable conditions with safe expression evaluation
3. **Notifiers** - Multiple notification channels (Email, Slack, GitHub)
4. **History** - Persistent alert tracking with deduplication

### Alert Lifecycle

```
Agent Metrics
    ↓
Rule Evaluation (AlertManager.evaluateRules)
    ↓
Deduplication Check (5-minute window)
    ↓
Alert Created
    ↓
Recorded in History
    ↓
Sent to Configured Notifiers
```

---

## Alert Rules

### Pre-configured Rules

#### 1. Agent Failure (Critical)

**Condition:** `status === "failed"`
**Severity:** Critical
**Notifications:** Email, Slack, GitHub

Triggered when an agent process fails or exits unexpectedly.

```json
{
  "id": "agent-failure",
  "name": "Agent Failure",
  "severity": "critical",
  "condition": "status === \"failed\"",
  "enabled": true,
  "notifyOn": ["email", "slack", "github"]
}
```

#### 2. Low Success Rate (Warning)

**Condition:** `successRate < 0.8`
**Severity:** Warning
**Notifications:** Email, Slack

Triggered when agent success rate drops below 80%.

#### 3. Slow Execution (Warning)

**Condition:** `executionTime > 30000`
**Severity:** Warning
**Notifications:** Slack

Triggered when agent execution takes longer than 30 seconds.

#### 4. High Token Usage (Info)

**Condition:** `totalTokens > 50000`
**Severity:** Info
**Notifications:** Email

Triggered when token consumption exceeds 50,000 per execution.

### Rule Structure

```json
{
  "id": "unique-rule-id",
  "name": "Display Name",
  "severity": "critical|warning|info",
  "condition": "javascript expression",
  "threshold": 123,
  "enabled": true,
  "notifyOn": ["email", "slack", "github"]
}
```

### Available Metrics in Conditions

- `status` - Agent status (running, failed, completed)
- `successRate` - Success rate (0.0 - 1.0)
- `executionTime` - Execution time in milliseconds
- `totalTokens` - Total tokens used
- `errorCount` - Number of errors
- `cpuUsage` - CPU usage percentage
- `memoryUsage` - Memory usage percentage

### Writing Custom Rules

Create or modify `/tmp/agent-alerts/alert-rules.json`:

```json
{
  "enabled": true,
  "severityLevels": ["critical", "warning", "info"],
  "rules": [
    {
      "id": "custom-rule",
      "name": "Custom Alert",
      "severity": "warning",
      "condition": "errorCount > 5 && successRate < 0.5",
      "enabled": true,
      "notifyOn": ["slack"]
    }
  ]
}
```

---

## Notification Channels

### Email Notifications

**Configuration:** `/tmp/agent-alerts/alert-rules.json`

```json
{
  "notificationChannels": {
    "email": {
      "enabled": true,
      "provider": "smtp",
      "recipients": ["admin@company.com", "team@company.com"]
    }
  }
}
```

**Features:**
- Multiple recipients
- SMTP configuration
- Rich message formatting
- Retry logic with exponential backoff

### Slack Notifications

**Configuration:** `/tmp/agent-alerts/alert-rules.json`

```json
{
  "notificationChannels": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/T123/B456/xyz"
    }
  }
}
```

**Features:**
- Color-coded messages (red=critical, orange=warning, blue=info)
- Rich formatting with fields
- Attached metrics and context
- Direct channel/user delivery

**Creating Webhook URL:**

1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. App name: "Agents Monitor"
4. Workspace: Select your workspace
5. Go to "Incoming Webhooks"
6. Activate Incoming Webhooks
7. Add New Webhook to Workspace
8. Select channel and authorize
9. Copy webhook URL

### GitHub Notifications

**Configuration:** `/tmp/agent-alerts/alert-rules.json`

```json
{
  "notificationChannels": {
    "github": {
      "enabled": true,
      "autoCreateIssues": true
    }
  }
}
```

**Features:**
- Auto-creates issues for critical alerts
- Includes full metrics and context
- Color-coded labels
- Referenced by agent name

**Requirements:**
- GitHub personal access token with `repo` scope
- GITHUB_TOKEN environment variable set

---

## Deduplication

### How It Works

- **5-minute window** - Same alert for same agent won't trigger within 5 minutes
- **Rule + Agent ID** - Deduplication key is `rule-id + agent-id`
- **Prevents alert storms** - Multiple rapid failures only generate one alert

### Configuration

Update deduplication window in AlertManager initialization:

```javascript
const alertManager = new AlertManager({
  deduplicationWindow: 600000 // 10 minutes
});
```

---

## Alert History

### Storage

- **Location:** `/tmp/agent-alerts/alert-history.json`
- **Format:** JSON array of alert objects
- **Limit:** Last 1,000 alerts retained

### Query Alert History

```bash
# Show all alerts
agents-monitor alerts history

# Filter by severity
agents-monitor alerts history --severity critical
agents-monitor alerts history --severity warning
agents-monitor alerts history --severity info

# Filter by agent
agents-monitor alerts history --agent agent-email-processor

# Limit results
agents-monitor alerts history --limit 50
```

### Alert Object Structure

```json
{
  "id": "rule-id",
  "name": "Rule Display Name",
  "severity": "critical|warning|info",
  "agentId": "agent-identifier",
  "agentName": "Agent Name",
  "timestamp": 1609459200000,
  "message": "Formatted alert message",
  "metrics": {
    "status": "failed",
    "successRate": 0.75,
    "executionTime": 5000,
    "totalTokens": 10000
  }
}
```

### Clear History

```bash
agents-monitor alerts clear
```

---

## Statistics

View alert statistics:

```bash
agents-monitor alerts stats
```

**Output includes:**
- Total alerts recorded
- Alerts in last 24 hours
- Breakdown by severity (critical, warning, info)
- Breakdown by rule

---

## API Usage

### Python Integration

```python
import subprocess
import json

# Get recent alerts
result = subprocess.run(
    ["agents-monitor", "alerts", "list", "--limit", "10"],
    capture_output=True,
    text=True
)

# Parse alerts from output
alerts = json.loads(result.stdout)
```

### Node.js Integration

```javascript
const AlertManager = require('./lib/alerts');

const alertManager = new AlertManager();

// Evaluate rules
const alerts = alertManager.evaluateRules({
  agentId: 'agent-1',
  agentName: 'Email Processor',
  status: 'running',
  successRate: 0.85,
  executionTime: 5000,
  totalTokens: 25000,
});

// Send notifications
await alertManager.sendAlerts(alerts);

// Query history
const history = alertManager.getHistory({
  severity: 'critical',
  agentId: 'agent-1'
});

// Get stats
const stats = alertManager.getStatistics();
```

---

## Best Practices

### Rule Configuration

1. **Start Conservative** - Use high thresholds initially, lower over time
2. **Test Before Enabling** - Verify rules work on test data
3. **Document Thresholds** - Record why each threshold is set
4. **Regular Review** - Audit alerts monthly for false positives

### Notification Setup

1. **Dedicated Channels** - Use separate Slack channel for alerts
2. **Escalation** - Configure different severity levels to different channels
3. **Testing** - Send test alerts before production use
4. **Monitoring** - Track alert delivery success

### Production Use

1. **Redundancy** - Configure multiple notification channels
2. **On-call Rotation** - Ensure someone can respond to critical alerts
3. **Runbook** - Create response procedures for each alert type
4. **Metrics** - Track alert accuracy and response time

---

## Troubleshooting

### No Alerts Triggering

**Check:**
1. Alert rules enabled: `agents-monitor alerts rules`
2. Notification channels configured and enabled
3. Metrics being collected: `agents-monitor metrics`

### Missing Alerts in History

**Check:**
1. History file permissions: `ls -la /tmp/agent-alerts/`
2. Disk space: `df -h /tmp`
3. Clear history accidentally: `agents-monitor alerts clear`

### Notifications Not Sending

**Email:**
- SMTP configuration correct
- Recipients list not empty
- Network connectivity to SMTP server

**Slack:**
- Webhook URL valid and not expired
- Webhook not revoked
- Channel still exists

**GitHub:**
- Token has `repo` scope
- Repository exists and token has access
- GitHub API rate limit not exceeded

### Performance Issues

**Check:**
1. Number of alerts in history (over 1,000?)
2. Rule evaluation time complexity
3. Notification delivery time

---

## Advanced Configuration

### Custom Alert Rules Example

Monitor CPU and memory usage:

```json
{
  "id": "high-resource-usage",
  "name": "High Resource Usage",
  "severity": "warning",
  "condition": "cpuUsage > 80 || memoryUsage > 85",
  "enabled": true,
  "notifyOn": ["slack"]
}
```

Combined conditions for multi-factor alerts:

```json
{
  "id": "degraded-performance",
  "name": "Degraded Performance",
  "severity": "warning",
  "condition": "successRate < 0.7 && executionTime > 20000 && errorCount > 3",
  "enabled": true,
  "notifyOn": ["email", "slack"]
}
```

---

## References

- [AlertManager API](./ALERTS.md#api-usage)
- [Rule Examples](./ALERTS.md#writing-custom-rules)
- [Notification Channels](./ALERTS.md#notification-channels)
- [Testing Guide](./TESTING.md)

---

**Status:** ✅ Alert system ready for production
**Last Updated:** 2026-02-12
**Maintenance:** Update rules monthly based on metrics trends
