#!/bin/bash

# Claude Code Default Settings Setup Script
# This script adds shell aliases for Claude Code with sensible defaults

set -e  # Exit on error

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Claude Code Default Settings Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    # Check what shell is being used
    CURRENT_SHELL=$(basename "$SHELL")
    if [ "$CURRENT_SHELL" = "zsh" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
        SHELL_NAME="zsh"
    elif [ "$CURRENT_SHELL" = "bash" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
        SHELL_NAME="bash"
    else
        echo -e "${RED}Error: Could not detect shell type${NC}"
        echo "Detected shell: $CURRENT_SHELL"
        exit 1
    fi
fi

echo -e "${YELLOW}Detected shell: $SHELL_NAME${NC}"
echo -e "${YELLOW}Config file: $SHELL_CONFIG${NC}\n"

# Check if config file exists
if [ ! -f "$SHELL_CONFIG" ]; then
    echo -e "${YELLOW}Creating $SHELL_CONFIG...${NC}"
    touch "$SHELL_CONFIG"
fi

# Define the alias and functions to add
CLAUDE_ALIAS='alias claude="claude code --model claude-3-5-haiku-20241022"'
CLAUDE_SONNET='alias claude-sonnet="claude code --model claude-3-5-sonnet-20241022"'
CLAUDE_OPUS='alias claude-opus="claude code --model claude-opus-4-1-20250805"'

# Create a comment block identifying our additions
COMMENT_START="# === Claude Code Aliases (Added by setup-claude-defaults.sh) ==="
COMMENT_END="# === End Claude Code Aliases ==="

# Check if aliases already exist
if grep -q "Claude Code Aliases" "$SHELL_CONFIG"; then
    echo -e "${YELLOW}Claude Code aliases already configured.${NC}"
    echo -e "${YELLOW}Remove them manually if you want to reconfigure:${NC}"
    echo -e "${BLUE}  grep -n 'Claude Code Aliases' $SHELL_CONFIG${NC}\n"

    read -p "Overwrite existing aliases? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping alias setup.${NC}\n"
        exit 0
    fi

    # Remove old aliases
    echo -e "${YELLOW}Removing old aliases...${NC}"
    sed -i.bak "/# === Claude Code Aliases/,/# === End Claude Code Aliases ===/d" "$SHELL_CONFIG"
    echo -e "${GREEN}✓ Removed old aliases${NC}\n"
fi

# Add new aliases
echo -e "${YELLOW}Adding new aliases to $SHELL_CONFIG...${NC}"

cat >> "$SHELL_CONFIG" << EOF

$COMMENT_START
# Default: Haiku (fast, cheap, great for development)
$CLAUDE_ALIAS

# Alternative: Sonnet (balanced capability/cost)
$CLAUDE_SONNET

# Alternative: Opus (most powerful, for complex tasks)
$CLAUDE_OPUS

# Usage examples:
#   claude .                    # Default Haiku model
#   claude-sonnet .             # Use Sonnet model
#   claude-opus .               # Use Opus model
#
# You can also override on the fly:
#   CLAUDE_MODEL=claude-opus-4-1-20250805 claude .
$COMMENT_END
EOF

echo -e "${GREEN}✓ Added aliases to $SHELL_CONFIG${NC}\n"

# Show what was added
echo -e "${BLUE}Aliases added:${NC}"
echo -e "${GREEN}  claude${NC}        → Haiku (default, fast & cheap)"
echo -e "${GREEN}  claude-sonnet${NC}  → Sonnet (balanced)"
echo -e "${GREEN}  claude-opus${NC}    → Opus (most powerful)\n"

# Source the config to apply changes
echo -e "${YELLOW}Applying changes...${NC}"
source "$SHELL_CONFIG"
echo -e "${GREEN}✓ Shell configuration reloaded${NC}\n"

# Verify the alias works
echo -e "${YELLOW}Testing aliases...${NC}"
if alias claude &> /dev/null; then
    echo -e "${GREEN}✓ 'claude' alias working${NC}"
    echo "  $(alias claude)"
else
    echo -e "${RED}✗ 'claude' alias not found${NC}"
fi

if alias claude-sonnet &> /dev/null; then
    echo -e "${GREEN}✓ 'claude-sonnet' alias working${NC}"
    echo "  $(alias claude-sonnet)"
else
    echo -e "${RED}✗ 'claude-sonnet' alias not found${NC}"
fi

if alias claude-opus &> /dev/null; then
    echo -e "${GREEN}✓ 'claude-opus' alias working${NC}"
    echo "  $(alias claude-opus)"
else
    echo -e "${RED}✗ 'claude-opus' alias not found${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}\n"

echo -e "${YELLOW}Now you can use:${NC}"
echo -e "  ${GREEN}claude .${NC}                    # Default Haiku model"
echo -e "  ${GREEN}claude-sonnet .${NC}             # Use Sonnet model"
echo -e "  ${GREEN}claude-opus .${NC}               # Use Opus model\n"

echo -e "${YELLOW}To override model on-the-fly:${NC}"
echo -e "  ${GREEN}CLAUDE_MODEL=claude-opus-4-1-20250805 claude .${NC}\n"

echo -e "${YELLOW}If you want to use a different default, edit:${NC}"
echo -e "  ${BLUE}$SHELL_CONFIG${NC}\n"

echo -e "${YELLOW}Available models:${NC}"
echo "  - claude-3-5-haiku-20241022 (fastest, cheapest)"
echo "  - claude-3-5-sonnet-20241022 (balanced)"
echo "  - claude-opus-4-1-20250805 (most powerful)"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Optional: Ask if they want to test
read -p "Would you like to test Claude Code now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running: claude --version${NC}\n"
    claude --version || echo -e "${RED}Claude Code not found. Make sure it's installed.${NC}"
fi

echo -e "${GREEN}Setup complete!${NC}\n"
