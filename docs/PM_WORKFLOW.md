# PM Workflow Guide

**Last Updated:** 2026-02-12
**Project:** claudeOne
**Board:** [GitHub Projects Board](https://github.com/moncalaworks-cpu/claudeOne/projects)

---

## Overview

This guide explains how to use GitHub Projects, Issues, and REQUIREMENTS.md together for project management.

**Workflow:** REQUIREMENTS.md → GitHub Issues → GitHub Projects → MEMORY.md

---

## Managing Requirements

### 1. Writing Requirements (REQUIREMENTS.md)

Each requirement should have:
- **REQ-XXX code** (e.g., REQ-001)
- **Phase** (1: MVP, 2: Important, 3: Nice to Have)
- **Description** (what needs to be done)
- **Acceptance criteria** (how we know it's done)
- **Dependencies** (what blocks this)
- **Target date** (when it should be done)
- **Status** (NOT_STARTED, IN_PROGRESS, BLOCKED, REVIEW, DONE)

See [REQUIREMENTS.md](../REQUIREMENTS.md) for the template.

### 2. Creating GitHub Issues

When a requirement is ready to start:

1. Go to [Issues](https://github.com/moncalaworks-cpu/claudeOne/issues)
2. Click "New Issue"
3. Use the **"Requirement Issue"** template
4. Fill in:
   - **Title:** `[REQ-XXX] Feature Name`
   - **Description:** Copy from REQUIREMENTS.md
   - **Labels:**
     - Phase label (phase-1-mvp, phase-2-important, phase-3-nice-to-have)
     - Priority label (critical, high, medium, low)
     - Type label (feature, documentation, testing)
     - Status label (ready, blocked, in-progress, in-review)
   - **Milestone:** Select the matching phase (Phase 1, Phase 2, Phase 3)
   - **Assignee:** (optional) Who's working on it

**Example:**
```
Title: [REQ-001] Comprehensive Agentic Workflows Guide
Labels: phase-1-mvp, priority-high, type-feature, status-ready
Milestone: Phase 1: MVP
```

### 3. Tracking in GitHub Projects

The Kanban board automatically shows your issues:

```
📋 TODO          🚀 IN_PROGRESS     ✅ DONE
├─ [REQ-001]     ├─ [REQ-003]       ├─ [REQ-002]
├─ [REQ-004]     └─ [REQ-005]       └─ ...
└─ ...
```

**To move an issue:**
- Click and drag in the Projects board, OR
- Update the issue status label
- **Note:** Automation may auto-move issues when PRs are created or merged

---

## GitHub Labels

### Phase Labels (Required - Pick One)
- `phase-1-mvp` - Must have (MVP)
- `phase-2-important` - Should have
- `phase-3-nice-to-have` - Could have

### Priority Labels (Recommended)
- `priority-critical` - Blocks other work
- `priority-high` - Important for phase
- `priority-medium` - Useful but not blocking
- `priority-low` - Nice to have

### Type Labels (Recommended)
- `type-feature` - New functionality
- `type-documentation` - Docs, guides, runbooks
- `type-testing` - Test coverage

### Status Labels (Recommended)
- `status-ready` - Ready to start
- `status-blocked` - Cannot proceed
- `status-in-progress` - Currently working
- `status-in-review` - Awaiting approval

### Memory Labels (Optional)
- `memory-pattern` - Links to MEMORY.md pattern
- `memory-decision` - Links to architecture decision
- `memory-lesson` - Links to debugging lesson

---

## Workflow: Starting a Requirement

### Step 1: Assign & Label
```
Issue #1: [REQ-001] Comprehensive Agentic Workflows Guide
Labels: phase-1-mvp, priority-high, type-feature, status-ready
Status: In TODO column
```

### Step 2: Update Status & Start Work
```
1. Click "Edit" on the issue
2. Change status label: status-ready → status-in-progress
3. Assign to yourself
4. Move issue to IN_PROGRESS column (or auto-move when PR created)
```

### Step 3: Work & Create PR
```
1. Create a branch: git checkout -b REQ-001-workflows-guide
2. Make changes
3. Create PR with: gh pr create
4. Link issue in PR: "Closes #1" in PR body
   (This auto-closes issue when PR merged)
```

### Step 4: Complete & Update Memory
```
When PR is merged and issue auto-closes:

1. Go to closed issue #1
2. Update REQUIREMENTS.md:
   - Status: DONE
   - Closed Date: [date]
   - GitHub Issue: #1

3. If discovered patterns, add to MEMORY.md:
   - Link to closed issue in patterns.md
   - Reference REQ-001 in architecture.md (if decision made)

4. Add memory-pattern label to issue for discovery
```

### Step 5: Update Milestone Progress
```
Phase 1: 1/4 complete (25%)
├─ ✅ REQ-001 (Issue #1) - DONE
├─ ⏳ REQ-002 (Issue #2) - IN_PROGRESS
├─ 📋 REQ-003 (Issue #3) - TODO
└─ 📋 REQ-004 (Issue #4) - TODO
```

---

## Handling Dependencies

### Blocking Issues

If REQ-A blocks REQ-B:

1. In REQ-B's issue, add label: `status-blocked`
2. In the issue description, link to blocking issue: "Blocked by #123"
3. Update REQUIREMENTS.md dependencies field
4. When blocking issue closes, update blocked issue status

**Example:**
```
Issue #6: [REQ-006] Working Code Examples
Status: BLOCKED (Depends on REQ-001, REQ-004)
Labels: phase-2-important, priority-medium, type-feature, status-blocked
Comment: "Blocked by #1 and #4 - waiting for guides and setup docs"
```

---

## Progress Tracking

### View Progress by Phase

**Phase 1 MVP (Due 2026-03-01):**
```
Go to: Issues → Filter by "milestone:Phase 1: MVP"
Shows: All REQ-001 to REQ-004 issues
Status: See how many are DONE vs TODO
```

**All Issues:**
```
Go to: GitHub Projects board
Shows: All issues in Kanban view (TODO | IN_PROGRESS | DONE)
Filter: By phase, priority, status
```

### Generate Insights

In GitHub repository:
1. Go to **"Insights"** tab
2. Click **"Network"** to see commit history
3. View issue velocity (how many close per week)
4. Track burndown toward milestone dates

---

## Using Issue Templates

### Create New Issue with Template
1. Go to [Issues](https://github.com/moncalaworks-cpu/claudeOne/issues)
2. Click "New Issue"
3. Select **"Requirement Issue"** template
4. Fill in the form with REQ-XXX details

### Template Fields

```markdown
---
name: Requirement Issue
about: Create an issue for a requirement from REQUIREMENTS.md
title: "[REQ-XXX] "
labels: "phase-1-mvp, type-feature, status-ready"
milestone: "Phase 1: MVP"
---

## Description
[What needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related Requirement
See REQUIREMENTS.md#REQ-XXX

## Dependencies
[Blocking issues or requirements]

## Implementation Notes
[Technical considerations]

## Related Memory
[Links to MEMORY.md]
```

---

## Best Practices

### ✅ DO
- Use REQ-XXX codes consistently everywhere (REQUIREMENTS.md, issues, commits, PRs)
- Include acceptance criteria in issues (copy from REQUIREMENTS.md)
- Link issues to REQUIREMENTS.md section
- Update REQUIREMENTS.md when issues close
- Add memory-pattern label when discovering reusable patterns
- Keep status labels current (ready → in-progress → in-review → done)
- Reference issues in commits: "See #123" or "Fixes #123"

### ❌ DON'T
- Create issues without a corresponding requirement
- Leave status labels stale (issue completed but labeled "in-progress")
- Forget to link PRs to issues (prevents auto-closing)
- Create duplicate issues for same requirement
- Ignore blocked issues (update label when unblocked)
- Forget to update REQUIREMENTS.md status field

---

## Common Tasks

### Task: Update Requirement Status

**When to do:** When an issue's status changes

1. Go to [REQUIREMENTS.md](../REQUIREMENTS.md)
2. Find the REQ-XXX section
3. Update **Status** field:
   - NOT_STARTED → IN_PROGRESS (when issue created)
   - IN_PROGRESS → BLOCKED (if dependency fails)
   - IN_PROGRESS → REVIEW (when PR created)
   - REVIEW → DONE (when PR merged)
4. Add **Closed Date** when marked DONE
5. Commit with: `git commit -m "Update REQ-XXX status: DONE"`

### Task: Mark Issue Blocked

**When to do:** External dependency prevents progress

1. Go to issue
2. Add label: `status-blocked`
3. Comment: "Blocked by #XXX - waiting for [reason]"
4. Update issue status in REQUIREMENTS.md
5. Revert when unblocked

### Task: Close & Document Learning

**When to do:** Issue completed, PR merged

1. Issue auto-closes when PR merged (if PR says "Closes #123")
2. Go to closed issue
3. If discovered patterns/decisions:
   - Add label: `memory-pattern` or `memory-decision`
   - Add comment linking to MEMORY.md entry
4. Update REQUIREMENTS.md: Status = DONE, date = today
5. Commit: `git commit -m "Document REQ-XXX completion and learnings"`

---

## Reporting & Metrics

### Weekly Progress Report

```
# Week of [Date]

## Phase 1: MVP (Due 2026-03-01)
- Completed: 1/4 (25%) [Issues: #1]
- In Progress: 1/4 (25%) [Issues: #2]
- To Do: 2/4 (50%) [Issues: #3, #4]
- Status: On track ✅

## Phase 2: Important (Due 2026-03-30)
- Completed: 0/3 (0%)
- In Progress: 0/3 (0%)
- To Do: 3/3 (100%)
- Status: Not started (planned)

## Phase 3: Nice to Have (Due 2026-06-01)
- Completed: 0/3 (0%)
- In Progress: 0/3 (0%)
- To Do: 3/3 (100%)
- Status: Not started (planned)
```

### How to Generate

1. Go to [Milestones](https://github.com/moncalaworks-cpu/claudeOne/milestones)
2. Click each milestone to see progress
3. Track issues in each state
4. Calculate percentages

---

## Help & Support

**Have a question about:**
- **Issue creation?** See the issue template
- **Labels?** See "GitHub Labels" section above
- **Requirements?** See [REQUIREMENTS.md](../REQUIREMENTS.md)
- **Project management?** See [Memory: PM Overview](../../.claude/projects/-Users-kenshinzato-repos-claudeOne/memory/pm-overview.md)
- **Workflow?** See "Workflow: Starting a Requirement" above

---

## Real Example: REQ-001 Completion

**This is a real example of completing a requirement using this workflow:**

### The Requirement
```
REQ-001: Comprehensive Agentic Workflows Guide
Status: IN_PROGRESS
GitHub Issue: #1
```

### The Workflow Steps Executed
1. ✅ Issue #1 created and labeled (phase-1-mvp, priority-high, status-ready)
2. ✅ Issue moved to IN_PROGRESS column on board
3. ✅ Assigned to self
4. ✅ Created feature branch: `REQ-001-workflows-guide`
5. ✅ Made updates to documentation
6. ✅ Committed changes: "Work on REQ-001: Update agentic workflows guide"
7. ✅ Pushed to GitHub
8. ✅ Created PR with "Closes #1" to auto-close issue
9. ✅ Merged PR (issue auto-closed)
10. ✅ Updated REQUIREMENTS.md with DONE status

### Result
- Issue #1 closed automatically when PR merged
- Board moved issue to DONE column
- REQUIREMENTS.md updated with completion date
- Workflow demonstrated end-to-end

### Key Lessons Learned
- **Branch naming** helps track which requirement was worked on
- **"Closes #1" in PR** auto-closes the issue when merged
- **Labels kept current** throughout the workflow
- **REQUIREMENTS.md** serves as permanent record of what was done

---

## Related Documents

- [REQUIREMENTS.md](../REQUIREMENTS.md) - Source of truth for what needs to be built
- [GitHub Projects Board](https://github.com/moncalaworks-cpu/claudeOne/projects) - Visual progress tracking
- [GitHub Issues](https://github.com/moncalaworks-cpu/claudeOne/issues) - Detailed tracking per requirement
- [Memory: PM Overview](../../.claude/projects/-Users-kenshinzato-repos-claudeOne/memory/pm-overview.md) - Local PM strategy

---

**Version:** 1.0
**Last Updated:** 2026-02-12
