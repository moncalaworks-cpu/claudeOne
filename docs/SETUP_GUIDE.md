# Complete Setup Guide

**Created:** 2026-02-12
**Status:** Complete ✅

This guide covers everything needed to set up the claudeOne development environment.

---

## Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/moncalaworks-cpu/claudeOne.git
cd claudeOne
```

### 2. Copy Environment Template
```bash
cp my-agentic-code-project/.env.template my-agentic-code-project/.env
```

### 3. Add Your Credentials
```bash
# Edit .env and add your:
# - ANTHROPIC_API_KEY (from https://console.anthropic.com)
# - GITHUB_TOKEN (from https://github.com/settings/tokens)
# - GMAIL_CREDENTIALS (optional, if using Gmail MCP)

nano my-agentic-code-project/.env
```

### 4. Load Environment
```bash
cd my-agentic-code-project
export $(cat .env | grep -v '^#' | xargs)
```

### 5. Verify Setup
```bash
echo $ANTHROPIC_API_KEY  # Should show your key
gh auth status          # Should show authenticated
```

Done! ✅

---

## Detailed Setup

### Prerequisites
- Git installed
- GitHub account with personal access token
- Claude Code CLI installed
- Python 3.8+ (optional, for agent development)
- GitHub CLI installed

### Step 1: Installation

#### Clone Repository
```bash
git clone https://github.com/moncalaworks-cpu/claudeOne.git
cd claudeOne
```

#### Create Virtual Environment (Python)
```bash
# Optional but recommended for Python projects
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

#### Install Dependencies
```bash
# For Python agents/scripts
pip install -r requirements.txt

# For Node.js (if using Claude Code CLI)
npm install -g @anthropic-ai/claude-code
```

### Step 2: Environment Configuration

#### Copy Template
```bash
cp my-agentic-code-project/.env.template my-agentic-code-project/.env
```

#### .env Template Variables

The `.env.template` file includes:

```bash
# Anthropic API (if using API directly - not recommended for cost reasons)
ANTHROPIC_API_KEY=sk-ant-...

# GitHub Configuration
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=moncalaworks-cpu
GITHUB_REPO=claudeOne

# Optional: Gmail MCP (if using email automation)
GMAIL_CREDENTIALS_PATH=./credentials/gmail_credentials.json
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly

# Optional: Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

#### Adding Credentials

**Anthropic API Key:**
1. Go to https://console.anthropic.com
2. Click "Create API Key"
3. Copy the key
4. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: `repo`, `workflow`, `admin:org_hook`
4. Copy and add to `.env`: `GITHUB_TOKEN=ghp_...`

**Gmail Credentials (Optional):**
1. Follow OAuth 2.0 setup in Gmail MCP guide
2. Save credentials.json
3. Add path to `.env`

#### Verify Configuration
```bash
# Load environment variables
cd my-agentic-code-project
export $(cat .env | grep -v '^#' | xargs)

# Verify key variables are set
echo "API Key: ${ANTHROPIC_API_KEY:0:10}..."  # Should show partial key
echo "GitHub Token: ${GITHUB_TOKEN:0:10}..."  # Should show partial token

# Verify GitHub CLI authentication
gh auth status
```

### Step 3: Claude Code CLI Setup

#### Installation
```bash
npm install -g @anthropic-ai/claude-code
```

#### Configuration
```bash
# Configure model defaults
cat >> ~/.bash_profile << 'EOF'
# Claude Code aliases
alias claude='claude --model claude-haiku-4-5-20251001'
alias claude-sonnet='claude --model claude-sonnet-4-5-20250929'
alias claude-opus='claude --model claude-opus-4-6'
EOF

