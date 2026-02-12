# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Purpose

This repository is a **Claude Code development environment** focused on building agentic workflows with best practices documentation and templates. It contains:

1. **Comprehensive guides** for prompt engineering (CRAFT framework) and agentic workflow implementation
2. **Project templates** for building Claude Code agents with MCP integrations
3. **Deployment utilities** and configuration templates
4. **Best practices rules** enforced via `.cursorrules`

---

## Key Files & Their Purpose

### Documentation & Guides

- **`.cursorrules`** - Core best practices rules that Claude Code automatically applies. Covers CRAFT framework, hallucination mitigation, MCP patterns, security requirements, state management, and logging standards.

- **`my-agentic-code-project/docs/`** - Contains comprehensive guides:
  - `Claude_Code_Agentic_Workflows_Guide.md` - Complete setup and implementation patterns for agents with Gmail/GitHub MCP integrations
  - `CRAFT_Prompt_Engineering_Guide_for_Claude.md` - Prompt engineering best practices and framework
  - `CRAFT_PROMPT_TEMPLATE.md` - Ready-to-use template for structuring new prompts
  - `AGENT_DEPLOYMENT_CHECKLIST.md` - 100+ item pre-deployment validation checklist
  - `QUICK_REFERENCE.md` - Quick lookup card for common patterns and commands

### Configuration & Setup

- **`setup-claude-defaults.sh`** - Bash script that adds shell aliases for Claude Code with model defaults:
  - `claude .` → Uses Haiku model (fast, cheap)
  - `claude-sonnet .` → Uses Sonnet model (balanced)
  - `claude-opus .` → Uses Opus model (most powerful)

- **`my-agentic-code-project/.env.template`** - Environment configuration template with sections for:
  - Anthropic API key
  - Gmail MCP credentials
  - GitHub MCP token
  - Logging configuration
  - State management settings
  - Optional integrations (Slack, email, databases)

### Claude Code Settings

- **`.claude/settings.local.json`** - Local Claude Code permissions configuration (allows bash operations)

---

## Agentic Workflow Architecture

The repository enforces a specific architecture for building autonomous agents:

### Standard Agent Structure

```
agents/
├── email_processor.py      # Gmail integration agent
├── github_monitor.py       # GitHub Actions agent
└── multi_step_agent.py     # Complex multi-tool workflows

mcps/
├── gmail_config.json       # Gmail OAuth configuration
└── github_config.json      # GitHub API configuration

lib/
├── state_manager.py        # Persistent state storage (JSON files)
├── logger.py               # Structured logging with rotation
└── error_handlers.py       # Retry logic with exponential backoff

tests/
├── test_email_agent.py
└── test_github_agent.py

examples/
├── simple_email_processor.py      # Beginner example
├── github_workflow_monitor.py     # Intermediate example
└── multi_step_automation.py       # Advanced example
```

### Key Architectural Patterns

**Error Handling & Resilience:**
- All external API calls wrapped in try/except blocks
- Exponential backoff retry logic for transient failures
- Rate limit detection and adaptive delays
- Clear recovery procedures for known failure modes

**State Management:**
- Persistent state stored as JSON files (minimum requirement)
- Last execution timestamp tracked
- Success/failure counters maintained
- State recovery procedures for corruption scenarios
- Idempotent operations to allow safe retries

**Logging & Monitoring:**
- Structured logging with timestamps and context
- Log rotation at 10MB with 5 backup files
- Separate console and file handlers
- ERROR/WARNING/INFO levels
- No sensitive data (credentials, tokens, keys) in logs

**Security:**
- All credentials loaded from environment variables or `.env` files
- `.env` files added to `.gitignore`
- OAuth scopes minimized to required permissions only
- No hardcoded secrets in code
- Audit logging for sensitive operations

---

## Common Development Commands

### Environment Setup

```bash
# Configure Claude Code aliases (Haiku as default)
bash setup-claude-defaults.sh

# Create .env from template
cp my-agentic-code-project/.env.template my-agentic-code-project/.env

# Load environment variables
cd my-agentic-code-project
export $(cat .env | grep -v '^#' | xargs)
```

### Claude Code Usage

```bash
# Use Haiku model (default after setup)
claude .

# Use Sonnet model for current task
claude-sonnet .

# Use Opus model for complex tasks
claude-opus .

# Override model on-the-fly
CLAUDE_MODEL=claude-opus-4-1-20250805 claude .
```

### Agent Development

```bash
# Generate Gmail agent from guide
# Prompt: "Read my-agentic-code-project/docs/Claude_Code_Agentic_Workflows_Guide.md Part 3 and create agents/email_processor.py"

# Generate GitHub agent
# Prompt: "Read my-agentic-code-project/docs/Claude_Code_Agentic_Workflows_Guide.md Part 4 and create agents/github_monitor.py"

# Create utility modules
# Prompt: "Read my-agentic-code-project/docs/Claude_Code_Agentic_Workflows_Guide.md Part 6 and create lib/state_manager.py and lib/logger.py"
```

### Testing & Validation

```bash
# Run unit tests
python -m pytest my-agentic-code-project/tests/ -v

# Check for hardcoded secrets
grep -r "ANTHROPIC_API_KEY\|GITHUB_TOKEN\|GMAIL_TOKEN" my-agentic-code-project/agents/

# Verify .env is gitignored
grep ".env" my-agentic-code-project/.gitignore

# Check logs for sensitive data
grep -i "password\|secret\|token\|key" my-agentic-code-project/logs/*.log
```

---

## CRAFT Framework (Prompt Engineering)

All prompts should follow the CRAFT structure defined in `.cursorrules`:

