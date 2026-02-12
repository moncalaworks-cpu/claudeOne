# Automation Guide: GitHub Actions + Claude Agent

**Created:** 2026-02-12
**Updated:** 2026-02-12

This guide explains the two-tier automation system for managing GitHub issues:
1. **GitHub Actions** - Simple, built-in automation
2. **Claude Code Agent** - Intelligent, AI-powered analysis

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

## Part 2: Claude Code Agent (Intelligent)

For decisions that require judgment, use the **GitHub Issue Analyzer Agent**.

### 🧠 What the Claude Agent Does

The agent reads issue content and uses Claude AI to decide:
- ✅ What phase (1, 2, or 3) based on complexity
- ✅ What priority (critical, high, medium, low) based on urgency
- ✅ What type (feature, documentation, testing, bug) based on nature
- ✅ What labels to apply based on content analysis
- ✅ Related requirements (REQ-001, REQ-002, etc.)
- ✅ Estimated effort (Low, Medium, High)
- ✅ Confidence level in the assessment

### 📦 Installation

#### Prerequisites
```bash
# Ensure Anthropic API key is set
export ANTHROPIC_API_KEY="sk-ant-..."

# Install Anthropic Python SDK (if not already installed)
pip install anthropic

# GitHub CLI already configured
gh auth status
```

#### Setup (One-time)
```bash
# Make agent executable
chmod +x /Users/kenshinzato/repos/claudeOne/agents/github_issue_analyzer.py

# Test it
python agents/github_issue_analyzer.py --interactive
```

### 🚀 Usage: Analyze an Issue

#### Command Line - Single Issue
```bash
# Analyze issue #2
python agents/github_issue_analyzer.py --repo moncalaworks-cpu/claudeOne --issue 2

# Analyze issue #2 and automatically apply suggested labels
python agents/github_issue_analyzer.py --repo moncalaworks-cpu/claudeOne --issue 2 --apply-labels
```

#### Interactive Mode
```bash
# Start interactive conversation
python agents/github_issue_analyzer.py --interactive

# In the interactive prompt:
> analyze moncalaworks-cpu/claudeOne 2
> analyze moncalaworks-cpu/claudeOne 3
> What labels should I use for bug fixes?
> exit
```

### 📊 Analysis Output

The agent provides a detailed report:

```
═══════════════════════════════════════════════════════════════
GitHub Issue Analysis Report
═══════════════════════════════════════════════════════════════

Issue: #2 - CRAFT Prompt Engineering Framework
Analyzed: 2026-02-12 14:30:00

ANALYSIS RESULTS
─────────────────────────────────────────────────────────────

Phase:           2-important
Priority:        high
Type:            documentation
Effort:          Medium
Confidence:      92%

Reasoning:
This is documentation work for the CRAFT framework. It's important
for Phase 2 but not blocking MVP. High priority because it's
referenced by other requirements.

RECOMMENDATIONS
─────────────────────────────────────────────────────────────

Suggested Labels:
  • phase-2-important
  • priority-high
  • type-documentation
  • status-ready

Should Assign: Yes

Related Requirements:
  • REQ-001
  • REQ-003

═══════════════════════════════════════════════════════════════
```

### 💾 Analysis Storage

Each analysis is saved as JSON for future reference:

```bash
.github/issue-analysis-2.json
```

Contains:
- Original issue details
- Claude's analysis
- Timestamp
- Confidence scores

### 🔄 Workflow Integration

**Typical workflow with agent:**

1. **GitHub Actions auto-labels** basic issues (REQ-XXX pattern)
2. **You review** the automated labels
3. **For complex issues**, run the Claude Agent:
   ```bash
   python agents/github_issue_analyzer.py --issue 2 --apply-labels
   ```
4. **Agent suggests** more nuanced labels based on content
5. **You review & apply** if confident, or adjust manually

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

### When to Use Claude Agent
- Issue came from external source (doesn't follow REQ-XXX pattern)
- Complex requirement that needs judgment
- Deciding between two priorities
- Finding related requirements
- Estimating effort
- Reviewing quality before starting work

### Automation Levels

| Level | What's Automated | Manual Steps |
|-------|-----------------|--------------|
| **Minimal** | Just GitHub Actions | Review & adjust labels if needed |
| **Standard** | Actions + Claude for complex issues | Confirm Claude suggestions before applying |
| **Maximum** | Actions + Claude with auto-apply | Just review, everything auto-updated |

---

## 🐛 Troubleshooting

### GitHub Actions Not Running

**Problem:** Workflows not triggering on issue create
**Solution:**
- Check `.github/workflows/` files exist
- Verify GitHub Actions enabled: Settings → Actions → General
- Check permissions: Settings → Actions → General → Workflow permissions → "Read and write"

### Claude Agent Not Available

**Problem:** "ANTHROPIC_API_KEY not set"
**Solution:**
```bash
# Set your API key
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Verify
echo $ANTHROPIC_API_KEY
```

### Labels Not Applied

**Problem:** Workflow runs but labels don't appear
**Solution:**
- Check GitHub Actions logs: Actions tab → Workflow run → Check output
- Verify label names are exact (case-sensitive)
- May need to wait a few seconds for sync

### Claude Analysis Low Confidence

**Problem:** Agent says "Confidence: 45%"
**Solution:**
- Issue description too vague
- Multiple interpretations possible
- Add more details to issue body
- Manually review and adjust labels

---

## 📚 Advanced Usage

### Custom Analysis Script

Create your own analysis script:

```python
from agents.github_issue_analyzer import fetch_issue_details, analyze_issue_with_claude

# Fetch issue
issue = fetch_issue_details("moncalaworks-cpu", "claudeOne", 2)

# Analyze with Claude
analysis = analyze_issue_with_claude(issue)

# Use the analysis
print(f"Phase: {analysis['phase']}")
print(f"Priority: {analysis['priority']}")
print(f"Confidence: {analysis['confidence']:.0%}")
```

### Batch Analysis

Analyze multiple issues:

```bash
for ISSUE in {1..10}; do
  python agents/github_issue_analyzer.py --issue $ISSUE --apply-labels
done
```

### Schedule Regular Analysis

Using cron (macOS/Linux):

```bash
# Add to crontab: crontab -e
# Run analysis every morning at 9 AM
0 9 * * * cd /Users/kenshinzato/repos/claudeOne && python agents/github_issue_analyzer.py --issue-scan
```

---

## 📊 Monitoring Automation

### Check Automation History

```bash
# View recent GitHub Actions runs
gh run list --repo moncalaworks-cpu/claudeOne

# View details of specific run
gh run view <run-id> --repo moncalaworks-cpu/claudeOne
```

### Audit Trail

All analyses saved to `.github/issue-analysis-*.json`:

```bash
# View all analyses
ls .github/issue-analysis-*.json

# Check specific analysis
cat .github/issue-analysis-2.json | jq '.analysis'
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
