# CRAFT Prompt Template

Use this template for all new feature work and agent development. Fill in each section to create clear, structured prompts that minimize hallucinations and ensure quality outputs.

---

## Template

```
═══════════════════════════════════════════════════════════════
CRAFT PROMPT: [Feature/Task Name]
═══════════════════════════════════════════════════════════════

CONTEXT:
[Provide relevant background information and business context]
- Current situation or problem statement
- Constraints and limitations
- Success criteria or desired outcomes
- Any relevant data, files, or external factors
- References to attached documentation or guides
- Time sensitivity or deadlines

ROLE:
[Define the persona and expertise Claude should adopt]
- Primary expertise area
- Experience level and credentials
- Decision-making scope and authority
- Perspective or approach to take
- Any domain-specific disclaimers (medical, legal, financial)

ACTION:
[Break complex tasks into clear, numbered steps]
1. [Primary task with specific details]
2. [Secondary task with requirements]
3. [Validation or verification step]
4. [Output generation or delivery]

For each action, specify:
- Which tools/MCPs are needed (or "use best judgment")
- Data sources to consult
- Verification requirements
- Error handling expectations

FORMAT:
[Specify the output structure and requirements]
- Output type: [e.g., Python code, markdown document, JSON config]
- Length/scope: [e.g., "complete agent", "under 200 lines", "4000-5000 words"]
- Structure: [e.g., sections, classes, functions, tables]
- Formatting: [e.g., docstrings, comments, code style]
- Citations/references: [how to cite sources or document references]

TONE:
[Define the voice, style, and how to handle uncertainty]
- Audience: [e.g., senior engineers, business stakeholders, beginners]
- Formality level: [formal, professional, conversational]
- Style: [academic, pragmatic, accessible, technical]
- Uncertainty handling: [explicitly flag unknowns, distinguish confidence levels]
- Transparency: [acknowledge limitations, trade-offs, alternatives considered]

HALLUCINATION MITIGATION:
[Strategies to ensure accuracy]
- Confidence levels: [Request High/Medium/Low for each claim with reasoning]
- Citations: [Cite specific sections, files, line numbers when referencing documents]
- Knowledge cutoff: [Claude's training data ends January 2025; use web search for current info]
- Step-by-step reasoning: [Explain logic so assumptions are visible]
- Uncertainty disclosure: [Explicitly state when unsure rather than guessing]
- Assumption listing: [List all assumptions underlying recommendations]

═══════════════════════════════════════════════════════════════
```

---

## Quick Fill-In Checklist

Before submitting any prompt, verify you have:

### Context
- [ ] Background/situation clearly explained
- [ ] Constraints and limitations stated
- [ ] Success criteria defined
- [ ] Relevant documents referenced by name
- [ ] Deadlines or time sensitivity mentioned

### Role
- [ ] Specific expertise defined (not vague)
- [ ] Experience level appropriate to task
- [ ] Decision-making scope clarified
- [ ] Perspective or approach specified
- [ ] For sensitive domains: disclaimer included

### Action
- [ ] Primary task clearly stated
- [ ] Complex tasks broken into numbered steps
- [ ] Validation/verification steps included
- [ ] Tools/MCPs needed identified
- [ ] External research requirements noted

### Format
- [ ] Output type specified (code/document/table/etc.)
- [ ] Length constraints provided
- [ ] Structure/sections detailed
- [ ] Citation requirements defined
- [ ] File format specified

### Tone
- [ ] Audience identified
- [ ] Formality level specified
- [ ] Uncertainty handling defined
- [ ] Voice/style characteristics described
- [ ] Transparency requirements noted

### Hallucination Mitigation
- [ ] Knowledge cutoff acknowledged
- [ ] Uncertainty acknowledgment requested
- [ ] Citation requirements included
- [ ] Confidence levels requested
- [ ] Step-by-step reasoning requested
- [ ] Assumption disclosure requested
- [ ] Web search specified if current info needed

---

## Examples

### Example 1: Code Generation

