# Automation Guide: GitHub Actions + Local Claude Code CLI

**Created:** 2026-02-12
**Updated:** 2026-02-12

This guide explains the two-tier automation system for managing GitHub issues:
1. **GitHub Actions** - Simple, built-in automation (FREE, automatic)
2. **Local Claude Code CLI** - Intelligent, AI-powered analysis (FREE, on-demand)

**Cost:** ✅ ZERO API costs - Everything uses free tools or already-paid Claude Code CLI

---

## Part 1: GitHub Actions Workflows

GitHub Actions automatically handle routine tasks when issues are created or PRs are merged.

### 🤖 What GitHub Actions Do

| Workflow | Trigger | Action | Result |
|----------|---------|--------|--------|
| **auto-assign-issues** | Issue opened | Assigns issue to sender | You own what you create |
| **auto-label-requirements** | Issue opened/edited | Adds phase + type labels | Issues auto-categorized by REQ code |
| **auto-create-branch** | Issue assigned | Creates feature branch | Branch ready to work on |
| **auto-update-project** | PR opened/merged | Updates issue status labels | Board stays in sync with PRs |

### ✅ Workflows Available

**File:** `.github/workflows/`

#### 1. auto-assign-issues.yml
```yaml
Trigger: Issue created
Action: Assigns to issue creator (you)
Labels: None
Result: You automatically own new issues
```

#### 2. auto-label-requirements.yml
```yaml
Trigger: Issue opened or title edited
Action: Reads title for REQ-XXX pattern
Results:
  - REQ-001 to REQ-004 → phase-1-mvp
  - REQ-005 to REQ-007 → phase-2-important
  - REQ-008 to REQ-010 → phase-3-nice-to-have
  - Title contains "doc/guide" → type-documentation
```

#### 3. auto-create-branch.yml
```yaml
Trigger: Issue assigned
Action: Creates feature branch from issue title
Example: Issue "REQ-001: Workflows Guide" → Branch "req-001-workflows-guide"
Result: Ready to work - just checkout the branch
```

#### 4. auto-update-project.yml
```yaml
Trigger: PR opened or merged
Action: Updates linked issue status
  - PR opened → status-in-progress label
  - PR merged → status-in-review label (issue auto-closes)
Result: Project board stays synchronized
```

### 🔧 How to Use GitHub Actions

**You don't need to do anything!** They run automatically when:
1. You create an issue
2. You edit an issue title
3. You assign an issue
4. You create a PR that references an issue (with "Closes #123")

### ⚙️ Customizing GitHub Actions

To modify workflows, edit files in `.github/workflows/`:

**Example: Change auto-label thresholds**
```yaml
# Current: REQ-001-004 are Phase 1
if [[ "$TITLE" =~ REQ-00[1-4] ]]; then
  gh issue edit $ISSUE_NUM --add-label "phase-1-mvp"
fi

# New: REQ-001-005 are Phase 1
if [[ "$TITLE" =~ REQ-00[1-5] ]]; then
  gh issue edit $ISSUE_NUM --add-label "phase-1-mvp"
fi
```

---

## Part 2: Local Claude Code CLI Analysis (No API Costs!)

For decisions that require judgment, use **Claude Code CLI locally** with the issue analyzer script.

### 🧠 What the Local Analysis Does

Reads issue content and uses Claude (already paid) to decide:
- ✅ What phase (1, 2, or 3) based on complexity
- ✅ What priority (critical, high, medium, low) based on urgency
- ✅ What type (feature, documentation, testing, bug) based on nature
- ✅ What labels to apply based on content analysis
- ✅ Related requirements (REQ-001, REQ-002, etc.)
- ✅ Estimated effort (Low, Medium, High)
- ✅ Confidence level in the assessment

**Cost:** FREE (uses Claude Code CLI you already have, no API calls)

### 📦 Setup

#### Prerequisites (Already Done!)
```bash
# Claude Code CLI already installed
claude --version

# GitHub CLI already configured
gh auth status
```

#### One-time Setup
```bash
# Make script executable
chmod +x agents/analyze-issue-local.sh

# Verify it works
./agents/analyze-issue-local.sh --help
```

### 🚀 Usage: Analyze an Issue

#### Simple Command
```bash
# Analyze issue #2 with Claude Code CLI
./agents/analyze-issue-local.sh 2

# This will:
# 1. Fetch issue details from GitHub
# 2. Open Claude Code with analysis prompt
# 3. You interact with Claude to get recommendations
# 4. Copy suggestions and apply manually
```

#### With Custom Owner/Repo
```bash
# Analyze issue #5 in specific repo
./agents/analyze-issue-local.sh 5 moncalaworks-cpu claudeOne
```

#### Batch Analysis
```bash
# Analyze multiple issues
for i in {1..5}; do
  ./agents/analyze-issue-local.sh $i
done
```

### 📊 How It Works

