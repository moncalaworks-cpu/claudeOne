# Quick Reference Card

**Print this and keep it at your desk while developing agents.**

---

## Before Every Prompt: CRAFT

```
C - CONTEXT    → What's the situation & success criteria?
R - ROLE       → What expertise should Claude adopt?
A - ACTION     → Break into numbered steps (1, 2, 3...)
F - FORMAT     → How should output be structured?
T - TONE       → Who's the audience? How handle uncertainty?
```

**File**: `docs/CRAFT_PROMPT_TEMPLATE.md` for full template

---

## Every Agent Must Have

```
✓ Try/except blocks around all external API calls
✓ Exponential backoff retry logic
✓ Structured logging with timestamps
✓ Persistent state (file or database)
✓ API credentials from environment variables (.env)
✓ Docstrings with confidence levels (HIGH/MEDIUM/LOW)
✓ Error recovery procedures
```

**Reference**: `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 6

---

## Before Deploying: Checklist Items

```
□ Error handling for all external calls
□ Retry logic with exponential backoff
□ Input validation at system boundaries
□ Comprehensive logging (no secrets in logs)
□ State persistence tested
□ Credentials in environment variables
□ Unit tests for critical paths
□ Documentation complete
□ Runbook for failures created
```

**Full Checklist**: `docs/AGENT_DEPLOYMENT_CHECKLIST.md`

---

## Quick Command Reference

```bash
# Create .env from template
cp .env.template .env

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check for hardcoded secrets
grep -r "ANTHROPIC_API_KEY\|GITHUB_TOKEN\|GMAIL_TOKEN" agents/
grep -r "Bearer\|token=\|api_key=" agents/

# Verify .env is gitignored
grep ".env" .gitignore

# Run tests
python -m pytest tests/