```
═══════════════════════════════════════════════════════════════
CRAFT PROMPT: Email Processing Agent with State Management
═══════════════════════════════════════════════════════════════

CONTEXT:
We're building an agentic workflow that processes unread emails from Gmail
and categorizes them by sender domain. The agent runs daily and must track
state between runs. We use the patterns from docs/Claude_Code_Agentic_Workflows_Guide.md
Part 3 (Gmail MCP) and Part 6 (Best Practices).

Success criteria:
- Fetches 10+ unread emails
- Correctly identifies sender domains
- Adds appropriate labels
- Logs all operations
- Persists state to file

ROLE:
You are an experienced Python developer with 8+ years building production agents.
You prioritize reliability, comprehensive error handling, and operational clarity.
You're familiar with Gmail API patterns and agentic workflows.

ACTION:
1. Create agents/email_processor.py based on Part 3 of the agentic workflows guide
2. Implement error handling with exponential backoff (see Part 6)
3. Add state persistence for tracking processed emails
4. Include comprehensive logging with rotation
5. Test that credentials are loaded from environment variables

FORMAT:
- Output type: Complete Python class
- Structure: GmailEmailProcessor class with methods:
  * __init__() - Initialize with config
  * read_unread_emails() - Fetch unread emails
  * categorize_by_domain() - Extract and label emails
  * process_emails_with_retry() - Error handling wrapper
- Include docstrings with confidence levels
- Comments for non-obvious logic

TONE:
- Audience: Mid-level Python developers implementing agents
- Style: Pragmatic and production-ready
- Formality: Professional but accessible
- Uncertainty: Flag any Gmail API specifics that may change

HALLUCINATION MITIGATION:
- For Gmail API calls: Check part 3 of guide for exact patterns
- Confidence levels: HIGH for retry patterns, MEDIUM for Gmail API details
- Reasoning: Explain why exponential backoff is chosen for rate limiting
- Assumptions: List OAuth scopes required and why

═══════════════════════════════════════════════════════════════
```

### Example 2: Architecture Design

```
═══════════════════════════════════════════════════════════════
CRAFT PROMPT: Multi-Step Automation Workflow Design
═══════════════════════════════════════════════════════════════

CONTEXT:
We want to create a workflow that:
1. Processes code review request emails
2. Extracts GitHub PR links
3. Triggers related tests
4. Sends status notifications

Constraints:
- Must respect GitHub API rate limits
- Email processing must be idempotent
- State must persist across executions
- Log all operations for audit purposes

Reference docs/Claude_Code_Agentic_Workflows_Guide.md Part 7 Example 3
and Part 6 (Best Practices).

ROLE:
You are a systems architect with expertise in designing reliable automation
workflows. You consider failure modes, recovery strategies, and operational
requirements upfront.

ACTION:
1. Design the workflow architecture with clear state transitions
2. Identify potential failure points
3. Design recovery strategies for each failure mode
4. Specify logging and monitoring requirements
5. Create a deployment validation checklist

FORMAT:
- Output type: Architecture design document (markdown)
- Structure:
  * System overview with diagram (ASCII art OK)
  * State transition flowchart
  * Failure mode analysis (table)
  * Recovery procedures (for each failure)
  * Monitoring requirements
  * Deployment checklist

TONE:
- Audience: Engineering team reviewing design
- Style: Technical, clear, decisive
- Formality: Professional
- Uncertainty: Flag design trade-offs and alternatives considered

HALLUCINATION MITIGATION:
- Reference specific patterns from guides with confidence levels
- For GitHub API: Acknowledge my knowledge cutoff (Jan 2025)
- Design assumptions: List explicitly (e.g., email uniqueness assumptions)
- Confidence: HIGH for general patterns, MEDIUM for GitHub specifics

═══════════════════════════════════════════════════════════════
```

---

## Tips for Best Results

1. **Be Specific**: "Create a function to process emails" is less useful than the example above
2. **Reference Your Guides**: "Following Part 3 of Claude_Code_Agentic_Workflows_Guide.md..."
3. **List Constraints**: What can't you do? What must succeed?
4. **Define Success**: How will you know it worked?
5. **Request Reasoning**: "Explain your reasoning step-by-step" catches errors
6. **Flag Uncertainties**: "If unsure about Gmail quota, state that rather than guess"

---

## When to Use This Template

- [ ] Creating new agents or workflows
- [ ] Designing system architecture
- [ ] Implementing complex features
- [ ] Writing documentation
- [ ] Any task where quality and accuracy matter

**For simple tasks** (typos, one-liners, quick answers), you don't need the full template—use a simpler prompt.

---

**Last Updated**: January 17, 2026
**Version**: 1.0
