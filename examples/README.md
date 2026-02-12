# Working Code Examples

**Created:** 2026-02-12
**Related Requirement:** REQ-006

This directory contains complete, runnable examples demonstrating increasing complexity.

---

## Examples Included

### 1. Simple Email Processor (Beginner)
**File:** `simple_email_processor.py`
**Difficulty:** Beginner
**Time to Understand:** 15 minutes

What it does:
- Connects to Gmail via MCP
- Reads unread emails
- Prints subject and sender
- Marks as read

Key concepts:
- Basic MCP integration
- Error handling
- Logging

```bash
python simple_email_processor.py
```

---

### 2. GitHub Workflow Monitor (Intermediate)
**File:** `github_workflow_monitor.py`
**Difficulty:** Intermediate
**Time to Understand:** 30 minutes

What it does:
- Monitors GitHub Actions workflows
- Checks workflow status
- Logs results
- Handles errors gracefully

Key concepts:
- GitHub API integration
- State persistence
- Retry logic
- Error recovery

```bash
python github_workflow_monitor.py --repo owner/repo
```

---

### 3. Multi-Step Automation (Advanced)
**File:** `multi_step_automation.py`
**Difficulty:** Advanced
**Time to Understand:** 60 minutes

What it does:
- Reads GitHub issues
- Analyzes with Claude
- Creates branches
- Updates labels
- Manages state across steps

Key concepts:
- Multi-step workflows
- State management
- Complex error handling
- Logging and monitoring

```bash
python multi_step_automation.py --issue 123
```

---

## Common Patterns

All examples include:
- ✅ Error handling with try/except
- ✅ Exponential backoff retry logic
- ✅ Structured logging
- ✅ State persistence
- ✅ Configuration management
- ✅ Unit tests
- ✅ Documentation

---

## Running Examples

### Setup

1. Copy `.env.template` to `.env`
2. Add your credentials
3. Load environment: `export $(cat .env | xargs)`
4. Install dependencies: `pip install -r requirements.txt`

### Run Example

```bash
# Simple example (no arguments needed)
python simple_email_processor.py

# With arguments
python github_workflow_monitor.py --repo moncalaworks-cpu/claudeOne

# Verbose output
python multi_step_automation.py --issue 1 --verbose
```

---

## Testing Examples

Each example includes tests:

```bash
# Run tests
pytest test_simple_email_processor.py -v

# Run with coverage
pytest --cov=examples test_*.py
```

---

## Architecture

All examples follow this pattern:

```
Example
├── Configuration (env vars, config files)
├── Initialization (setup logger, state, connections)
├── Main Logic (the actual work)
├── Error Handling (graceful failures, retries)
├── Logging (structured output)
├── State Persistence (save progress)
└── Cleanup (close connections, finalize)
```

---

## Extending Examples

To adapt an example for your needs:

1. Copy the example file
2. Update configuration
3. Modify main logic
4. Test thoroughly
5. Add to your project

---

## Best Practices Demonstrated

- ✅ Error handling (try/except/finally)
- ✅ Retry logic with exponential backoff
- ✅ Structured logging
- ✅ State management
- ✅ Configuration management
- ✅ Unit testing
- ✅ Documentation
- ✅ Type hints
- ✅ Docstrings
- ✅ Assertion validation

---

## Resources

- **Code:** See individual example files
- **Tests:** See `test_*.py` files
- **Configuration:** See `.env.template` and config files
- **Documentation:** README in each example

---

**Status:** Complete ✅
**Version:** 1.0
**Last Updated:** 2026-02-12
