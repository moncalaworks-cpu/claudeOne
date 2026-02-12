# GitHub Projects Setup Instructions

**Status:** Manual setup required (UI-based)
**Project:** claudeOne
**Repository:** https://github.com/moncalaworks-cpu/claudeOne

---

## ✅ Completed Setup

The following has already been configured:

### Labels Created ✅
- **Phase:** phase-1-mvp, phase-2-important, phase-3-nice-to-have
- **Priority:** priority-critical, priority-high, priority-medium, priority-low
- **Status:** status-ready, status-blocked, status-in-progress, status-in-review
- **Type:** type-feature, type-documentation, type-testing
- **Memory:** memory-pattern, memory-decision, memory-lesson

View: https://github.com/moncalaworks-cpu/claudeOne/labels

### Milestones Created ✅
- **Phase 1: MVP** (Due 2026-03-01) - REQ-001 to REQ-004
- **Phase 2: Important** (Due 2026-03-30) - REQ-005 to REQ-007
- **Phase 3: Nice to Have** (Due 2026-06-01) - REQ-008 to REQ-010

View: https://github.com/moncalaworks-cpu/claudeOne/milestones

### Issues Created ✅
All 10 requirements converted to GitHub Issues:
- **#1:** [REQ-001] Comprehensive Agentic Workflows Guide
- **#2:** [REQ-002] CRAFT Prompt Engineering Framework
- **#3:** [REQ-003] Best Practices Rules (.cursorrules)
- **#4:** [REQ-004] Environment Setup & Configuration
- **#5:** [REQ-005] Pre-Deployment Validation Checklist
- **#6:** [REQ-006] Working Code Examples
- **#7:** [REQ-007] Quick Reference Card
- **#8:** [REQ-008] Interactive Workshop Template
- **#9:** [REQ-009] Integration Examples
- **#10:** [REQ-010] Video Tutorials

View: https://github.com/moncalaworks-cpu/claudeOne/issues

### Issue Template Created ✅
Template file: `.github/ISSUE_TEMPLATE/requirement.md`

Use when creating new issues: Click "New Issue" → Select "Requirement Issue"

### Documentation Created ✅
- **PM_WORKFLOW.md** - Complete workflow guide
- **GITHUB_PROJECTS_SETUP.md** - This file

---

## 📊 Create GitHub Projects Board (Manual)

### Step 1: Go to Projects
Visit: https://github.com/moncalaworks-cpu/claudeOne/projects

### Step 2: Create New Project
1. Click **"New project"** button (top right)
2. Select **"Table"** or **"Board"** template
   - Recommend: **Board** (Kanban view)
3. Name: `claudeOne Development`
4. Description: `Project management for claudeOne learning project`
5. Click **"Create"**

### Step 3: Set Up Board Columns
Create these columns (in order):

1. **📋 TODO**
   - For: Issues ready to start but not yet assigned
   - Filter: `label:status-ready OR label:status-blocked`

2. **🚀 IN_PROGRESS**
   - For: Issues being actively worked
   - Filter: `label:status-in-progress`

3. **✅ DONE**
   - For: Completed and closed issues
   - Filter: `is:closed`

### Step 4: Add Issues to Board
1. In the **TODO** column, click **"Add item"**
2. Select the issues from the list:
   - Select all Phase 1 issues first: #1, #2, #3, #4
   - Then Phase 2: #5, #6, #7
   - Then Phase 3: #8, #9, #10
3. Issues will appear in TODO column

### Step 5: Sort by Priority
1. Click the **"Sort"** button on the board
2. Select **"Priority"** or **"Status"**
3. This makes it easier to see high-priority items first

---

## 🤖 GitHub Automation (Optional)

To automatically move issues as they progress, add automation rules:

### Setup Auto-Move Rules

#### Rule 1: Move to IN_PROGRESS when PR is created
1. Click **"⋯"** (options) on board
2. Select **"Workflows"**
3. Enable: **"Auto-add to project"**
   - This auto-adds new PRs to IN_PROGRESS

#### Rule 2: Move to DONE when issue closes
1. In **"Workflows"** settings
2. Enable: **"Auto-archive"**
   - Moves closed issues to DONE (or archive)

