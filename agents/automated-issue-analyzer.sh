#!/bin/bash

# Automated GitHub Issue Analyzer - Runs every 15 minutes on macOS
#
# This script:
# 1. Fetches all open issues
# 2. Analyzes each with Claude Code CLI (local, no API costs)
# 3. Automatically applies labels and status
# 4. Assigns issues to self
# 5. Posts analysis as comments
#
# Scheduled via launchd on macOS
#
# Setup: See docs/AUTOMATION_GUIDE.md
# Logs: ~/.claudeone-automation/logs/analyzer.log

set -e

# Configuration
OWNER="moncalaworks-cpu"
REPO="claudeOne"
ASSIGNEE="moncalaworks-cpu"
LOG_DIR="${HOME}/.claudeone-automation/logs"
LOG_FILE="${LOG_DIR}/analyzer.log"
TEMP_DIR="${HOME}/.claudeone-automation/temp"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Create directories if they don't exist
mkdir -p "$LOG_DIR" "$TEMP_DIR"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    echo "[$TIMESTAMP] [$level] $message" >> "$LOG_FILE"
    if [ "$level" = "ERROR" ]; then
        echo "[$level] $message" >&2
    fi
}

# Start logging
log "INFO" "============================================"
log "INFO" "Starting automated issue analyzer"
log "INFO" "Repository: $OWNER/$REPO"

# Function to analyze single issue
analyze_issue() {
    local issue_num=$1
    local title=$2
    local body=$3

    log "INFO" "Analyzing issue #$issue_num: $title"

    # Create analysis prompt
    local prompt_file="$TEMP_DIR/analysis-$issue_num.txt"
    cat > "$prompt_file" << 'EOF'
Analyze this GitHub issue. Output ONLY the following format (one per line):

PHASE: [1-mvp OR 2-important OR 3-nice-to-have]
PRIORITY: [critical OR high OR medium OR low]
TYPE: [feature OR bug OR documentation OR testing]
LABELS: [label1, label2, label3] (comma-separated, use existing labels)
CONFIDENCE: [0-100]
REASONING: [one sentence explanation]

Issue Details:
EOF

    echo "Number: #$issue_num" >> "$prompt_file"
    echo "Title: $title" >> "$prompt_file"
    echo "Body: $body" >> "$prompt_file"

    # Run Claude analysis silently, capture output
    local analysis_output
    analysis_output=$(claude "$prompt_file" 2>&1 | tail -20)

    # Parse the output
    local phase=$(echo "$analysis_output" | grep "PHASE:" | head -1 | sed 's/PHASE: *//')
    local priority=$(echo "$analysis_output" | grep "PRIORITY:" | head -1 | sed 's/PRIORITY: *//')
    local type=$(echo "$analysis_output" | grep "TYPE:" | head -1 | sed 's/TYPE: *//')
    local labels=$(echo "$analysis_output" | grep "LABELS:" | head -1 | sed 's/LABELS: *//')
    local confidence=$(echo "$analysis_output" | grep "CONFIDENCE:" | head -1 | sed 's/CONFIDENCE: *//')
    local reasoning=$(echo "$analysis_output" | grep "REASONING:" | head -1 | sed 's/REASONING: *//')

    log "INFO" "  Phase: $phase | Priority: $priority | Type: $type"

    # Map to label names if needed
    local phase_label=""
    case "$phase" in
        "1-mvp") phase_label="phase-1-mvp" ;;
        "2-important") phase_label="phase-2-important" ;;
        "3-nice-to-have") phase_label="phase-3-nice-to-have" ;;
    esac

    local priority_label=""
    case "$priority" in
        "critical") priority_label="priority-critical" ;;
        "high") priority_label="priority-high" ;;
        "medium") priority_label="priority-medium" ;;
        "low") priority_label="priority-low" ;;
    esac

    local type_label=""
    case "$type" in
        "feature") type_label="type-feature" ;;
        "bug") type_label="type-bug" ;;
        "documentation") type_label="type-documentation" ;;
        "testing") type_label="type-testing" ;;
    esac

    # Build label list
    local all_labels="status-in-progress"
    [ -n "$phase_label" ] && all_labels="$all_labels,$phase_label"
    [ -n "$priority_label" ] && all_labels="$all_labels,$priority_label"
    [ -n "$type_label" ] && all_labels="$all_labels,$type_label"
    if [ -n "$labels" ]; then
        all_labels="$all_labels,$labels"
    fi

    # Apply labels
    log "INFO" "  Applying labels: $all_labels"
    if gh issue edit "$issue_num" \
        --repo "$OWNER/$REPO" \
        --add-label "$all_labels" 2>/dev/null; then
        log "INFO" "  ✅ Labels applied"
    else
        log "ERROR" "  Failed to apply labels"
        return 1
    fi

    # Assign to self
    log "INFO" "  Assigning to $ASSIGNEE"
    if gh issue edit "$issue_num" \
        --repo "$OWNER/$REPO" \
        --add-assignee "$ASSIGNEE" 2>/dev/null; then
        log "INFO" "  ✅ Assigned"
    else
        log "ERROR" "  Failed to assign"
        return 1
    fi

    # Post analysis as comment
    local comment_body="🤖 **Automated Analysis**

**Phase:** $phase
**Priority:** $priority
**Type:** $type
**Confidence:** $confidence%

**Reasoning:** $reasoning

*Analyzed by Claude Code at $(date)*"

    log "INFO" "  Posting analysis comment"
    if gh issue comment "$issue_num" \
        --repo "$OWNER/$REPO" \
        --body "$comment_body" 2>/dev/null; then
        log "INFO" "  ✅ Comment posted"
    else
        log "ERROR" "  Failed to post comment"
        return 1
    fi

    return 0
}

# Main loop - get all open issues
log "INFO" "Fetching all open issues..."
open_issues=$(gh issue list \
    --repo "$OWNER/$REPO" \
    --state open \
    --json number,title,body \
    --limit 100)

issue_count=$(echo "$open_issues" | jq 'length')
log "INFO" "Found $issue_count open issues"

if [ "$issue_count" -eq 0 ]; then
    log "INFO" "No open issues to process"
else
    processed=0
    failed=0

    # Process each issue
    echo "$open_issues" | jq -r '.[] | "\(.number)|\(.title)|\(.body)"' | while IFS='|' read -r num title body; do
        if analyze_issue "$num" "$title" "$body"; then
            ((processed++))
        else
            ((failed++))
        fi

        # Be nice to the API - small delay between issues
        sleep 2
    done

    log "INFO" "Processing complete: $processed succeeded, $failed failed"
fi

log "INFO" "============================================"
log "INFO" "Analyzer run complete"
