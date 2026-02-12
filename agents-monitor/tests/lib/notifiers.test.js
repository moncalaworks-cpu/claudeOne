/**
 * Notifier Tests
 * Testing notification channels (Email, Slack, GitHub)
 */

const BaseNotifier = require('../../lib/notifiers/base-notifier');
const EmailNotifier = require('../../lib/notifiers/email-notifier');
const SlackNotifier = require('../../lib/notifiers/slack-notifier');
const GitHubNotifier = require('../../lib/notifiers/github-notifier');

describe('BaseNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new BaseNotifier({ enabled: true });
  });

  it('should have enabled property', () => {
    expect(notifier.enabled).toBe(true);
  });

  it('should format alert text', () => {
    const alert = {
      severity: 'critical',
      name: 'Agent Failure',
      agentName: 'Email Processor',
      agentId: 'agent-1',
      timestamp: 1609459200000,
      message: 'Agent has failed',
    };

    const formatted = notifier.formatAlert(alert);

    expect(formatted).toContain('CRITICAL');
    expect(formatted).toContain('Agent Failure');
    expect(formatted).toContain('Email Processor');
  });

  it('should throw on send() (abstract method)', async () => {
    const alert = { id: 'test', name: 'Test' };

    await expect(notifier.send(alert)).rejects.toThrow('send() must be implemented');
  });
});

describe('EmailNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new EmailNotifier({
      enabled: true,
      recipients: ['test@example.com', 'admin@example.com'],
    });
  });

  it('should initialize with recipients', () => {
    expect(notifier.recipients).toContain('test@example.com');
    expect(notifier.recipients).toContain('admin@example.com');
  });

  it('should add recipients', () => {
    notifier.addRecipient('new@example.com');

    expect(notifier.recipients).toContain('new@example.com');
  });

  it('should not add duplicate recipients', () => {
    const initialCount = notifier.recipients.length;
    notifier.addRecipient('test@example.com');

    expect(notifier.recipients.length).toBe(initialCount);
  });

  it('should remove recipients', () => {
    notifier.removeRecipient('test@example.com');

    expect(notifier.recipients).not.toContain('test@example.com');
  });

  it('should send email alert', async () => {
    const alert = {
      id: 'test-rule',
      name: 'Test Alert',
      severity: 'warning',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      timestamp: Date.now(),
      message: 'Test message',
    };

    const result = await notifier.send(alert);

    expect(result.success).toBe(true);
    expect(result.recipients).toContain('test@example.com');
  });

  it('should validate recipients are configured', async () => {
    notifier.recipients = [];

    const alert = { id: 'test', name: 'Test' };

    await expect(notifier.send(alert)).rejects.toThrow('no recipients');
  });

  it('should set SMTP configuration', () => {
    const config = { host: 'smtp.example.com', port: 587 };

    notifier.setSmtpConfig(config);

    expect(notifier.smtpConfig).toEqual(config);
  });
});

