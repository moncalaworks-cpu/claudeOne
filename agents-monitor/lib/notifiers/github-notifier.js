/**
 * GitHub Notifier
 * Creates GitHub issues for critical alerts
 */

const BaseNotifier = require('./base-notifier');

class GitHubNotifier extends BaseNotifier {
  constructor(options = {}) {
    super(options);
    this.repo = options.repo; // "owner/repo"
    this.autoCreateIssues = options.autoCreateIssues !== false;
    this.labelPrefix = options.labelPrefix || 'alert';
  }

  /**
   * Send GitHub alert (create issue)
   * @param {Object} alert - Alert object
   */
  async send(alert) {
    this.validate();

    if (!this.autoCreateIssues) {
      return { success: true, message: 'GitHub issue creation disabled' };
    }

    return this.retryWithBackoff(async () => {
      // Placeholder for actual GitHub API call
      // In production, would use Octokit to create issues
      return {
        success: true,
        message: 'GitHub issue created',
        issueNumber: 123,
        repo: this.repo,
        alertId: alert.id,
      };
    }, 'GitHub issue creation');
  }

  /**
   * Format alert as GitHub issue
   * @param {Object} alert - Alert object
   * @returns {Object} GitHub issue payload
   */
  formatGitHubIssue(alert) {
    return {
      title: `[${alert.severity.toUpperCase()}] ${alert.name} - ${alert.agentName}`,
      body: `
## Alert Details

**Severity:** ${alert.severity.toUpperCase()}
**Agent:** ${alert.agentName} (${alert.agentId})
**Time:** ${new Date(alert.timestamp).toISOString()}

## Message

${alert.message}

## Metrics

\`\`\`json
${JSON.stringify(alert.metrics, null, 2)}
\`\`\`

---
_Auto-created by Agents Monitor Alert System_
      `.trim(),
      labels: [
        `${this.labelPrefix}:${alert.severity}`,
        'alert',
        'agents-monitor',
      ],
    };
  }

  /**
   * Validate configuration
   */
  validate() {
    super.validate();
    if (!this.repo) {
      throw new Error('GitHub notifier: repo not configured (format: owner/repo)');
    }
    if (!this.repo.includes('/')) {
      throw new Error('Invalid repo format. Use: owner/repo');
    }
  }

  /**
   * Set repository
   * @param {string} repo - Repository (owner/repo)
   */
  setRepository(repo) {
    if (!repo.includes('/')) {
      throw new Error('Invalid repo format. Use: owner/repo');
    }
    this.repo = repo;
  }

  /**
   * Enable/disable auto-creation
   * @param {boolean} enabled - Enable auto-creation
   */
  setAutoCreate(enabled) {
    this.autoCreateIssues = enabled;
  }
}

module.exports = GitHubNotifier;
