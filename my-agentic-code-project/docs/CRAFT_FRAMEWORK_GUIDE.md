# CRAFT Framework for Prompt Engineering

**Author:** Claude Code
**Created:** 2026-02-12
**Status:** Complete
**Related Requirement:** REQ-002

---

## Overview

**CRAFT** is a structured framework for writing effective prompts to Claude AI. It helps ensure your prompts are clear, contextual, and produce consistent, high-quality responses.

CRAFT stands for:
- **C**ontext
- **R**ole
- **A**ction
- **F**ormat
- **T**one

---

## The 5 Components

### 🎯 **C - Context**

**What it is:** Background information and constraints that shape how Claude should approach the task.

**Why it matters:** Claude needs to understand the bigger picture, your constraints, and success criteria.

**Examples:**
```
❌ Bad:
"Write a function"

✅ Good:
"We're building a GitHub automation tool for project managers.
This function will process GitHub issues and extract requirements.
Constraints: Must handle issues with no description,
must be fast (<100ms), must work with gh CLI."
```

**What to include:**
- Background about the task
- Who will use the output
- Constraints (performance, budget, platform)
- Success criteria
- What you've already tried (if applicable)

---

### 👤 **R - Role**

**What it is:** The persona or expertise you want Claude to adopt.

**Why it matters:** Claude adapts its communication style and technical depth based on the role.

**Examples:**
```
❌ Bad:
"Help me with this code"

✅ Good:
"You are an expert DevOps engineer with 10 years of experience
in GitHub Actions automation. You understand shell scripting,
bash, and GitHub's API. Think like someone who builds robust,
production-grade automation."
```

**Common roles:**
- Senior software engineer
- DevOps specialist
- Product manager
- Technical writer
- Security researcher
- Data scientist
- System architect

**Benefits:**
- Raises quality of responses
- Gets more technical depth when needed
- Appropriate for your audience
- Shapes the perspective

---

### ✅ **A - Action**

**What it is:** The specific task(s) you want Claude to perform.

**Why it matters:** Clear actions prevent vague or incomplete responses.

**Format:** Use numbered steps for complex tasks.

**Examples:**
```
❌ Bad:
"Fix this code"

✅ Good:
"Complete the following steps:
1. Identify the bugs in the provided code
2. Explain why each bug causes problems
3. Provide a fixed version with comments
4. Suggest test cases to prevent regressions"
```

**Best practices:**
- Start with action verbs: "Analyze", "Create", "Review", "Explain"
- Break complex tasks into numbered steps
- Be specific about what you want
- Include any conditional logic ("if X, then do Y")

---

### 📋 **F - Format**

**What it is:** How you want the response structured and delivered.

**Why it matters:** Structured output is easier to parse and use.

**Examples:**
```
❌ Bad:
"Give me analysis"

✅ Good:
"Provide your response as:
- A summary (1 paragraph)
- 3-5 key findings (bullet points)
- Recommended next steps (numbered)
- Code examples (in markdown code blocks)
- Confidence level for each finding (HIGH/MEDIUM/LOW)"
```

**Format options:**
- **Structured:** JSON, YAML, tables, lists
- **Narrative:** Paragraphs with headings
- **Technical:** Code blocks, math notation, diagrams
- **Hybrid:** Mix of above
- **File-based:** Markdown, scripts, config files

**Pro tip:** Be specific about code formatting:
```
✅ "Provide as valid Python code in a markdown block:
\`\`\`python
# Your code here
\`\`\`"
```

---

### 🎭 **T - Tone**

**What it is:** The style, formality, and approach for communication.

**Why it matters:** Tone affects how the response is received and understood.

**Examples:**
```
❌ Bad:
"Explain this concept"

✅ Good:
"Explain this concept in a conversational tone,
as if teaching a colleague. Use analogies when helpful.
Acknowledge where you're uncertain rather than guessing."
```

**Common tones:**
- **Professional/Formal** - For business, documentation
- **Conversational** - For learning, discussion
- **Technical** - For engineers, detailed specs
- **Beginner-friendly** - For learning, no jargon
- **Casual** - For creative work
- **Analytical** - For research, data-driven

**Advanced tone options:**
- Be direct and concise (no fluff)
- Acknowledge uncertainty ("I'm not 100% sure, but...")
- Admit limitations
- Highlight edge cases
- Question assumptions

---

## Complete CRAFT Examples

### Example 1: Code Review

```
Context:
We're building GitHub automation in a monorepo with Python.
Our team values reliability and maintainability over speed.
Success means: no bugs in production, easy for teammates to understand.

Role:
You are a senior Python engineer who specializes in API integration
and error handling. You've built production systems handling
millions of requests.

Action:
1. Review this GitHub Actions script for bugs
2. Identify security issues
3. Suggest improvements for reliability
4. Rate your confidence in each suggestion

Format:
Provide as:
- Summary (1 paragraph)
- Bugs found (with severity: CRITICAL/HIGH/MEDIUM)
- Security issues (if any)
- Improvement suggestions (with impact assessment)
- Confidence ratings (HIGH/MEDIUM/LOW)

Tone:
Be direct and specific. If uncertain, say so rather than guess.
Acknowledge the good parts too.
```

### Example 2: Documentation

