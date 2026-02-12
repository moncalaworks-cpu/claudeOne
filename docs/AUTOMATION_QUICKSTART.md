# Quick Start: Scheduled Issue Automation (macOS)

Get automated GitHub issue analysis running in 2 minutes.

---

## One-Time Setup

### Step 1: Activate the Scheduler (90 seconds)

```bash
# Load the automation into macOS
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist

# Verify it's running
launchctl list | grep claudeone
```

✅ Done! The service is now running.

---

## What Happens Next

- ⏰ Every 15 minutes, the script runs automatically
- 🔍 Fetches all open GitHub issues
- 🤖 Analyzes each with Claude (local, no API calls)
- 🏷️ Applies intelligent labels (phase, priority, type)
- 📌 Assigns issues to you (@moncalaworks-cpu)
- 📝 Posts analysis as issue comments
- 📊 Logs everything to: `~/.claudeone-automation/logs/analyzer.log`

---

## Monitor the Automation

### Watch logs live (opens in Terminal):

```bash
tail -f ~/.claudeone-automation/logs/analyzer.log
```

### Check status anytime:

```bash
# Is it running?
launchctl list | grep claudeone

# See last 20 lines of activity
tail -20 ~/.claudeone-automation/logs/analyzer.log

# Check for errors
grep ERROR ~/.claudeone-automation/logs/analyzer.log
```

### Test manually (run now):

```bash
# Force run immediately (useful for testing)
/Users/kenshinzato/repos/claudeOne/agents/automated-issue-analyzer.sh
```

---

## Control the Automation

### Stop it temporarily:

```bash
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Resume it:

```bash
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Change run frequency (optional):

Edit the plist file and reload:

```bash
# Edit (change <integer>900</integer> to your desired seconds)
nano ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist

# Then reload
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

Common intervals:
- 300 = 5 minutes
- 600 = 10 minutes
- 900 = 15 minutes (default) ✅
- 1800 = 30 minutes
- 3600 = 1 hour

---

## Full Documentation

For detailed setup, troubleshooting, and customization:

📖 **See:** `docs/SCHEDULED_AUTOMATION_MACOS.md`

---

## Cost

| What | Cost |
|------|------|
| Claude Code CLI (local) | $0 |
| GitHub API calls | $0 |
| Infrastructure | $0 |
| **Total per hour** | **$0** |

---

## That's It! ✨

Your issues are now being automatically analyzed and labeled every 15 minutes. Check your GitHub Projects board in a few minutes to see the magic happen.

**Questions?** Check `docs/SCHEDULED_AUTOMATION_MACOS.md` → Troubleshooting section.
