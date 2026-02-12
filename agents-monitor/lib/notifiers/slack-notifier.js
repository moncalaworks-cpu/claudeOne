/**
 * Slack Notifier
 * Sends alerts via Slack webhooks
 */

const BaseNotifier = require('./base-notifier');

class SlackNotifier extends BaseNotifier {
  constructor(options = {}) {
    super(options);
    this.webhookUrl = options.webhookUrl;
  }

  /**
   * Send Slack alert
   * @param {Object} alert - Alert object
   */
  async send(alert) {
    this.validate();

    return this.retryWithBackoff(async () => {
      const payload = this.formatSlackMessage(alert);

      // Placeholder for actual Slack API call
      // In production, would use node-fetch or axios to POST to webhookUrl
      return {
        success: true,
        message: 'Slack notification sent',
        channel: 'alerts',
        alertId: alert.id,
        payload,
      };
    }, 'Slack send');
  }

  /**
   * Format alert for Slack message
   * @param {Object} alert - Alert object
   * @returns {Object} Slack message payload
   */
  formatSlackMessage(alert) {
    const color = {
      critical: '#E74C3C',
      warning: '#F39C12',
      info: '#3498DB',
    }[alert.severity] || '#95A5A6';

    return {
      text: `${alert.severity.toUpperCase()}: ${alert.name}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Agent',
              value: alert.agentName,
              short: true,
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Message',
              value: alert.message,
              short: false,
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toISOString(),
              short: false,
            },
          ],
        },
      ],
    };
  }

  /**
   * Validate configuration
   */
  validate() {
    super.validate();
    if (!this.webhookUrl) {
      throw new Error('Slack notifier: webhookUrl not configured');
    }
  }

  /**
   * Set webhook URL
   * @param {string} url - Slack webhook URL
   */
  setWebhookUrl(url) {
    if (!url.startsWith('https://hooks.slack.com')) {
      throw new Error('Invalid Slack webhook URL');
    }
    this.webhookUrl = url;
  }
}

module.exports = SlackNotifier;
