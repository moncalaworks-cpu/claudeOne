# Claude Code: MCP, Tools, and Skills Overview

A comprehensive guide to extending Claude Code's capabilities through Model Context Protocol (MCP), Tools, and Skills.

---

## Quick Comparison

| Aspect | MCP | Tools | Skills |
|--------|-----|-------|--------|
| **What It Is** | Protocol for integrating external systems | Built-in Claude capabilities | Custom slash commands (/command) |
| **Purpose** | Connect to APIs, databases, services | File ops, web access, code execution | Automate common workflows |
| **Who Creates** | Usually external services/servers | Anthropic (built-in) | You (custom) or community |
| **Configuration** | Configuration files + authentication | Automatic (no setup) | Defined as custom scripts/commands |
| **Examples** | Gmail API, GitHub API, Slack API | Web search, code execution, files | /commit, /review-pr, /pdf |
| **When to Use** | Need external system integration | Need standard capabilities | Need to repeat workflows |

---

## Part 1: MCP (Model Context Protocol)

### What is MCP?

MCP is a **standardized protocol** that allows Claude to safely and securely interact with external systems, services, and data sources. It acts as a bridge between Claude and:
- External APIs (Gmail, GitHub, Slack, etc.)
- Databases and data stores
- File systems
- Custom internal services
- Cloud services

### How MCP Works

```
┌─────────────────────────────────────────┐
│         Claude Code (Client)            │
│                                         │
│  Sends: "Fetch unread emails"           │
│  Receives: [Structured email data]      │
└────────────────┬────────────────────────┘
                 │ MCP Protocol
                 │ (JSON-RPC over stdio/HTTP/WebSocket)
                 │
┌────────────────▼────────────────────────┐
│      MCP Server (External System)        │
│                                         │
│  Gmail API Service                      │
│  ├─ Authenticate with OAuth             │
│  ├─ Query unread emails                 │
│  └─ Return structured response           │
└─────────────────────────────────────────┘
```

### MCP Components

**MCP Server:**
- Runs external to Claude Code
- Provides access to specific service (Gmail, GitHub, etc.)
- Handles authentication (OAuth, API keys)
- Implements standardized MCP interface

**MCP Client:**
- Claude Code running in your terminal
- Sends requests to MCP servers
- Receives structured responses
- Manages multiple MCP connections

**Configuration:**
- Stored in `mcps/*.json` files
- Contains authentication details
- Specifies available operations
- Rate limits and constraints

### Common MCP Integrations

#### Gmail MCP
```json
{
  "mcp_name": "gmail",
  "type": "google_workspace",
  "authentication": {
    "type": "oauth2",
    "credentials_file": "./mcps/gmail_credentials.json",
    "token_file": "./mcps/gmail_token.json"
  },
  "operations": [
    "read_unread_emails",
    "search_emails",
    "send_email",
    "add_label"
  ]
}
```

**Capabilities:**
- Fetch unread emails
- Search with Gmail query syntax
- Send emails
- Apply labels
- Archive/delete
- Thread management

#### GitHub Actions MCP
```json
{
  "mcp_name": "github_actions",
  "type": "github_api",
  "authentication": {
    "type": "personal_access_token",
    "token_env_var": "GITHUB_TOKEN"
  },
  "operations": [
    "trigger_workflow",
    "monitor_run",
    "fetch_artifacts",
    "get_logs"
  ]
}
```

**Capabilities:**
- Trigger workflows
- Monitor execution status
- Retrieve artifacts
- Get workflow logs
- List recent runs
- Cancel runs

#### Slack MCP (Example)
```json
{
  "mcp_name": "slack",
  "type": "slack_api",
  "authentication": {
    "type": "bot_token",
    "token_env_var": "SLACK_BOT_TOKEN"
  },
  "operations": [
    "send_message",
    "create_thread",
    "fetch_history",
    "add_reaction"
  ]
}
```

### MCP Authentication Patterns

**OAuth 2.0 (Gmail):**
1. User authorizes Claude Code to access Gmail
2. OAuth token obtained and stored
3. Token automatically refreshed as needed
4. Credentials never exposed in code

**Personal Access Tokens (GitHub):**
1. User creates PAT on GitHub with required scopes
2. Token stored in environment variable
3. Token used for all API requests
4. Scopes minimized to required permissions

**API Keys (Custom services):**
1. Key stored in environment variables
2. Key passed in request headers
3. Key never logged or exposed
4. Key rotation policy enforced

### MCP Best Practices

**From `.cursorrules` and guides:**

- ✅ Always include OAuth/authentication setup details
- ✅ Implement exponential backoff for rate limiting
- ✅ Never log full credentials or sensitive data
- ✅ Include example configurations before implementation
- ✅ Provide comprehensive error handling with recovery strategies
- ✅ Add monitoring and state persistence

