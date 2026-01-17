# AI Agent Toolkit

A comprehensive toolkit of reusable skills for AI coding agents like Claude, Codex, and Gemini. These skills provide specialized instructions that enhance AI assistants' capabilities across various development tasks.

## Overview

AI Agent Toolkit contains modular skill definitions that can be installed at user or project scope. Each skill provides specific guidance for AI agents to handle common development scenarios effectively.

## Available Skills

### Core Workflow

- [ai-pair-programming](skills/ai-pair-programming/SKILL.md) - Collaborative coding practices for AI and humans
- [commit-message](skills/commit-message/SKILL.md) - Clear, standardized commit messages (Conventional Commits)
- [git-workflow](skills/git-workflow/SKILL.md) - Branching, rebasing, PRs, and clean history
- [code-review](skills/code-review/SKILL.md) - Constructive reviews focusing on quality and maintainability
- [debugging](skills/debugging/SKILL.md) - Systematic, evidence-driven bug investigation and resolution

### Architecture & Design

- system-design - High-level component, data flow, and scalability planning
- domain-modeling - Entities, relationships, and bounded contexts (DDD)
- event-driven-architecture - Async messaging, pub/sub, and eventual consistency
- api-versioning - Backward compatibility, deprecation, and contract evolution

### Backend & Services

- [api-design](skills/api-design/SKILL.md) - REST/GraphQL conventions, naming, pagination, errors
- [api-mocking](skills/api-mocking/SKILL.md) - Contract-first mocks for dev/test (Prism/MSW)
- [database-design](skills/database-design/SKILL.md) - Schema integrity, indexing, partitioning
- [database-management](skills/database-management/SKILL.md) - Migrations, backups, tuning, monitoring
- caching - Reduce latency and load with appropriate cache layers
- messaging - Async processing and service communication with queues/streams

### Frontend Web

- react - Component architecture, hooks, patterns, and testing
- vue - Composition API, components, and ecosystem best practices
- angular - Modules, DI, RxJS, and enterprise app structure
- accessibility - WCAG compliance and inclusive UX patterns
- performance - Rendering, code-splitting, and lighthouse targets
- state-management - Redux/Pinia/Zustand patterns and data flows

### Mobile

- [android-development](skills/android-development/SKILL.md) - Kotlin, Jetpack, Compose, MVVM, Hilt, Room, Retrofit
- [ios-development](skills/ios-development/SKILL.md) - SwiftUI/UIKit, Combine, architecture, networking, persistence
- [flutter-development](skills/flutter-development/SKILL.md) - Dart, MVVM + Clean Architecture, Riverpod/Bloc, platform integration

### Data & ML

- data-pipelines - ETL/ELT workflows, orchestration, and data quality
- model-serving - Deploying models to APIs, batch jobs, or streaming
- ml-monitoring - Drift, performance, and fairness monitoring

### DevOps & SRE

- [ci-cd-pipeline](skills/ci-cd-pipeline/SKILL.md) - Fast feedback, artifacts, progressive rollout, OIDC secrets
- infrastructure-as-code - Declarative infra with Terraform/Pulumi and GitOps
- containers-kubernetes - Docker images, orchestration, and scaling
- observability - Logs, metrics, traces, SLOs, and alerting
- incident-response - Runbooks, on-call, and postmortems

### Security & Compliance

- secure-coding - Input validation, output encoding, and secure patterns
- authn-authz - Authentication flows and role/attribute-based access
- secrets-management - Vault/KMS, rotation, and least privilege
- owasp-top-10 - Common web risks and mitigations
- privacy-gdpr - Data handling, consent, and user rights

### Testing & Quality

- unit-integration-e2e - Layered tests for confidence and speed
- test-strategy - What to test, coverage goals, and flakiness control
- contract-testing - API/schema compatibility across services
- property-based-testing - Generative inputs for edge case discovery

### Performance & Reliability

- profiling - Identify hotspots and optimize CPU/memory usage
- load-testing - Capacity planning and regression prevention
- resiliency-patterns - Circuit breakers, retries, timeouts, bulkheads
- chaos-engineering - Failure injection to test resilience

### Documentation & DX

- adrs - Architecture Decision Records for transparent choices
- changelogs - Human-friendly release summaries
- contributor-guide - Onboarding, workflow, and conventions for contributors
- release-notes - User-facing change communication
- code-comments - Intent-revealing comments only where needed

### AI Agent Ops

- [optimize-prompt](skills/optimize-prompt/SKILL.md) - Clear prompts, constraints, formats, and iterative refinement
- tool-use - Safely invoking tools, planning, and result verification
- multi-agent-orchestration - Role design, handoffs, and coordination
- memory-context - Managing context windows, recall, and summarization

## Progress Overview

- **Completed**: 15/15 skills (100%) 🎉
- **All core mobile skills implemented!**

See detailed checklist in [TASK.md](TASK.md)

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