```
Context:
We're creating a PM guide for GitHub automation.
Target audience: Project managers new to GitHub, not developers.
Goal: Clear enough that non-technical PMs can follow it.

Role:
You are an expert technical writer who specializes in making
complex topics accessible to non-technical audiences.
You explain why things matter, not just how to use them.

Action:
Write a 300-400 word explanation of GitHub Projects boards:
1. What it is (simple explanation)
2. Why it matters for PMs
3. How it relates to issue tracking
4. Common mistakes to avoid

Format:
- Clear headings
- Short paragraphs (2-3 sentences max)
- One example workflow
- 2-3 "Pro tips" callouts

Tone:
Conversational, encouraging. Use analogies if helpful.
Assume no GitHub knowledge.
```

### Example 3: Feature Development

```
Context:
We're building a Claude Code agent for GitHub issue analysis.
Constraints: Must work locally (no API costs), use gh CLI,
integrate with Claude Code CLI.
Success: Agent can analyze any GitHub issue in < 5 seconds.

Role:
You are a full-stack developer experienced with CLI tools,
shell scripting, and API integration. You prioritize
user experience and error handling.

Action:
Design a shell script that:
1. Accepts a GitHub issue number as input
2. Fetches issue details using gh CLI
3. Prepares an analysis prompt
4. Opens Claude Code with the prompt
5. Handles errors gracefully

Provide:
- Pseudocode/outline first
- Full script implementation
- Error handling strategy
- Usage examples

Format:
Bash script with comments. Outline first, then full code.

Tone:
Practical and pragmatic. Include error messages that help
users understand what went wrong.
```

---

## When to Use CRAFT

### ✅ Use CRAFT for:
- Complex tasks that need clear structure
- Working with others (share the prompt)
- Production code or critical work
- Tasks where quality matters
- Requests to Claude (agents, workflows, etc.)

### ⚠️ You can skip CRAFT for:
- Simple questions ("What's the weather?")
- Quick exploratory chats
- Brainstorming (more conversational)
- Well-defined, standard tasks

---

## CRAFT vs. Other Approaches

### CRAFT (Structured)
```
[Context] [Role] [Action] [Format] [Tone]
```
✅ Consistent results
✅ Easy to share/reuse
✅ Great for documentation
❌ Can feel formal

### Conversational
```
"Hey, can you help me with X?"
```
✅ Natural, flexible
✅ Quick for simple tasks
❌ Inconsistent results
❌ Hard to reproduce

### Hybrid (Recommended)
```
Mix structured (for important tasks) + conversational (for exploration)
```

---

## Pro Tips for Better CRAFT Prompts

### 1. **Be Specific, Not Vague**
```
❌ "Make it better"
✅ "Reduce execution time to <100ms and add error handling for network timeouts"
```

### 2. **Provide Examples**
```
✅ "Like this:
Input: issue #5
Output: JSON with {phase, priority, type, confidence}"
```

### 3. **State Constraints Clearly**
```
✅ "Must: work on macOS, use GitHub CLI, cost nothing
Cannot: use Anthropic API, require external services"
```

### 4. **Acknowledge What You've Tried**
```
✅ "I tried using the Anthropic API, but that costs money.
I need a free solution using Claude Code CLI instead."
```

### 5. **Ask for Uncertainty**
```
✅ "If you're not sure, say 'I'm uncertain about X because...'
rather than guessing."
```

### 6. **Specify Edge Cases**
```
✅ "Handle these edge cases:
- Issue with no body (empty description)
- Issue with no labels
- Private repositories (permissions error)"
```

---

## Real-World CRAFT Examples from This Project

### This Project's GitHub Automation Prompt

```
Context:
Building GitHub automation for PM/agile workflow.
Cost is critical - cannot use API services.
Must work locally with GitHub CLI and Claude Code.

Role:
You are a DevOps/platform engineer who specializes in local automation.
You understand shell scripting, GitHub CLI, and automation patterns.

Action:
Create a shell script that:
1. Fetches a GitHub issue using gh CLI
2. Prepares an analysis prompt
3. Opens Claude Code for interactive analysis
4. Handles errors gracefully
5. Provides next steps for label application

Format:
Executable bash script (.sh file) with:
- Usage examples as comments
- Clear error messages
- Step-by-step execution logs

Tone:
Practical, error-focused. Include helpful error messages.
```

---

## CRAFT Template for Agentic Workflows

Use this template when building Claude Code agents:

```
[Context]
We're building [system].
Target: [who/what].
Constraints: [limits, requirements].
Success criteria: [how to measure success].

[Role]
You are a [expertise] with [specific skills].
[Key perspective or specialty].

[Action]
Complete these steps:
1. [First task]
2. [Second task]
3. [Third task]

[Format]
Provide as:
- [Structure option 1]
- [Structure option 2]

[Tone]
[Communication style]. [How to handle uncertainty].
```

---

## Next: Apply CRAFT to Your Prompts

Start using CRAFT in your next Claude Code session:

1. **Write your prompt as a regular question**
2. **Identify which CRAFT components are missing**
3. **Add the missing components**
4. **Compare the results**

You'll notice:
- More consistent responses
- Better quality output
- Easier to share with team
- Easier to iterate on

---

## Resources

- **CRAFT_PROMPT_TEMPLATE.md** - Ready-to-use template
- **Agentic Workflows Guide** - Examples in context
- **GitHub Automation Guide** - Real-world usage

---

**Version:** 1.0
**Status:** Complete
**Ready to use:** Yes ✅

Use CRAFT for better prompts, better results, and better collaboration! 🚀
