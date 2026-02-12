#!/usr/bin/env python3
"""
GitHub Issue Analyzer Agent

Monitors GitHub issues and uses Claude AI to make intelligent decisions about
labeling, prioritization, and assignment based on issue content.

Usage:
    python agents/github_issue_analyzer.py --repo moncalaworks-cpu/claudeOne --issue 1
"""

import os
import json
import sys
import argparse
from datetime import datetime
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic()

def fetch_issue_details(owner: str, repo: str, issue_num: int) -> dict:
    """Fetch issue details from GitHub API."""
    import subprocess

    try:
        result = subprocess.run(
            ["gh", "issue", "view", str(issue_num), "--repo", f"{owner}/{repo}", "--json",
             "title,body,labels,state,number,createdAt"],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error fetching issue: {e.stderr}")
        return {}

def analyze_issue_with_claude(issue: dict) -> dict:
    """Use Claude AI to analyze issue and provide recommendations."""

    issue_title = issue.get("title", "")
    issue_body = issue.get("body", "")
    issue_num = issue.get("number", 0)

    # Prepare the analysis prompt
    analysis_prompt = f"""
Analyze this GitHub issue and provide recommendations for project management.

Issue #{issue_num}: {issue_title}

Body:
{issue_body}

Based on the issue content, provide a JSON response with:
{{
    "phase": "1-mvp" | "2-important" | "3-nice-to-have" (based on requirement type),
    "priority": "critical" | "high" | "medium" | "low",
    "type": "feature" | "documentation" | "testing" | "bug",
    "confidence": 0.0-1.0 (how confident you are in this assessment),
    "reasoning": "brief explanation of why these labels make sense",
    "suggested_labels": ["label1", "label2"],
    "should_assign": true | false (should this be assigned to someone?),
    "estimated_effort": "Low" | "Medium" | "High",
    "related_requirements": ["REQ-001", "REQ-002"] (if any)
}}

Respond with ONLY valid JSON, no additional text.
"""

    try:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": analysis_prompt
                }
            ]
        )

        # Parse the JSON response
        response_text = response.content[0].text
        analysis = json.loads(response_text)
        return analysis

    except Exception as e:
        print(f"Error analyzing with Claude: {e}")
        return {
            "error": str(e),
            "phase": "1-mvp",
            "priority": "medium",
            "type": "feature",
            "confidence": 0.0
        }

def apply_labels(owner: str, repo: str, issue_num: int, labels: list) -> bool:
    """Apply labels to a GitHub issue."""
    import subprocess

    if not labels:
        return True

    try:
        label_args = " ".join([f'--add-label "{label}"' for label in labels])
        cmd = f'gh issue edit {issue_num} --repo {owner}/{repo} {label_args}'
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error applying labels: {e.stderr}")
        return False

def generate_analysis_report(issue: dict, analysis: dict) -> str:
    """Generate a human-readable analysis report."""

    report = f"""
═══════════════════════════════════════════════════════════════
GitHub Issue Analysis Report
═══════════════════════════════════════════════════════════════

Issue: #{issue.get('number')} - {issue.get('title')}
Analyzed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

ANALYSIS RESULTS
─────────────────────────────────────────────────────────────

Phase:           {analysis.get('phase', 'N/A')}
Priority:        {analysis.get('priority', 'N/A')}
Type:            {analysis.get('type', 'N/A')}
Effort:          {analysis.get('estimated_effort', 'N/A')}
Confidence:      {analysis.get('confidence', 0):.0%}

Reasoning:
{analysis.get('reasoning', 'No reasoning provided')}

RECOMMENDATIONS
─────────────────────────────────────────────────────────────

Suggested Labels:
{chr(10).join(f'  • {label}' for label in analysis.get('suggested_labels', []))}

Should Assign: {analysis.get('should_assign', False)}

Related Requirements:
{chr(10).join(f'  • {req}' for req in analysis.get('related_requirements', ['None'])) if analysis.get('related_requirements') else '  None identified'}

NEXT STEPS
─────────────────────────────────────────────────────────────

1. Review the suggested labels above
2. If you agree with the analysis:
   - Labels will be automatically applied
   - Issue will be added to the project board
3. If confidence is low, review manually and adjust labels
4. Assign the issue when ready to start work

═══════════════════════════════════════════════════════════════
"""
    return report

