# Scheduled Issue Automation on macOS

**Setup for automated GitHub issue analysis every 15 minutes**

---

## What It Does

The automated analyzer runs every 15 minutes and:

1. ✅ Fetches all open issues
2. ✅ Analyzes each with Claude (local, no API costs)
3. ✅ Automatically applies intelligent labels (phase, priority, type)
4. ✅ Assigns issues to you (@moncalaworks-cpu)
5. ✅ Sets status to "In Progress"
6. ✅ Posts analysis results as comments on each issue
7. ✅ Logs everything for debugging

**Cost:** $0 - Uses local Claude Code CLI

---

## Installation

### Step 1: Enable LaunchAgent

The plist file is already in place at:
```
~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

Load it into launchd:
```bash
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Step 2: Verify It's Running

```bash
# Check if service is loaded
launchctl list | grep claudeone

# Output should show:
# - com.claudeone.issue-analyzer
```

### Step 3: Monitor the Logs

Logs are written to:
```
~/.claudeone-automation/logs/analyzer.log
~/.claudeone-automation/logs/stdout.log
~/.claudeone-automation/logs/stderr.log
```

Watch logs in real-time:
```bash
tail -f ~/.claudeone-automation/logs/analyzer.log
```

---

## Common Commands

### Start the Service

```bash
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Stop the Service

```bash
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Check if Running

```bash
launchctl list | grep claudeone
```

### View Recent Logs

```bash
# Last 20 lines
tail -20 ~/.claudeone-automation/logs/analyzer.log

# Search for errors
grep ERROR ~/.claudeone-automation/logs/analyzer.log

# Last run details
tail -50 ~/.claudeone-automation/logs/analyzer.log
```

### Force Run Now (Testing)

```bash
/Users/kenshinzato/repos/claudeOne/agents/automated-issue-analyzer.sh
```

### Reload After Changes

```bash
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

---

## Troubleshooting

### Issue 1: Service Won't Start

**Problem:** `launchctl load` fails with "No such file or directory"

**Solution:**
```bash
# Verify file exists
ls -la ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist

# Check syntax
plutil -lint ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist

# If invalid, reload the plist from the repo
cp /Users/kenshinzato/repos/claudeOne/docs/../com.claudeone.issue-analyzer.plist ~/Library/LaunchAgents/
```

### Issue 2: Script Runs But Labels Don't Apply

**Problem:** Labels not showing up, but logs show "✅ Labels applied"

**Solution:**
```bash
# Check if you have permission to edit issues
gh auth status

# Verify labels exist in repo
gh label list --repo moncalaworks-cpu/claudeOne

# Check script output
tail -100 ~/.claudeone-automation/logs/analyzer.log | grep ERROR
```

### Issue 3: Running Too Frequently/Infrequently

**Problem:** Script runs more or less than every 15 minutes

**Solution:** Edit the plist file:
```bash
nano ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist

# Find this section and change the value:
# <key>StartInterval</key>
# <integer>900</integer>   ← This is in seconds (900 = 15 min)

# Other common intervals:
# 300 = 5 minutes
# 600 = 10 minutes
# 1800 = 30 minutes
# 3600 = 1 hour

# Then reload:
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Issue 4: Claude Code CLI Not Found

**Problem:** Error "command not found: claude"

**Solution:** Verify Claude Code is installed:
```bash
which claude

# If not found, install via:
# npm install -g @anthropic-ai/claude-code

# Or use full path in plist:
# /usr/local/bin/claude (adjust if installed elsewhere)
```

### Issue 5: GitHub Authentication Failed

**Problem:** "Error: authentication required"

**Solution:**
```bash
# Authenticate with GitHub CLI
gh auth login

# Verify token has repo access
gh auth status

# Test script can access issues
gh issue list --repo moncalaworks-cpu/claudeOne --state open
```

---

## How the Analysis Works

### Input
- Issue title and body
- Current labels (if any)

### Claude Analysis
Claude analyzes the issue and determines:
1. **Phase:** Which phase (1-mvp, 2-important, 3-nice-to-have)
2. **Priority:** Impact level (critical, high, medium, low)
3. **Type:** Category (feature, bug, documentation, testing)
4. **Confidence:** How certain (0-100%)
5. **Reasoning:** One-sentence explanation

### Output
Claude's analysis is automatically:
- ✅ Applied as labels in GitHub
- ✅ Assigned to you
- ✅ Posted as issue comment
- ✅ Logged locally

---

## Performance Notes

