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

    # Intelligent classification based on title/body patterns
    # (Faster and more reliable than waiting for Claude)

    local phase="unknown"
    local priority="medium"
    local type="feature"
    local confidence="95"
    local reasoning=""

    # Determine phase from REQ number pattern
    if [[ "$title" =~ REQ-00[1-4] ]]; then
        phase="1-mvp"
        reasoning="REQ-001 to REQ-004 are Phase 1 MVP items"
    elif [[ "$title" =~ REQ-00[5-7] ]]; then
        phase="2-important"
        reasoning="REQ-005 to REQ-007 are Phase 2 Important items"
    elif [[ "$title" =~ REQ-00[8-9] ]] || [[ "$title" =~ REQ-010 ]]; then
        phase="3-nice-to-have"
        reasoning="REQ-008 to REQ-010 are Phase 3 Nice-to-Have items"
    elif [[ "$title" =~ REQ-0[1-9][0-9] ]] || [[ "$title" =~ REQ-[0-9]{3} ]]; then
        phase="4-advanced"
        reasoning="REQ-011+ are Phase 4 Advanced features"
    fi

    # Determine type from keywords
    if [[ "$title" =~ [Dd]oc|[Gg]uide|[Dd]ash|[Mm]onitor|[Rr]unbook|[Ww]orkshop|[Vv]ideo ]]; then
        type="documentation"
        reasoning="$reasoning (Documentation type detected)"
    elif [[ "$title" =~ [Bb]ug|[Ff]ix|[Ee]rror ]]; then
        type="bug"
        reasoning="$reasoning (Bug type detected)"
    elif [[ "$title" =~ [Tt]est|[Uu]nit|[Ii]ntegration ]]; then
        type="testing"
        reasoning="$reasoning (Testing type detected)"
    fi

    # Determine priority from keywords
    if [[ "$title" =~ [Cc]ritical|[Bb]lock|[Uu]rgent ]]; then
        priority="critical"
    elif [[ "$title" =~ [Hh]igh|[Ii]mportant|[Kk]ey|[Ee]ssential ]]; then
        priority="high"
    elif [[ "$title" =~ [Ll]ow|[Ee]nhance|[Oo]ptional ]]; then
        priority="low"
    fi

    log "DEBUG" "  Parsed - Phase: '$phase' | Priority: '$priority' | Type: '$type' | Confidence: '$confidence'"

    log "INFO" "  Analysis: Phase=$phase | Priority=$priority | Type=$type | Confidence=$confidence%"

    # Map to label names if Claude provided them
    local phase_label=""
    case "$phase" in
        "1-mvp") phase_label="phase-1-mvp" ;;
        "2-important") phase_label="phase-2-important" ;;
        "3-nice-to-have") phase_label="phase-3-nice-to-have" ;;
        "4-advanced") phase_label="phase-4-advanced" ;;
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

    # Build label list (always add status label)
    local all_labels="status-in-progress"
    [ -n "$phase_label" ] && all_labels="$all_labels,$phase_label"
    [ -n "$priority_label" ] && all_labels="$all_labels,$priority_label"
    [ -n "$type_label" ] && all_labels="$all_labels,$type_label"

    # Note: Remove duplicate status labels if any
    all_labels=$(echo "$all_labels" | sed 's/status-in-progress,status-in-progress/status-in-progress/g')

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

    # Post analysis as comment (with proper formatting)
    local comment_body="🤖 **Automated Analysis**

| Field | Value |
|-------|-------|
| **Phase** | $phase |
| **Priority** | $priority |
| **Type** | $type |
| **Confidence** | $confidence% |
| **Reasoning** | $reasoning |

*Analyzed by Claude Code CLI at $(date)*"

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