describe('SlackNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new SlackNotifier({
      enabled: true,
      webhookUrl: 'https://hooks.slack.com/services/T123/B456/xyz',
    });
  });

  it('should initialize with webhook URL', () => {
    expect(notifier.webhookUrl).toBe('https://hooks.slack.com/services/T123/B456/xyz');
  });

  it('should format alert for Slack', () => {
    const alert = {
      severity: 'critical',
      name: 'Agent Failure',
      agentId: 'agent-1',
      agentName: 'Email Processor',
      timestamp: Date.now(),
      message: 'Agent has failed',
    };

    const formatted = notifier.formatSlackMessage(alert);

    expect(formatted).toHaveProperty('attachments');
    expect(formatted.attachments[0].color).toBe('#E74C3C'); // critical color
    expect(formatted.attachments[0].fields[1].value).toBe('CRITICAL');
  });

  it('should format warning severity with yellow color', () => {
    const alert = {
      severity: 'warning',
      name: 'Slow Execution',
      agentId: 'agent-1',
      agentName: 'Agent',
      timestamp: Date.now(),
      message: 'Execution time exceeded',
    };

    const formatted = notifier.formatSlackMessage(alert);

    expect(formatted.attachments[0].color).toBe('#F39C12'); // warning color
  });

  it('should format info severity with blue color', () => {
    const alert = {
      severity: 'info',
      name: 'High Token Usage',
      agentId: 'agent-1',
      agentName: 'Agent',
      timestamp: Date.now(),
      message: 'Token usage high',
    };

    const formatted = notifier.formatSlackMessage(alert);

    expect(formatted.attachments[0].color).toBe('#3498DB'); // info color
  });

  it('should send Slack notification', async () => {
    const alert = {
      id: 'test-rule',
      name: 'Test Alert',
      severity: 'warning',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      timestamp: Date.now(),
      message: 'Test message',
    };

    const result = await notifier.send(alert);

    expect(result.success).toBe(true);
    expect(result.channel).toBe('alerts');
  });

  it('should validate webhook URL is configured', async () => {
    notifier.webhookUrl = null;

    const alert = { id: 'test', name: 'Test' };

    await expect(notifier.send(alert)).rejects.toThrow('webhookUrl not configured');
  });

  it('should validate webhook URL format', () => {
    expect(() => {
      notifier.setWebhookUrl('https://invalid.com/webhook');
    }).toThrow('Invalid Slack webhook URL');
  });

  it('should set valid webhook URL', () => {
    const url = 'https://hooks.slack.com/services/T123/B789/abc';

    notifier.setWebhookUrl(url);

    expect(notifier.webhookUrl).toBe(url);
  });
});

describe('GitHubNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new GitHubNotifier({
      enabled: true,
      repo: 'owner/repo',
      autoCreateIssues: true,
    });
  });

  it('should initialize with repository', () => {
    expect(notifier.repo).toBe('owner/repo');
  });

  it('should format alert as GitHub issue', () => {
    const alert = {
      id: 'test-rule',
      name: 'Agent Failure',
      severity: 'critical',
      agentId: 'agent-1',
      agentName: 'Email Processor',
      timestamp: Date.now(),
      message: 'Agent has failed',
      metrics: { status: 'failed', exitCode: 1 },
    };

    const formatted = notifier.formatGitHubIssue(alert);

    expect(formatted.title).toContain('CRITICAL');
    expect(formatted.title).toContain('Agent Failure');
    expect(formatted.title).toContain('Email Processor');
    expect(formatted.body).toContain('Alert Details');
    expect(formatted.labels).toContain('alert:critical');
  });

  it('should create GitHub issue', async () => {
    const alert = {
      id: 'test-rule',
      name: 'Test Alert',
      severity: 'warning',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      timestamp: Date.now(),
      message: 'Test message',
      metrics: {},
    };

    const result = await notifier.send(alert);

    expect(result.success).toBe(true);
    expect(result.repo).toBe('owner/repo');
  });

  it('should not create issue if auto-create disabled', async () => {
    notifier.setAutoCreate(false);

    const alert = {
      id: 'test-rule',
      name: 'Test Alert',
      severity: 'critical',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      timestamp: Date.now(),
      message: 'Test message',
      metrics: {},
    };

    const result = await notifier.send(alert);

    expect(result.success).toBe(true);
    expect(result.message).toBe('GitHub issue creation disabled');
  });

  it('should validate repository format', () => {
    expect(() => {
      notifier.setRepository('invalid-format');
    }).toThrow('Invalid repo format');
  });

  it('should validate repository is configured', () => {
    notifier.repo = null;

    const alert = { id: 'test', name: 'Test' };

    expect(() => {
      notifier.validate();
    }).toThrow('repo not configured');
  });

  it('should set valid repository', () => {
    notifier.setRepository('newowner/newrepo');

    expect(notifier.repo).toBe('newowner/newrepo');
  });

  it('should enable/disable auto-creation', () => {
    notifier.setAutoCreate(false);
    expect(notifier.autoCreateIssues).toBe(false);

    notifier.setAutoCreate(true);
    expect(notifier.autoCreateIssues).toBe(true);
  });
});