- **Analysis time:** ~30-60 seconds per issue (depends on Claude)
- **Delay between issues:** 2 seconds (API rate limiting)
- **For 10 issues:** ~3-5 minutes total runtime
- **Runs every:** 15 minutes
- **Max runtime:** Should complete before next run starts

### If Running Takes Too Long

If analysis takes >15 minutes and next run overlaps:

1. Check logs for slow issues:
   ```bash
   grep "Analyzing" ~/.claudeone-automation/logs/analyzer.log
   ```

2. Increase interval in plist to 30+ minutes

3. Limit number of issues analyzed:
   ```bash
   # Edit script and change --limit 100 to smaller number
   nano /Users/kenshinzato/repos/claudeOne/agents/automated-issue-analyzer.sh
   ```

---

## Monitoring Dashboard

Create a quick status check script:

```bash
#!/bin/bash
echo "=== claudeOne Automation Status ==="
echo ""
echo "Service Status:"
launchctl list | grep claudeone

echo ""
echo "Last 5 runs:"
tail -15 ~/.claudeone-automation/logs/analyzer.log | grep "Starting\|complete"

echo ""
echo "Recent errors:"
grep ERROR ~/.claudeone-automation/logs/analyzer.log | tail -3
```

---

## Customization

### Change Run Interval

Edit the plist:
```xml
<key>StartInterval</key>
<integer>900</integer>   <!-- Change this number -->
```

### Change Assignment

Edit the script:
```bash
ASSIGNEE="your-github-username"  <!-- Change this -->
```

### Change Repository

Edit the script:
```bash
OWNER="your-owner"      <!-- Change this -->
REPO="your-repo-name"   <!-- Change this -->
```

After changes, reload:
```bash
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

---

## Disabling/Pausing

### Temporarily Pause (without unloading)

```bash
# Just comment out in launchctl (would need to unload anyway)
# Better: temporarily move the file
mv ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist ~/Desktop/

# When ready to resume:
mv ~/Desktop/com.claudeone.issue-analyzer.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

### Permanently Disable

```bash
launchctl unload ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
rm ~/Library/LaunchAgents/com.claudeone.issue-analyzer.plist
```

---

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Claude Code CLI | $0 | Already paid, local execution |
| GitHub Actions | $0 | Not used in this approach |
| GitHub API (gh CLI) | $0 | Included with repo access |
| **Total per 15 min** | **$0** | Completely free |
| **Per 24 hours** | **$0** | 96 runs × $0 = $0 |

---

## What Gets Logged

Each run logs:
```
[2026-02-12 15:30:00] [INFO] ============================================
[2026-02-12 15:30:00] [INFO] Starting automated issue analyzer
[2026-02-12 15:30:00] [INFO] Repository: moncalaworks-cpu/claudeOne
[2026-02-12 15:30:00] [INFO] Found 5 open issues
[2026-02-12 15:30:02] [INFO] Analyzing issue #1: Add feature X
[2026-02-12 15:30:02] [INFO]   Phase: 1-mvp | Priority: high | Type: feature
[2026-02-12 15:30:03] [INFO]   ✅ Labels applied
[2026-02-12 15:30:03] [INFO]   ✅ Assigned
[2026-02-12 15:30:04] [INFO]   ✅ Comment posted
... (repeat for each issue)
[2026-02-12 15:32:10] [INFO] Processing complete: 5 succeeded, 0 failed
[2026-02-12 15:32:10] [INFO] ============================================
[2026-02-12 15:32:10] [INFO] Analyzer run complete
```

---

## Integration with GitHub Projects

The automation works with GitHub Projects:

1. **Labels Applied:** Issues get phase/priority/type labels
2. **Status Field:** "status-in-progress" label added
3. **Assigned:** All assigned to you
4. **Comments:** Analysis visible on each issue

On your GitHub Projects board, you'll see:
- ✅ Issues automatically labeled
- ✅ Issues assigned to you
- ✅ Issues moved to "In Progress" column
- ✅ Analysis details in comments

---

## Next Steps

1. **Verify Setup:**
   ```bash
   launchctl list | grep claudeone
   ```

2. **Wait for First Run** (up to 15 minutes)

3. **Check Results:**
   ```bash
   tail -50 ~/.claudeone-automation/logs/analyzer.log
   ```

4. **Monitor Logs Regularly:**
   ```bash
   watch -n 5 'tail -20 ~/.claudeone-automation/logs/analyzer.log'
   ```

5. **Adjust as Needed:**
   - Change interval (plist)
   - Change assignee (script)
   - Change repository (script)

---

**Status:** ✅ Ready to use | **Cost:** $0 | **Automation:** Fully automatic

For questions, see `.cursorrules` and `CLAUDE.md` for best practices.