**Security:**
- Minimize OAuth scopes to required permissions only
- Store tokens securely (not in version control)
- Implement token refresh logic
- Log auth failures for audit trail
- Rotate credentials regularly

**Error Handling:**
- Catch rate limit errors and implement backoff
- Handle token expiration gracefully
- Provide clear error messages
- Include recovery procedures
- Log errors without exposing credentials

---

## Part 2: Tools

### What are Tools?

Tools are **built-in Claude capabilities** that don't require external configuration. They're provided by Claude Code and can be used immediately without setup.

### Available Tools in Claude Code

#### 1. Web Search
**Purpose:** Access current information beyond knowledge cutoff (January 2025)

```python
# Implicit usage in prompts
"Search the web for the latest Claude Code features released in 2026"

# Claude will:
# 1. Perform web search
# 2. Retrieve current information
# 3. Synthesize results
# 4. Provide sources with URLs
```

**When to use:**
- Current events or breaking news
- Recent software releases
- Updated API documentation
- Market data or pricing changes
- Any information beyond January 2025

**Limitations:**
- Knowledge cutoff awareness required
- Source reliability varies
- May return conflicting information
- Rate limited by search provider

#### 2. File Operations
**Purpose:** Read, write, and manage files in your project

**Read Files:**
```
"Read the file at src/components/App.tsx and explain the component structure"
```

**Write Files:**
```
"Create a new file at lib/utils.py with these utility functions: [...]"
```

**Supported Operations:**
- Read files (text, code, markdown, JSON)
- Write new files
- Edit existing files
- Create directories
- List directory contents
- Check file existence

**Limitations:**
- Can only access project and home directories
- Very large files may exceed token limits
- No direct delete operations (use edit to clear)
- Respects OS file permissions

#### 3. Code Execution
**Purpose:** Write and run code to perform tasks

```
"Write Python code to:
1. Load data.csv
2. Calculate statistics
3. Generate visualizations
4. Save results to output.json"
```

**Supported Languages:**
- Python (primary)
- JavaScript/Node.js
- Shell/Bash
- SQL (in some contexts)

**Capabilities:**
- Execute arbitrary code
- Install packages
- Access file system
- Network operations
- Generate outputs

**Limitations:**
- Sandboxed environment (no system access)
- Network restrictions may apply
- Memory limits per execution
- Timeout limits (typically 30-60 seconds)
- No persistent state between executions

#### 4. Git Operations
**Purpose:** Interact with git repositories

```
"Run git diff to show all changes"
"Commit the changes with message: 'Fix bug in auth'"
```

**Available Operations:**
- git status (show working tree status)
- git diff (show changes)
- git add (stage files)
- git commit (create commits)
- git log (view history)
- git push (push to remote)
- git pull (fetch and merge)
- git branch (manage branches)

**Limitations:**
- No interactive rebases
- No force pushes by default
- Respects repository permissions
- Requires authentication for remote operations

#### 5. Terminal/Shell Commands
**Purpose:** Execute system commands (with permission)

```
"Run: npm install"
"Execute: python -m pytest tests/"
"Check: ls -la src/"
```

**When to use:**
- Package management
- Running tests
- Building projects
- System diagnostics
- Custom scripts

**Security:**
- Requires explicit permission in `.claude/settings.local.json`
- Dangerous commands blocked by default
- Audit trail maintained
- Clear notification of command execution

### Tool Combination Patterns

Tools often work together:

```
Web Search → Find current API docs
File Operations → Create implementation
Code Execution → Test the code
Git Operations → Commit changes
```

Example workflow:
```
"Search for latest React hooks documentation →
 Read my existing component files →
 Write updated implementation →
 Run tests with code execution →
 Commit to git"
```

---

## Part 3: Skills

### What are Skills?

Skills are **custom slash commands** (invoked with `/`) that automate common workflows. They're extensions you define or install to enhance Claude Code.

### How Skills Work

```
User: /commit
       ↓
Claude Code recognizes skill
       ↓
Skill loads with full context
       ↓
Skill performs workflow:
  1. Gather information (git status, diff)
  2. Analyze changes
  3. Generate suggestions
  4. Execute commands
  5. Report results
       ↓
User gets structured output
```

### Built-In Skills (Examples)

#### /commit
**Purpose:** Generate and create git commits automatically

```bash
/commit
# Claude Code:
# 1. Runs git status
# 2. Runs git diff to see changes
# 3. Analyzes changes
# 4. Generates commit message
# 5. Shows message for approval
# 6. Executes commit
```

**Smart features:**
- Analyzes change scope
- Follows commit conventions
- Suggests message format
- Provides co-author attribution
- Asks for approval before committing