```
You run: ./agents/analyze-issue-local.sh 2
         ↓
Script fetches issue #2 from GitHub
         ↓
Creates analysis prompt (no API call)
         ↓
Opens Claude Code CLI with the prompt
         ↓
You chat with Claude about the issue
  "What phase should this be?"
  "Is this high priority?"
  "What labels make sense?"
         ↓
Claude suggests labels and reasoning
         ↓
You copy the suggestions
         ↓
You apply with: gh issue edit 2 --add-label "..."
```

### 📋 Example Session

```bash
$ ./agents/analyze-issue-local.sh 2

🔍 Fetching issue #2 from moncalaworks-cpu/claudeOne...
✅ Fetched: [REQ-002] CRAFT Prompt Engineering Framework

📝 Analysis prompt created: /tmp/issue-2-analysis.md

🚀 Starting Claude Code analysis session...

════════════════════════════════════════════════════════════

You: What phase should this requirement be?

Claude: Based on the description, this is Phase 2 (Important).
It's documentation for the CRAFT framework which is referenced
by other requirements, so it's important but not blocking MVP.

You: What priority and labels?

Claude:
Phase: phase-2-important
Priority: priority-high (needed for Phase 2 success)
Type: type-documentation
Status: status-ready

Suggested labels to add:
- phase-2-important
- priority-high
- type-documentation
- status-ready

Confidence: 92%

Related to: REQ-001, REQ-003

════════════════════════════════════════════════════════════

✅ Analysis complete!

Next steps:
1. Review the analysis above
2. Copy the suggested labels
3. Apply to issue: gh issue edit 2 --add-label "phase-2-important" --add-label "priority-high"
```

### 💾 Save Your Analysis

After the Claude Code session, save notes:

```bash
# Create analysis notes file
cat > .github/issue-analysis-2.md << 'EOF'
# Issue #2 Analysis

**Analyzed:** 2026-02-12
**Issue:** [REQ-002] CRAFT Prompt Engineering Framework

## Recommendations
- Phase: phase-2-important
- Priority: priority-high
- Type: type-documentation
- Related: REQ-001, REQ-003
- Effort: Medium
- Confidence: 92%

## Applied Labels
- phase-2-important
- priority-high
- type-documentation
- status-ready

## Notes
This is documentation work critical for Phase 2.
Referenced by multiple other requirements.
EOF
```

### 🔄 Workflow Integration

**Typical workflow with local analysis:**

1. **GitHub Actions auto-labels** basic issues (REQ-XXX pattern) ✅ Automatic
2. **You review** the automated labels ✅ Manual
3. **For complex issues**, run the local analyzer:
   ```bash
   ./agents/analyze-issue-local.sh 2
   ```
4. **Claude (via CLI) suggests** more nuanced labels ✅ Interactive
5. **You review suggestions** in the Claude Code session ✅ Manual
6. **You apply labels** with gh CLI:
   ```bash
   gh issue edit 2 --add-label "phase-2-important,priority-high"
   ```

---

## Combined Workflow Example

Let's say you create a new issue #5: "Documentation: Add quick reference card"

### Step 1: GitHub Actions (Automatic)
```
✓ Issue #5 created
✓ Auto-assigned to you
✓ Auto-labeled: phase-2-important, type-documentation (from "Documentation")
✓ Branch created: issue-005-documentation-quick-reference-card
```

### Step 2: Claude Agent (Optional Enhancement)
```bash
python agents/github_issue_analyzer.py --issue 5

# Output:
# Phase: 2-important ✓ (Correct)
# Priority: medium (Suggests: high, because it's quick reference)
# Type: documentation ✓ (Correct)
# Effort: Low
# Confidence: 94%
#
# Recommendation: Add priority-high label
```

### Step 3: You Decide
```bash
# Either accept and apply:
python agents/github_issue_analyzer.py --issue 5 --apply-labels

# Or adjust manually:
gh issue edit 5 --add-label "priority-high" --remove-label "priority-medium"
```

---

## 📋 Best Practices

### When to Use GitHub Actions
- Creating new issues (auto-assign + auto-label)
- Working on issues (branch auto-created)
- Completing work (PR auto-updates board)