def interactive_mode():
    """Interactive mode for analyzing issues via conversation."""

    conversation_history = []

    print("GitHub Issue Analyzer - Interactive Mode")
    print("=" * 50)
    print("Commands:")
    print("  analyze <owner>/<repo> <issue-num>  - Analyze a specific issue")
    print("  list <owner>/<repo>                 - List recent issues")
    print("  exit                                - Exit the program")
    print("=" * 50)

    while True:
        user_input = input("\n> ").strip()

        if user_input.lower() == "exit":
            print("Goodbye!")
            break

        if user_input.lower().startswith("analyze"):
            parts = user_input.split()
            if len(parts) >= 3:
                repo = parts[1]
                issue_num = parts[2]
                owner, repo_name = repo.split("/")

                print(f"\nAnalyzing issue #{issue_num} in {owner}/{repo_name}...")
                issue = fetch_issue_details(owner, repo_name, int(issue_num))

                if issue:
                    analysis = analyze_issue_with_claude(issue)
                    report = generate_analysis_report(issue, analysis)
                    print(report)

                    # Save analysis to file
                    with open(f".github/issue-analysis-{issue_num}.json", "w") as f:
                        json.dump({
                            "issue": issue,
                            "analysis": analysis,
                            "timestamp": datetime.now().isoformat()
                        }, f, indent=2)
                    print(f"Analysis saved to .github/issue-analysis-{issue_num}.json")
                else:
                    print("Could not fetch issue details")
            else:
                print("Usage: analyze <owner>/<repo> <issue-num>")

        elif user_input.lower().startswith("list"):
            print("Feature coming soon!")

        else:
            # Chat with Claude about GitHub/PM topics
            conversation_history.append({
                "role": "user",
                "content": user_input
            })

            try:
                response = client.messages.create(
                    model="claude-opus-4-6",
                    max_tokens=512,
                    system="""You are a GitHub Project Management assistant. Help users with:
- Understanding how to organize GitHub issues
- Best practices for project management with GitHub
- Analyzing and categorizing issues
- Suggesting labels and priorities
Keep responses concise and actionable.""",
                    messages=conversation_history
                )

                assistant_message = response.content[0].text
                conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message
                })

                print(f"\nAssistant: {assistant_message}")
            except Exception as e:
                print(f"Error: {e}")

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="GitHub Issue Analyzer - Use Claude AI to analyze GitHub issues"
    )
    parser.add_argument("--repo", help="Repository (owner/name)", default="moncalaworks-cpu/claudeOne")
    parser.add_argument("--issue", type=int, help="Issue number to analyze")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")
    parser.add_argument("--apply-labels", action="store_true", help="Automatically apply suggested labels")

    args = parser.parse_args()

    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    if args.interactive:
        interactive_mode()
    elif args.issue:
        owner, repo = args.repo.split("/")
        print(f"Analyzing issue #{args.issue} in {args.repo}...\n")

        issue = fetch_issue_details(owner, repo, args.issue)
        if not issue:
            print("Could not fetch issue")
            sys.exit(1)

        analysis = analyze_issue_with_claude(issue)
        report = generate_analysis_report(issue, analysis)
        print(report)

        if args.apply_labels:
            labels = analysis.get("suggested_labels", [])
            if apply_labels(owner, repo, args.issue, labels):
                print(f"✓ Applied {len(labels)} labels to issue #{args.issue}")
            else:
                print(f"✗ Failed to apply labels")

        # Save analysis
        with open(f".github/issue-analysis-{args.issue}.json", "w") as f:
            json.dump({
                "issue": issue,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        print(f"\n✓ Analysis saved to .github/issue-analysis-{args.issue}.json")
    else:
        interactive_mode()

if __name__ == "__main__":
    main()
