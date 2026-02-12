# Quick Reference Card

**Related Requirement:** REQ-007

One-page reference for common commands and patterns.

---

## Claude Code Commands

```bash
claude .                           # Haiku model (fast)
claude-sonnet .                    # Sonnet model (balanced)
claude-opus .                      # Opus model (powerful)
claude --help                      # Show options
/help                              # Help in session
/clear                             # Clear context
/commit                            # Create git commit
```

## Git Workflow

```bash
git checkout -b REQ-001-feature    # Create branch
git add file.txt                   # Stage changes
git commit -m "message"            # Commit
git push origin branch-name        # Push
gh pr create --title "" --body ""  # Create PR
gh pr merge PR_NUM --merge         # Merge PR
```

## GitHub CLI

```bash
gh issue view 1                    # View issue
gh issue edit 1 --add-label "..."  # Add label
gh pr create --title "" --body ""  # Create PR
gh auth status                     # Check auth
```

## Environment Setup

```bash
export $(cat .env | grep -v '^#' | xargs)  # Load env vars
echo $ANTHROPIC_API_KEY                     # Verify key
gh auth status                              # Verify GitHub
```

## Testing

```bash
pytest                             # Run all tests
pytest file_test.py -v             # Run specific test
pytest --cov=.                     # With coverage
```

## File Organization

```
claudeOne/
├── docs/              # Documentation
├── agents/            # Scripts & agents
├── examples/          # Working code
├── tests/             # Unit tests
├── my-agentic-code-project/
│   ├── .env          # Credentials (git-ignored)
│   ├── docs/         # Guides
│   └── agents/       # Agent code
└── .gitignore
```

## Labels & Status

```
Phase:      phase-1-mvp, phase-2-important, phase-3-nice-to-have
Priority:   priority-critical, priority-high, priority-medium, priority-low
Type:       type-feature, type-documentation, type-testing
Status:     status-ready, status-blocked, status-in-progress, status-in-review
```

## Common Mistakes

❌ Commit .env file
❌ Hardcode API keys
❌ Push without testing
❌ Merge without review
❌ Forget to update REQUIREMENTS.md

✅ Always add .env to .gitignore
✅ Use environment variables
✅ Test before pushing
✅ Get PR review
✅ Update REQ status when done

---

**Bookmark this page!**