source ~/.bash_profile
```

#### Verify Installation
```bash
claude --version
```

### Step 4: Git Configuration

```bash
# Configure git user (if not already configured)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git config --list | grep user
```

### Step 5: Directory Structure

The project is organized as:

```
claudeOne/
├── CLAUDE.md                    # Project instructions
├── REQUIREMENTS.md              # All requirements
├── .cursorrules                 # Best practices rules
├── .github/
│   ├── workflows/               # GitHub Actions
│   └── ISSUE_TEMPLATE/          # Issue templates
├── docs/                        # Documentation
│   ├── SETUP_GUIDE.md          # This file
│   ├── PM_WORKFLOW.md          # Project management
│   ├── AUTOMATION_GUIDE.md     # Automation setup
│   └── ...more guides
├── agents/                      # Agent scripts
│   └── analyze-issue-local.sh  # GitHub issue analyzer
├── my-agentic-code-project/
│   ├── .env.template           # Environment template
│   ├── .env                     # Your credentials (git-ignored)
│   ├── docs/                    # Comprehensive guides
│   ├── agents/                  # Agent implementations
│   ├── tests/                   # Unit tests
│   └── examples/                # Working examples
└── .gitignore                   # Git exclusions
```

---

## Configuration Files

### .env File

Create `my-agentic-code-project/.env`:

```bash
# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-key-here

# GitHub Configuration
GITHUB_TOKEN=ghp_your-token-here
GITHUB_OWNER=moncalaworks-cpu
GITHUB_REPO=claudeOne

# Optional: Gmail Configuration
GMAIL_CREDENTIALS_PATH=./credentials/gmail.json
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/claudeone.log

# Local Development
DEBUG=false
```

**Important:** `.env` is added to `.gitignore` and should NEVER be committed.

### .github/settings.local.json

Claude Code configuration:

```json
{
  "permissions": {
    "bash": true,
    "file_operations": true,
    "git_operations": true
  },
  "model": "claude-haiku-4-5-20251001",
  "timeout": 300000
}
```

---

## Common Setup Issues

### "API Key not found"
**Problem:** ANTHROPIC_API_KEY not set
**Solution:**
```bash
# Check if env var is set
echo $ANTHROPIC_API_KEY

# If empty, load from .env:
export $(cat my-agentic-code-project/.env | grep ANTHROPIC_API_KEY)

# Verify
echo $ANTHROPIC_API_KEY
```

### "gh: not found"
**Problem:** GitHub CLI not installed
**Solution:**
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
choco install gh  # Windows
# or
apt install gh  # Linux

# Verify
gh --version
```

### "Permission denied" on .env
**Problem:** Wrong file permissions
**Solution:**
```bash
chmod 600 my-agentic-code-project/.env
```

### "Invalid GitHub token"
**Problem:** Token is incorrect or expired
**Solution:**
1. Go to https://github.com/settings/tokens
2. Check token hasn't expired
3. Regenerate if needed
4. Update `.env` with new token
5. Verify: `gh auth status`

---

## Verification Checklist

After setup, verify everything works:

- [ ] `echo $ANTHROPIC_API_KEY` shows partial key
- [ ] `gh auth status` shows authenticated
- [ ] `claude --version` shows version number
- [ ] `git config --list` shows your user info
- [ ] `.env` file exists and is in `.gitignore`
- [ ] `.env` is readable only by user: `ls -la my-agentic-code-project/.env`
- [ ] Can run: `python agents/analyze-issue-local.sh 1`
- [ ] GitHub Projects board is accessible

---

## Next Steps After Setup

1. **Read CLAUDE.md** - Project overview and conventions
2. **Review docs/** - All available guides
3. **Check REQUIREMENTS.md** - What needs to be built
4. **Setup GitHub Projects board** - See PM_WORKFLOW.md
5. **Start working on requirements** - See AUTOMATION_GUIDE.md

---

## Support

**Questions about setup?**
- Check this guide's "Common Issues" section
- See CLAUDE.md for project context
- Review docs/PM_WORKFLOW.md for workflow questions
- Check docs/AUTOMATION_GUIDE.md for automation setup

**Need help?**
- File an issue on GitHub
- See error messages in logs/

---

**Version:** 1.0
**Status:** Complete ✅
**Last Updated:** 2026-02-12