#### /review-pr
**Purpose:** Review pull requests and code changes

```bash
/review-pr 123
# Claude Code:
# 1. Fetches PR details
# 2. Reviews code changes
# 3. Checks for issues
# 4. Suggests improvements
# 5. Comments on PR
```

**Capabilities:**
- Code quality analysis
- Security vulnerability detection
- Performance suggestions
- Test coverage analysis
- Documentation completeness

#### /pdf
**Purpose:** Process PDF files

```bash
/pdf --extract "document.pdf"
# or
/pdf --summarize "document.pdf"
```

**Operations:**
- Extract text and images
- Summarize content
- Search within documents
- Convert to markdown
- Analyze structure

### Custom Skills

You can create custom skills for your workflow:

```bash
# Example structure
.claude/skills/
├── my-skill.js
├── deploy.js
├── audit.js
└── config.json
```

**Creating a Custom Skill:**

```javascript
// .claude/skills/deploy.js
module.exports = {
  name: "deploy",
  description: "Deploy agent to production with validation",

  async execute(args) {
    // 1. Run deployment checklist
    // 2. Validate configuration
    // 3. Create backup
    // 4. Execute deployment
    // 5. Verify success
    // 6. Report results
  }
};
```

**Using Custom Skill:**
```bash
/deploy --environment production
```

### Skill vs. Manual Commands

| Aspect | Manual Prompt | Skill |
|--------|---------------|-------|
| **Invocation** | Describe task in words | `/skillname` |
| **Context** | You provide context | Skill gathers context |
| **Steps** | Claude figures out steps | Skill defines steps |
| **Repeatability** | Different each time | Consistent every time |
| **Setup** | Describe once | Define once, use many times |

---

## Part 4: How MCP, Tools, and Skills Work Together

### Integration Architecture

```
┌──────────────────────────────────────────────────────┐
│              Claude Code (Your Terminal)             │
│                                                      │
│  User Input:  /commit                               │
│       ↓                                              │
│  Skill: /commit  ← Loads custom workflow             │
│       ↓                                              │
│  ┌─ Uses Tool: Git Operations                        │
│  │  (git status, git diff)                           │
│  │                                                  │
│  ├─ Uses Tool: Code Execution                        │
│  │  (run tests to verify changes)                    │
│  │                                                  │
│  └─ Uses Tool: File Operations                       │
│     (read package.json for versioning)               │
└──────────────────────────────────────────────────────┘
```

### Real-World Workflow Example

**Multi-Step Automation Agent:**

```
Input: "Process unread emails and trigger related tests"

1. MCP (Gmail) → Fetch unread emails
2. Tool (Code Execution) → Parse email content
3. Tool (File Operations) → Write results to file
4. MCP (GitHub) → Trigger test workflow
5. Skill (Custom) → Monitor and report results
```

**Implementation in agent:**

```python
# agents/multi_step_automation.py

class MultiStepAgent:
    def __init__(self):
        self.gmail_mcp = GmailMCP()        # MCP Integration
        self.github_mcp = GitHubMCP()      # MCP Integration

    def run(self):
        # Step 1: Use Gmail MCP
        emails = self.gmail_mcp.read_unread()

        # Step 2: Use Code Execution Tool
        processed = self.process_emails(emails)

        # Step 3: Use File Operations Tool
        self.save_results(processed)

        # Step 4: Use GitHub MCP
        run_id = self.github_mcp.trigger_workflow()

        # Step 5: Use custom skill (monitoring)
        self.monitor_and_report(run_id)
```

---

## Part 5: Practical Examples

### Example 1: Using Gmail MCP + Tools

**Scenario:** Process emails and create summary report

```
Prompt: "
Use Gmail MCP to fetch the last 20 emails from 'important@clients.com'.
For each email:
1. Extract key information
2. Categorize by topic
3. Generate summary

Write results to email_summary.md
Run Python script to create statistics
"
```

**What happens:**
- MCP: Authenticates with Gmail, fetches emails
- Tool: File Operations writes markdown file
- Tool: Code Execution runs analysis script

### Example 2: Using GitHub MCP + Skill

**Scenario:** Trigger tests and create commit

```bash
/commit

# Skill workflow:
# 1. Git Tool: git status
# 2. Git Tool: git diff
# 3. GitHub MCP: Check CI status
# 4. Tool: Code Execution (run local tests)
# 5. Generate commit message
# 6. Git Tool: commit
# 7. GitHub MCP: Push to remote
# 8. Skill: Monitor PR/Actions
```

### Example 3: Custom Skill Using Multiple Tools

**Scenario:** Deploy with validation