### When to Use Local Claude Code Analysis
- Issue came from external source (doesn't follow REQ-XXX pattern)
- Complex requirement that needs judgment
- Deciding between two priorities
- Finding related requirements
- Estimating effort
- Reviewing quality before starting work
- **Whenever you want:** It's FREE! No API costs, just use your local Claude Code CLI

### Automation Levels

| Level | What's Automated | Manual Steps | Cost |
|-------|-----------------|--------------|------|
| **Minimal** | Just GitHub Actions | Review & adjust labels if needed | FREE |
| **Standard** | Actions + Local Claude Code for complex issues | Run script, review Claude suggestions, apply labels | FREE |
| **Maximum** | Actions + Local Claude Code for all issues | Run script on every issue, apply suggestions | FREE |

**All options are FREE** - No API costs!

---

## 🐛 Troubleshooting

### GitHub Actions Not Running

**Problem:** Workflows not triggering on issue create
**Solution:**
- Check `.github/workflows/` files exist
- Verify GitHub Actions enabled: Settings → Actions → General
- Check permissions: Settings → Actions → General → Workflow permissions → "Read and write"

### Local Script Not Running

**Problem:** `./agents/analyze-issue-local.sh: permission denied`
**Solution:**
```bash
# Make script executable
chmod +x agents/analyze-issue-local.sh

# Try again
./agents/analyze-issue-local.sh 2
```

**Problem:** `gh: could not resolve hostname` or GitHub CLI error
**Solution:**
```bash
# Check GitHub CLI is authenticated
gh auth status

# If not, login
gh auth login
```

**Problem:** Script says "Could not fetch issue #X"
**Solution:**
- Verify issue exists: `gh issue view X`
- Check repo is correct: `gh issue view X --repo owner/repo`
- Verify you have access

### Claude Code Not Opening

**Problem:** `claude: command not found`
**Solution:**
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Or verify it's installed
which claude
claude --version
```

### Labels Not Applied After Analysis

**Problem:** You reviewed Claude's suggestions but forgot to apply them
**Solution:**
```bash
# Apply the labels manually
gh issue edit 2 --add-label "phase-2-important" --add-label "priority-high"

# Check they were applied
gh issue view 2 --json labels
```

---

## 📚 Advanced Usage

### Batch Analysis Script

Analyze multiple issues at once:

```bash
# Create a batch analysis script
cat > analyze-batch.sh << 'EOF'
#!/bin/bash
# Analyze issues 1-5
for i in {1..5}; do
  echo ""
  echo "═════════════════════════════════════════"
  echo "Issue #$i"
  echo "═════════════════════════════════════════"
  ./agents/analyze-issue-local.sh $i
  echo ""
  read -p "Press Enter to continue to next issue..."
done
EOF

# Make it executable
chmod +x analyze-batch.sh

# Run it
./analyze-batch.sh
```

### Automated Label Application

After reviewing Claude's suggestions:

```bash
# Create a function in your shell
apply-issue-labels() {
  local ISSUE=$1
  local LABELS=$2
  gh issue edit $ISSUE --add-label "$LABELS"
  echo "✓ Applied labels to issue #$ISSUE"
}

# Usage:
apply-issue-labels 2 "phase-2-important,priority-high"
```

### Schedule Regular Analysis

Using cron (macOS/Linux):

```bash
# Add to crontab: crontab -e
# Analyze new Phase 1 issues every morning at 9 AM
0 9 * * * cd /Users/kenshinzato/repos/claudeOne && ./agents/analyze-issue-local.sh 1 && ./agents/analyze-issue-local.sh 2 && ./agents/analyze-issue-local.sh 3 && ./agents/analyze-issue-local.sh 4
```

### Custom Analysis Prompt

Modify the analysis script to ask different questions:

```bash
# Edit agents/analyze-issue-local.sh
# Change the PROMPT variable to your custom questions

PROMPT="Analyze this issue for:
1. Security implications?
2. Breaking changes?
3. Documentation needed?
..."
```

---

## 📊 Monitoring Automation

### Check GitHub Actions History

```bash
# View recent GitHub Actions runs
gh run list --repo moncalaworks-cpu/claudeOne

# View details of specific run
gh run view <run-id> --repo moncalaworks-cpu/claudeOne

# Check if auto-label, auto-assign, auto-branch workflows ran
gh run list --workflow auto-label-requirements.yml
```

### Audit Trail

All analyses documented in `.github/issue-analysis-*.md`:

```bash
# View all manual analyses
ls .github/issue-analysis-*.md

# Check specific analysis
cat .github/issue-analysis-2.md
```

### Cost Tracking

```bash
# No API costs! Everything is free:
# ✓ GitHub Actions (free)
# ✓ GitHub CLI (free)
# ✓ Claude Code CLI (already paid, local use)

# You'll never see API charges for issue analysis
```

---

## 🎯 Next Steps

1. **Verify GitHub Actions work:**
   - Create test issue: "REQ-002: Test Issue"
   - Check if auto-labeled and assigned

2. **Test Claude Agent:**
   - Run: `python agents/github_issue_analyzer.py --issue 2`
   - Review the analysis
   - Decide if suggestions are good

3. **Fine-tune workflows:**
   - Adjust labels if needed
   - Modify phase thresholds
   - Add new patterns

4. **Integrate with team:**
   - Share this guide
   - Set expectations for automation
   - Define when to use agent vs actions

---

## 📞 Questions?

See related docs:
- **PM_WORKFLOW.md** - Manual workflow (before automation)
- **GITHUB_PROJECTS_SETUP.md** - Board setup
- **Memory: pm-overview.md** - Strategy & philosophy

---

**Status:** ✅ Ready to use
**Last Updated:** 2026-02-12
**Version:** 1.0
