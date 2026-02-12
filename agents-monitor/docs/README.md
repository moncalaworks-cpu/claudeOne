# Agents Monitor - CLI Dashboard

Real-time monitoring dashboard for Claude Code agents with performance metrics, log viewing, and GitHub integration.

## Features

- ✅ **Real-time Agent Monitoring** - Track active agents and their status
- ✅ **Performance Metrics** - Execution time, token usage, success rates
- ✅ **Log Viewer** - Filter and search agent logs
- ✅ **Resource Charts** - Visual representation of agent performance
- ✅ **Alert Configuration** - Configure alerts for errors and slowdowns
- ✅ **GitHub Integration** - Link agents to GitHub issues
- ✅ **CLI and Web Interfaces** - Terminal or browser-based monitoring

## Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Make CLI executable
chmod +x src/index.js

# Optional: Link globally
npm link
```

## Usage

### Start the Dashboard

```bash
# Start interactive dashboard
npm start

# Or with custom options
npm start -- --port 3000 --refresh 1000

# Run in development mode
npm run dev
```

### CLI Commands

```bash
# List active agents
npm run agents

# View logs for a specific agent
npm run logs <agent-name> --lines 50 --filter "ERROR"

# Show performance metrics
npm run metrics

# Start monitoring dashboard
npm start
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `q` / `Ctrl+C` | Quit |
| `r` | Refresh |
| `Tab` | Next panel |
| `Shift+Tab` | Previous panel |
| `?` / `h` | Show help |

## Dashboard Panels

### Active Agents (Left Top)
- Lists all running Claude Code agents
- Shows token usage per agent
- Status indicators (🟢 running, 🔴 failed, 🟡 idle)

### Metrics (Right Top)
- Total agents and active count
- Success rate percentage
- Average execution time
- Total tokens used

### Performance (Right Middle)
- Visual bar charts for:
  - Execution time
  - Token usage
  - Success rate

### Recent Logs (Bottom)
- Scrollable log viewer
- Real-time updates
- Filter and search capabilities

## Configuration

Create `.env` file in project root:

```env
# GitHub integration
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=moncalaworks-cpu
GITHUB_REPO=claudeOne

# Monitor settings
LOGS_DIR=~/.claudeone-automation/logs
AGENTS_FILE=~/.claudeone-automation/agents.json

# Dashboard settings
REFRESH_INTERVAL=1000
PORT=3000
```

## API Reference

### Dashboard Class

```javascript
const Dashboard = require('./lib/dashboard');

const dashboard = new Dashboard({
  port: 3000,
  refresh: 1000
});

await dashboard.init();
await dashboard.start();
```

### AgentMonitor Class

```javascript
const AgentMonitor = require('./lib/agents');

const monitor = new AgentMonitor();

// Get active agents
const agents = await monitor.getActiveAgents();

// Get agent metrics
const metrics = await monitor.getAgentMetrics('agent-name');

// Get agent logs
const logs = await monitor.getAgentLogs('agent-name', {
  lines: 50,
  filter: 'ERROR'
});
```

### MetricsCollector Class

```javascript
const MetricsCollector = require('./lib/metrics');

const collector = new MetricsCollector();

// Get aggregated metrics
const metrics = await collector.getMetrics();

// Get health status
const health = await collector.getHealthStatus();

// Get metrics by time range
const rangeMetrics = await collector.getMetricsByTimeRange(
  startDate,
  endDate
);
```

## Features Roadmap

### Phase 1 (Current)
- [x] CLI dashboard interface
- [x] Agent status monitoring
- [x] Real-time metrics
- [x] Log viewer
- [ ] Alert configuration

### Phase 2
- [ ] Web dashboard (Node + Express)
- [ ] GitHub Issues integration
- [ ] Resource utilization tracking
- [ ] Email/Slack alerts

### Phase 3
- [ ] Historical analytics
- [ ] Performance trending
- [ ] Agent profiling
- [ ] Cost analysis (token usage)

## Troubleshooting

### Dashboard won't start
```bash
# Check dependencies
npm install

# Verify Node version
node --version  # Should be 14+

# Check log directory
ls -la ~/.claudeone-automation/logs/
```

### No agents showing
```bash
# Verify agents file exists
cat ~/.claudeone-automation/agents.json

# Check automated analyzer is running
launchctl list | grep claudeone

# View analyzer logs
tail -f ~/.claudeone-automation/logs/analyzer.log
```

### Low performance metrics
- Check system resources
- Verify GitHub API rate limits
- Reduce refresh interval (use --refresh 2000 instead of 1000)

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
# Install production dependencies only
npm install --production

# Create executable bundle
npm run build
```

## Architecture

```
src/
├── index.js          # CLI entry point
lib/
├── dashboard.js      # Terminal UI using blessed
├── agents.js         # Agent tracking and management
└── metrics.js        # Metrics collection and analysis
config/
└── config.json       # Configuration schema
data/
└── agents.json       # Persisted agent data
docs/
└── README.md         # This file
```

## Performance Notes

- Dashboard updates every 1 second by default
- Metrics are cached for 5 seconds
- Log files are read on-demand (configurable line limit)
- Blessed library provides optimized terminal rendering

## Security Considerations

- GitHub tokens stored in `.env` (never commit)
- Agent logs may contain sensitive information
- Restrict access to monitor on shared systems
- Audit log access via GitHub audit logs

## Contributing

See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.

## License

MIT - See LICENSE file

## Related Documentation

- [REQ-011: Agent Monitoring Dashboard](../../REQUIREMENTS.md#req-011)
- [Automated Analyzer](../../agents/automated-issue-analyzer.sh)
- [Agentic Workflows Guide](../../my-agentic-code-project/docs/Claude_Code_Agentic_Workflows_Guide.md)

---

**Status:** In Development | **Version:** 1.0.0 | **Last Updated:** 2026-02-12