```bash
/deploy --environment staging

# Custom skill executes:
# 1. File Ops: Read deployment checklist
# 2. Tool: Code Execution (run tests)
# 3. Tool: Code Execution (build project)
# 4. MCP: GitHub trigger deploy workflow
# 5. MCP: Slack notify team
# 6. Tool: Shell commands (verify deployment)
# 7. File Ops: Write deployment log
# 8. Git Tool: Tag release
```

---

## Part 6: Best Practices

### When to Use Each

**Use MCP When:**
- You need to interact with external services
- Authentication is required (OAuth, API keys)
- Working with user accounts (Gmail, GitHub)
- Need rate limiting and error handling

**Use Tools When:**
- Performing standard operations (file, code, git)
- No external service integration needed
- Need quick, in-context operations
- Operating on local files and repos

**Use Skills When:**
- Repeating the same workflow frequently
- Need consistent, structured process
- Want to abstract complexity
- Building workflows others will use

### Security Considerations

**MCPs:**
- Minimize credential scope
- Rotate tokens regularly
- Never log credentials
- Use environment variables
- Implement audit logging

**Tools:**
- Respect sandboxing
- Validate all inputs
- No destructive operations by default
- Explicit permission for shell commands
- Review generated code before execution

**Skills:**
- Only install from trusted sources
- Review skill source code
- Test in non-production first
- Document permissions required
- Version control skill definitions

---

## Part 7: Configuration & Setup

### MCP Configuration Location

```
my-agentic-code-project/
├── mcps/
│   ├── gmail_config.json
│   ├── github_config.json
│   ├── gmail_credentials.json
│   └── gmail_token.json
```

### Tool Permissions

```json
// .claude/settings.local.json
{
  "permissions": {
    "allow": [
      "Bash(bash:*)",
      "Bash(test:*)",
      "Bash(chmod:*)"
    ]
  }
}
```

### Skill Configuration

```yaml
# .claude/skills/config.yaml
skills:
  - name: commit
    enabled: true
    permissions: [git, exec]

  - name: deploy
    enabled: true
    permissions: [git, exec, mcp:github]
    environment: production
```

---

## Part 8: Troubleshooting

### MCP Issues

**"Authentication failed"**
- Check credentials file path
- Verify token not expired
- Re-authenticate if needed
- Check OAuth scopes

**"Rate limit exceeded"**
- Implement exponential backoff
- Add delays between requests
- Check rate limit headers
- Use batching where possible

**"Connection timeout"**
- Check service availability
- Verify network connectivity
- Increase timeout values
- Check firewall rules

### Tool Issues

**"File not found"**
- Verify absolute path
- Check file permissions
- Ensure file exists
- Check path separators (/ vs \)

**"Code execution timeout"**
- Optimize code
- Break into smaller chunks
- Reduce data size
- Increase timeout if available

**"Permission denied"**
- Check git permissions
- Verify file ownership
- Check .gitignore rules
- Verify authentication

### Skill Issues

**"Skill not found"**
- Check skill path
- Verify skill name
- Check skill enabled status
- Look for typos

**"Permission denied"**
- Check skill permissions config
- Verify user has access
- Check MCP authentication
- Review security policies

---

## Quick Reference

### MCP Operations

```
Gmail:
- read_unread_emails()
- search_emails(query)
- send_email(to, subject, body)
- add_label(message_id, label)

GitHub:
- trigger_workflow(owner, repo, workflow_id)
- monitor_run(owner, repo, run_id)
- get_artifacts(owner, repo, run_id)
- get_logs(owner, repo, run_id)
```

### Tools

```
Web Search:
- Search for current information
- Fetch URLs
- Analyze content

File Operations:
- Read files
- Write files
- List directories
- Check existence

Code Execution:
- Run Python
- Run JavaScript
- Run Shell commands
- Install packages

Git:
- status, diff, add, commit
- log, branch, merge, push, pull
```

### Skills

```
/commit              # Create git commit with analysis
/review-pr [id]      # Review pull request
/pdf [options] [file] # Process PDF files
/[custom-name]       # Custom skills you define
```

---

## References

**Detailed Guides in this Project:**
- `Claude_Code_Agentic_Workflows_Guide.md` Part 3 (Gmail MCP)
- `Claude_Code_Agentic_Workflows_Guide.md` Part 4 (GitHub MCP)
- `Claude_Code_Agentic_Workflows_Guide.md` Part 5 (Skills & Tools)
- `.cursorrules` - Best practices for MCPs

**External Resources:**
- Anthropic MCP Documentation: https://docs.anthropic.com/
- Claude Code Features: https://claude.ai/code
- Model Context Protocol: https://modelcontextprotocol.io/

---

**Last Updated:** January 17, 2026
**Version:** 1.0
