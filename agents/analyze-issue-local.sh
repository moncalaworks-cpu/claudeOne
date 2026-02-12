#!/bin/bash

# GitHub Issue Analyzer - Local Claude Code CLI Version
#
# Analyzes GitHub issues using Claude Code CLI (no API costs)
# Usage: ./agents/analyze-issue-local.sh <issue-number>
#
# Example:
#   ./agents/analyze-issue-local.sh 2
#   ./agents/analyze-issue-local.sh 5 moncalaworks-cpu claudeOne

set -e

ISSUE_NUM="${1:-}"
OWNER="${2:-moncalaworks-cpu}"
REPO="${3:-claudeOne}"

if [ -z "$ISSUE_NUM" ]; then
    echo "Usage: $0 <issue-number> [owner] [repo]"
    echo ""
    echo "Example: $0 2"
    echo "         $0 5 moncalaworks-cpu claudeOne"
    exit 1
fi

# Fetch issue details using GitHub CLI
echo "🔍 Fetching issue #$ISSUE_NUM from $OWNER/$REPO..."
ISSUE=$(gh issue view "$ISSUE_NUM" --repo "$OWNER/$REPO" --json title,body,labels,number 2>/dev/null)

if [ -z "$ISSUE" ]; then
    echo "❌ Could not fetch issue #$ISSUE_NUM"
    exit 1
fi

# Extract fields
TITLE=$(echo "$ISSUE" | jq -r '.title')
BODY=$(echo "$ISSUE" | jq -r '.body')
LABELS=$(echo "$ISSUE" | jq -r '.labels[].name' | tr '\n' ', ')

echo "✅ Fetched: $TITLE"
echo ""

# Create a prompt for Claude Code
PROMPT="Analyze this GitHub issue and provide recommendations.

Issue #$ISSUE_NUM: $TITLE

Body:
$BODY

Current Labels: $LABELS

Based on the issue content, determine:
1. **Phase:** 1-mvp, 2-important, or 3-nice-to-have (based on scope/complexity)
2. **Priority:** critical, high, medium, or low (based on urgency/impact)
3. **Type:** feature, documentation, testing, or bug (based on nature)
4. **Suggested Labels:** What labels should be added?
5. **Confidence:** How confident are you (0-100%)?
6. **Reasoning:** Why these recommendations?
7. **Related Requirements:** Any REQ-XXX this relates to?
8. **Estimated Effort:** Low, Medium, or High?

Provide a clear, structured analysis."

# Save prompt to temp file
PROMPT_FILE="/tmp/issue-$ISSUE_NUM-analysis.md"
echo "$PROMPT" > "$PROMPT_FILE"

echo "📝 Analysis prompt created: $PROMPT_FILE"
echo ""
echo "🚀 Starting Claude Code analysis session..."
echo "   (This will open an interactive Claude Code session)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Open Claude Code with the prompt
claude "$PROMPT_FILE"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Analysis complete!"
echo ""
echo "Next steps:"
echo "1. Review the analysis above"
echo "2. Copy the suggested labels"
echo "3. Apply to issue: gh issue edit $ISSUE_NUM --add-label \"<labels>\""
echo ""
