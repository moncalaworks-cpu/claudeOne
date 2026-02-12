/**
 * Base Notifier
 * Abstract base class for notification channels
 */

class BaseNotifier {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Send notification (to be implemented by subclasses)
   * @param {Object} _alert - Alert object
   */
  async send(_alert) {
    throw new Error('send() must be implemented by subclass');
  }

  /**
   * Format alert for notification
   * @param {Object} alert - Alert object
   * @returns {string} Formatted message
   */
  formatAlert(alert) {
    return `
[${alert.severity.toUpperCase()}] ${alert.name}
Agent: ${alert.agentName} (${alert.agentId})
Time: ${new Date(alert.timestamp).toISOString()}
Message: ${alert.message}
    `.trim();
  }

  /**
   * Retry logic with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {string} context - Context for error logging
   */
  async retryWithBackoff(fn, context = 'operation') {
    let lastError;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < this.retryAttempts - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${context} failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Validate configuration
   */
  validate() {
    if (!this.enabled) {
      throw new Error('Notifier is not enabled');
    }
  }
}

module.exports = BaseNotifier;
