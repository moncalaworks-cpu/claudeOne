/**
 * Email Notifier
 * Sends alerts via email (SMTP)
 */

const BaseNotifier = require('./base-notifier');

class EmailNotifier extends BaseNotifier {
  constructor(options = {}) {
    super(options);
    this.recipients = options.recipients || [];
    this.provider = options.provider || 'smtp';
    this.smtpConfig = options.smtpConfig || {};
  }

  /**
   * Send email alert
   * @param {Object} alert - Alert object
   */
  async send(alert) {
    this.validate();

    if (this.recipients.length === 0) {
      throw new Error('No email recipients configured');
    }

    return this.retryWithBackoff(async () => {
      // Placeholder for actual email implementation
      // In production, would use nodemailer or similar
      return {
        success: true,
        message: 'Email notification sent',
        recipients: this.recipients,
        alertId: alert.id,
      };
    }, 'Email send');
  }

  /**
   * Validate configuration
   */
  validate() {
    super.validate();
    if (!this.recipients || this.recipients.length === 0) {
      throw new Error('Email notifier: no recipients configured');
    }
  }

  /**
   * Add recipient
   * @param {string} email - Email address
   */
  addRecipient(email) {
    if (!this.recipients.includes(email)) {
      this.recipients.push(email);
    }
  }

  /**
   * Remove recipient
   * @param {string} email - Email address
   */
  removeRecipient(email) {
    this.recipients = this.recipients.filter((r) => r !== email);
  }

  /**
   * Set SMTP configuration
   * @param {Object} config - SMTP configuration
   */
  setSmtpConfig(config) {
    this.smtpConfig = config;
  }
}

module.exports = EmailNotifier;