- **Context** - Background, constraints, success criteria
- **Role** - Persona and expertise Claude should adopt
- **Action** - Numbered steps for complex tasks
- **Format** - Output structure and requirements
- **Tone** - Audience, formality, uncertainty handling

**Reference:** `my-agentic-code-project/docs/CRAFT_PROMPT_TEMPLATE.md` for complete template with examples.

---

## Hallucination Mitigation Strategy

The repository enforces strict hallucination prevention:

1. **Acknowledge knowledge cutoff** (January 2025) in prompts requesting current information
2. **Request explicit uncertainty** - Claude should state "I'm not certain" rather than guess
3. **Demand citations** - Reference specific document sections, line numbers, or URLs
4. **Request confidence levels** - Rate claims as HIGH/MEDIUM/LOW with reasoning
5. **Step-by-step reasoning** - Explain logic so assumptions are visible
6. **List assumptions** - Explicitly state what's being assumed
7. **Use web search** - For current data beyond knowledge cutoff

See `.cursorrules` "Hallucination Mitigation (Critical)" section for detailed requirements.

---

## MCP Integration Patterns

### Gmail MCP (Part 3 of guide)

Authentication: OAuth 2.0 with Gmail API
Operations: Read unread emails, search, send, add labels
Error handling: Rate limiting, token refresh, authentication failures

### GitHub Actions MCP (Part 4 of guide)

Authentication: Personal Access Token (PAT) with workflow scopes
Operations: Trigger workflows, monitor status, fetch artifacts/logs
Error handling: API rate limits, timeout handling, workflow failures

Both patterns follow the same architecture:
- Configuration stored in `mcps/*.json`
- Credentials from environment variables
- Error handling with exponential backoff
- State persistence for tracking operations

---

## Before Deploying Any Agent

Use the deployment checklist: `my-agentic-code-project/docs/AGENT_DEPLOYMENT_CHECKLIST.md`

Key sections to validate:
- **Code Quality** - Error handling, retry logic, documentation
- **State Management** - Persistence, recovery procedures
- **Logging & Monitoring** - Structured logs, no secrets, rotation
- **Security** - Credentials, OAuth scopes, audit logging
- **Testing** - Unit tests, error paths, integration tests
- **Documentation** - Setup instructions, configuration examples, runbook
- **Human Oversight** - Code review, escalation paths

---

## File Organization

```
claudeOne/
├── CLAUDE.md                          ← This file
├── .cursorrules                       ← Best practices rules
├── setup-claude-defaults.sh           ← Configure Claude Code aliases
├── my-agentic-code-project/
│   ├── .env.template                  ← Copy to .env for credentials
│   ├── agent-config.yaml              ← Agent configuration
│   ├── docs/
│   │   ├── Claude_Code_Agentic_Workflows_Guide.md
│   │   ├── CRAFT_Prompt_Engineering_Guide_for_Claude.md
│   │   ├── CRAFT_PROMPT_TEMPLATE.md
│   │   ├── AGENT_DEPLOYMENT_CHECKLIST.md
│   │   └── QUICK_REFERENCE.md
│   ├── agents/                        ← Agent implementations
│   ├── mcps/                          ← MCP configurations
│   ├── lib/                           ← Utilities (logger, state_manager)
│   ├── tests/                         ← Unit tests
│   ├── examples/                      ← Working code examples
│   └── logs/                          ← Runtime logs (gitignored)
└── .claude/
    └── settings.local.json            ← Claude Code permissions
```

---

## Key Concepts

**Agentic Workflows:** Autonomous AI agents that assess situations dynamically, plan multi-step solutions, use external tools, handle uncertainty, and adapt to changes. Preferred over traditional scripts when tasks involve:
- Multiple conditional steps
- Natural language reasoning about decisions
- External APIs or MCPs
- Error recovery requiring intelligent judgment

**State Management:** Essential for agents to maintain context across executions. Persists to JSON files or databases with recovery procedures if corrupted.

**Confidence Levels:** Mark all code and assumptions with HIGH/MEDIUM/LOW confidence:
- HIGH: Established patterns, well-tested, official documentation
- MEDIUM: Industry best practices, general patterns
- LOW: Emerging patterns, limited data, areas needing validation

**Minimal Permissions:** Always request only required OAuth scopes and API permissions. Rotate credentials regularly.

---

## When Starting New Agent Development

1. **Read the relevant guide section** from `Claude_Code_Agentic_Workflows_Guide.md` (e.g., Part 3 for Gmail, Part 4 for GitHub)
2. **Use CRAFT template** from `CRAFT_PROMPT_TEMPLATE.md` to structure your prompt
3. **Create agent file** in `agents/` directory
4. **Add MCP configuration** in `mcps/` if external integration needed
5. **Implement error handling** with try/except and exponential backoff (Part 6 patterns)
6. **Add state management** using `lib/state_manager.py` pattern
7. **Add logging** using `lib/logger.py` pattern
8. **Write tests** in `tests/` directory
9. **Run deployment checklist** before considering agent production-ready
10. **Document setup instructions** and create runbook for failures

---

## References & Further Reading

- **Full Agentic Workflows Guide:** `my-agentic-code-project/docs/Claude_Code_Agentic_Workflows_Guide.md`
- **CRAFT Framework Guide:** `my-agentic-code-project/docs/CRAFT_Prompt_Engineering_Guide_for_Claude.md`
- **Quick Reference Card:** `my-agentic-code-project/docs/QUICK_REFERENCE.md`
- **Best Practices Rules:** `.cursorrules`

---

**Last Updated:** January 17, 2026
**Repository Version:** 1.0