#### Rule 3: Move based on label changes
1. Update issue label from `status-ready` → `status-in-progress`
2. Manually drag to IN_PROGRESS column
3. (Automation can be enhanced with GitHub Actions if needed)

---

## 📈 Viewing Progress

### Quick View: Milestone Progress
```
Go to: Milestones tab
Shows: Issues per milestone + completion percentage
- Phase 1: 0/4 (0%)
- Phase 2: 0/3 (0%)
- Phase 3: 0/3 (0%)
```

### Kanban View: Board Status
```
Go to: Projects board
Shows: Columns (TODO | IN_PROGRESS | DONE)
Filter: By phase, priority, type, status
```

### Issues List View
```
Go to: Issues tab
Filter options:
- By label: phase-1-mvp, phase-2-important, etc.
- By milestone: Phase 1, Phase 2, Phase 3
- By assignee: person working on it
- By status: open, closed
```

---

## 🔄 Workflow Integration

### When Working on an Issue

1. **Assign to yourself**
   - Go to issue #1
   - Click "Assign yourself"

2. **Change status label**
   - Label: `status-ready` → `status-in-progress`
   - Board auto-moves (or manually drag)

3. **Create a branch**
   ```bash
   git checkout -b REQ-001-workflows-guide
   ```

4. **Create a PR**
   ```bash
   git push origin REQ-001-workflows-guide
   gh pr create --title "Implement REQ-001: Workflows Guide" \
     --body "Closes #1"
   ```

5. **Review & Merge**
   - Change label to `status-in-review`
   - Get review, merge PR
   - Issue auto-closes, board moves to DONE

6. **Update REQUIREMENTS.md**
   ```
   REQ-001:
   Status: DONE
   Closed Date: 2026-02-12
   GitHub Issue: #1
   ```

7. **Document Learning**
   - Add `memory-pattern` label if applicable
   - Link to MEMORY.md patterns

---

## 💡 Tips & Best Practices

### Managing the Board
- **Drag issues** to move columns manually
- **Filter by label** to see specific phases
- **Group by milestone** to see phase progress
- **Archive completed** items to keep board clean
- **Update labels** to reflect current status

### Preventing Issues
- ✅ Always link PRs to issues: "Closes #123"
- ✅ Use consistent labeling (phase + priority + type)
- ✅ Keep status labels current
- ✅ Update REQUIREMENTS.md when issues close
- ✅ Add memory-pattern when discovering patterns

### Reporting
- **Weekly:** Check milestone progress percentages
- **Daily:** Look at board for stuck issues (status-blocked)
- **Monthly:** Review MEMORY.md for patterns discovered
- **Quarterly:** Update REQUIREMENTS.md with learnings

---

## 📚 Related Documents

- **[PM_WORKFLOW.md](./PM_WORKFLOW.md)** - Complete workflow guide
- **[REQUIREMENTS.md](../REQUIREMENTS.md)** - Source of truth
- **[GitHub Issues](https://github.com/moncalaworks-cpu/claudeOne/issues)** - All issues
- **[GitHub Milestones](https://github.com/moncalaworks-cpu/claudeOne/milestones)** - Phase tracking

---

## ❓ Frequently Asked Questions

**Q: How do I move an issue between columns?**
A: Click and drag issue card in the board view, or update the status label.

**Q: What if an issue is blocked?**
A: Add `status-blocked` label, comment with reason, and move back to TODO (or keep in blocked column if you have one).

**Q: When should I close an issue?**
A: When all acceptance criteria are met and the PR is merged. Link PR with "Closes #123".

**Q: How do I track progress?**
A: Go to Milestones tab to see percentage complete for each phase. Also check Projects board for visual progress.

**Q: Can I create custom columns?**
A: Yes! GitHub Projects allows custom columns. But for simplicity, stick with TODO | IN_PROGRESS | DONE.

---

## Next Steps

1. **Create the Projects board** (follow steps above)
2. **Add all issues** to the board (step 4)
3. **Test the workflow** (pick one issue, assign, create PR, close)
4. **Share with team** (if applicable)
5. **Monitor progress** (weekly milestone reviews)

---

**Status:** Ready to implement
**Last Updated:** 2026-02-12
**Questions?** See PM_WORKFLOW.md or docs/PM_OVERVIEW.md (in memory)