# Check logs for sensitive data
grep -i "password\|secret\|token\|key" logs/*.log
```

---

## Common Patterns

### Error Handling Template
```python
try:
    result = external_api_call()
except RateLimitError:
    time.sleep(60)  # Wait for quota
    return retry_with_backoff(func, max_attempts=3)
except AuthenticationError:
    logger.error("Auth failed. Re-authenticate?")
    raise
except Exception as e:
    logger.error(f"Unexpected error: {e}", exc_info=True)
    raise
```

### State Management Template
```python
from lib.state_manager import AgentState

state = AgentState(".agent-state.json")
state.set("last_run", datetime.now().isoformat())
state.increment("emails_processed")
state.save()
```

### Logging Template
```python
from lib.logger import setup_agent_logger

logger = setup_agent_logger(__name__)
logger.info("Starting operation")
logger.warning("Rate limit approaching")
logger.error("Failed to process", exc_info=True)
```

---

## Hallucination Prevention

**For every prompt requesting information:**

1. **Acknowledge cutoff**: "Claude's knowledge ends Jan 2025"
2. **Request uncertainty**: "State 'I'm not certain' rather than guess"
3. **Request citations**: "Cite specific sections when referencing docs"
4. **Request confidence**: "Rate as HIGH/MEDIUM/LOW with reasoning"
5. **Request reasoning**: "Explain step-by-step so assumptions are visible"
6. **List assumptions**: "What are you assuming about this?"
7. **Use web search**: "Search for current info beyond Jan 2025"

---

## MCP Integration Quick Start

### Gmail (Part 3 of guide)
```python
from agents.email_processor import GmailEmailProcessor

agent = GmailEmailProcessor()
emails = agent.read_unread_emails(max_results=10)
agent.add_label(email_id, "label:name")
agent.send_email(to, subject, body)
```

### GitHub (Part 4 of guide)
```python
from agents.github_monitor import GitHubActionsAgent

agent = GitHubActionsAgent()
run_id = agent.trigger_workflow(owner, repo, workflow_id, ref="main")
success = agent.wait_for_workflow_completion(owner, repo, run_id)
artifacts = agent.get_workflow_artifacts(owner, repo, run_id)
```

---

## When You're Stuck

| Problem | Where to Look |
|---------|---------------|
| How do I write a good prompt? | `docs/CRAFT_PROMPT_TEMPLATE.md` |
| My agent keeps crashing | `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 8 (Troubleshooting) |
| I need error handling patterns | `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 6 |
| How do I set up Gmail? | `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 3 |
| How do I set up GitHub? | `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 4 |
| Is my agent production-ready? | `docs/AGENT_DEPLOYMENT_CHECKLIST.md` |
| How do I use CRAFT framework? | `docs/CRAFT_Prompt_Engineering_Guide_for_Claude.md` Part 1 |
| Need code examples? | `docs/Claude_Code_Agentic_Workflows_Guide.md` Part 7 |

---

## .cursorrules Rules

Claude Code automatically applies best practices from `.cursorrules` which includes:

✓ Always use CRAFT framework for prompts
✓ Hallucination mitigation strategies required
✓ MCP integration patterns provided
✓ Security checklist enforced
✓ Testing & validation standards
✓ Logging and state management required

**You can reference these automatically** in your prompts.

---

## File Locations

```
my-agentic-code-project/
├── .cursorrules                          ← Best practices rules
├── .env.template                         ← Copy to .env for credentials
├── docs/
│   ├── CRAFT_Prompt_Engineering_Guide_for_Claude.md
│   ├── Claude_Code_Agentic_Workflows_Guide.md
│   ├── CRAFT_PROMPT_TEMPLATE.md          ← Use for new work
│   ├── AGENT_DEPLOYMENT_CHECKLIST.md     ← Use before deploying
│   └── QUICK_REFERENCE.md                ← This file
├── agents/                               ← Agent implementations
├── mcps/                                 ← MCP configurations
├── lib/                                  ← Utilities (logger, state_manager)
├── tests/                                ← Unit tests
├── examples/                             ← Working examples
└── logs/                                 ← Runtime logs (gitignored)
```

---

## Decision Tree: Should I Use Claude Code?

```
Is this a simple, one-off task?
├─ YES → Use simple prompt (no need for full CRAFT)
└─ NO → Continue...

Does it involve external APIs (Gmail, GitHub, etc.)?
├─ YES → Use agentic workflow (Claude Code)
└─ NO → Continue...

Is it multi-step with state management?
├─ YES → Use agentic workflow (Claude Code)
└─ NO → Use simple prompt

Is error handling critical?
├─ YES → Use agentic workflow (Claude Code)
└─ NO → Simple approach is fine
```

---

## Confidence Levels

Mark your code/assumptions with:

- **HIGH**: Established patterns, well-tested code, official docs
- **MEDIUM**: Industry best practices, general patterns that vary
- **LOW**: Emerging patterns, limited data, areas needing validation

Example:
```python
def process_emails(self):
    """
    Process unread emails with domain categorization.

    Confidence: HIGH - This is a standard Gmail API operation
    Assumptions: Emails have From header (valid assumption per RFC)
    """
    # ...
```

---

## Security Checklist (Keep This Handy)

```
□ No API keys in code or comments
□ .env file in .gitignore
□ Credentials loaded from environment
□ No credentials in logs
□ No credentials in error messages
□ OAuth scopes minimized
□ Rate limiting respected
□ HTTPS for all external calls
□ SSL verification enabled
```

---

## Before Committing Code

```bash
# Check for hardcoded secrets
git diff --cached | grep -E "password|secret|token|api.?key|Bearer"

# Verify .env not staged
git status | grep ".env"

# Check logs gitignored
grep "logs/" .gitignore

# Verify tests pass
python -m pytest

# Check linting
python -m pylint agents/
```

---

## Emergency Procedures

**If credentials leaked:**
1. IMMEDIATELY revoke the token/key
2. Generate new credentials
3. Update .env
4. Review git history for exposure
5. Alert team
6. Run incident review

**If agent crashes in production:**
1. Check logs: `tail -f logs/agent.log`
2. Look for error patterns
3. Check .env variables are set
4. Verify external API availability
5. Check rate limits
6. Follow runbook in AGENT_DEPLOYMENT_CHECKLIST.md

---

## Useful Python One-Liners

```python
# Load .env
import os; from dotenv import load_dotenv; load_dotenv()

# Check env var is set
print("OK" if os.getenv("ANTHROPIC_API_KEY") else "MISSING")

# Pretty print JSON
import json; print(json.dumps(data, indent=2))

# Check for secrets in files
import os; [print(f) for root, dirs, files in os.walk("agents") for f in files if any(s in open(os.path.join(root, f)).read() for s in ["ANTHROPIC_API_KEY", "GITHUB_TOKEN"])]
```

---

## Resources

- **Full Guides**: `docs/` folder in this project
- **Anthropic Docs**: https://docs.claude.com
- **Claude Code Examples**: https://github.com/anthropics/claude-code-examples
- **Support**: https://support.claude.com

---

**Last Updated**: January 17, 2026
**Print Me**: Keep at desk for quick reference
**Version**: 1.0
