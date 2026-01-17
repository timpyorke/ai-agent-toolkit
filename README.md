# AI Agent Toolkit

A comprehensive toolkit of reusable skills for AI coding agents like Claude, Codex, and Gemini. These skills provide specialized instructions that enhance AI assistants' capabilities across various development tasks.

## Overview

AI Agent Toolkit contains modular skill definitions that can be installed at user or project scope. Each skill provides specific guidance for AI agents to handle common development scenarios effectively.

## Available Skills

### Core Workflow

- **ai-pair-programming** - Collaborate effectively through pair programming practices
- **commit-message** - Write clear and meaningful commit messages
- **git-workflow** - Manage version control and branching strategies
- **code-review** - Conduct thorough and constructive code reviews
- **debugging** - Systematically identify and resolve bugs

### Backend & Services

- **api-design** - Design RESTful and GraphQL APIs following best practices
- **api-mocking** - Create mock APIs for testing and development
- **database-design** - Design efficient and scalable database schemas
- **database-management** - Manage database operations, migrations, and queries

### Mobile

- **android-development** - Build Android applications with Kotlin/Java
- **ios-development** - Develop iOS applications with Swift/Objective-C
- **flutter-development** - Create cross-platform apps with Flutter/Dart

### DevOps & SRE

- **ci-cd-pipeline** - Set up and manage continuous integration/deployment

### Documentation & DX

- **business-context** - Understand and incorporate business requirements

### AI Agent Ops

- **optimize-prompt** - Improve AI prompts for better results

## Installation Scopes

| CLI    | User Scope          | Project Scope     |
| ------ | ------------------- | ----------------- |
| Claude | `~/.claude/skills/` | `.claude/skills/` |
| Codex  | `~/.codex/skills/`  | `.codex/skills/`  |
| Gemini | `~/.gemini/skills/` | `.gemini/skills/` |

### User Scope

Install skills globally for all projects:

```bash
# Copy skill to user scope
cp -r skills/ai-pair-programming ~/.claude/skills/
```

### Project Scope

Install skills for a specific project:

```bash
# Copy skill to project scope
mkdir -p .claude/skills
cp -r skills/code-review .claude/skills/
```

## Skill Structure

Each skill follows a consistent format:

```markdown
---
name: skill-name
description: Brief description of when to use this skill
---

When [triggering condition], always follow these steps:

1. **First step**: Clear action to take
2. **Second step**: Another specific action
3. **Third step**: Continue the process

## Key Principles

**Do:**

- Specific guideline
- Another guideline

**Don't:**

- Anti-pattern to avoid
- Another thing to avoid
```

## Usage

Once installed, skills are automatically available to the AI agent when working within the configured scope. The agent will reference the skill instructions when appropriate for the task at hand.

## Contributing

To add a new skill:

1. Create a new folder in `skills/` with a descriptive name
2. Add a `SKILL.md` file following the standard format
3. Include clear name, description, and actionable steps
4. Provide Do's and Don'ts for clarity
5. Test the skill with real-world scenarios

## License

MIT License - Feel free to use and adapt these skills for your needs.
