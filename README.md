# AI Agent Toolkit

A comprehensive toolkit of reusable skills for AI coding agents like Claude, Codex, and Gemini. These skills provide specialized instructions that enhance AI assistants' capabilities across various development tasks.

## Overview

AI Agent Toolkit contains modular skill definitions that can be installed at user or project scope. Each skill provides specific guidance for AI agents to handle common development scenarios effectively.

## Available Skills

### Core Workflow

- [ai-pair-programming](src/skills/ai-pair-programming/SKILL.md) - Collaborative coding practices for AI and humans
- [commit-message](src/skills/commit-message/SKILL.md) - Clear, standardized commit messages (Conventional Commits)
- [git-workflow](src/skills/git-workflow/SKILL.md) - Branching, rebasing, PRs, and clean history
- [code-review](src/skills/code-review/SKILL.md) - Constructive reviews focusing on quality and maintainability
- [debugging](src/skills/debugging/SKILL.md) - Systematic, evidence-driven bug investigation and resolution

### Architecture & Design

- [system-design](src/skills/system-design/SKILL.md) - Scalability patterns, capacity estimation, architectural patterns
- [domain-modeling](src/skills/domain-modeling/SKILL.md) - DDD tactical/strategic patterns, entities, value objects, aggregates
- [event-driven-architecture](src/skills/event-driven-architecture/SKILL.md) - Event sourcing, CQRS, pub/sub, message brokers, sagas
- [api-versioning](src/skills/api-versioning/SKILL.md) - Versioning strategies, deprecation lifecycle, backward compatibility

### Backend & Services

- [api-design](src/skills/api-design/SKILL.md) - REST/GraphQL conventions, naming, pagination, errors
- [api-mocking](src/skills/api-mocking/SKILL.md) - Contract-first mocks for dev/test (Prism/MSW)
- [database-design](src/skills/database-design/SKILL.md) - Schema integrity, indexing, partitioning
- [database-management](src/skills/database-management/SKILL.md) - Migrations, backups, tuning, monitoring
- [caching](src/skills/caching/SKILL.md) - Reduce latency and load with appropriate cache layers
- [messaging](src/skills/messaging/SKILL.md) - Async processing and service communication with queues/streams

### Frontend Web

- [react-web-development](src/skills/react-web-development/SKILL.md) - Component architecture, hooks, patterns, and testing
- [vue](src/skills/vue/SKILL.md) - Composition API, components, and ecosystem best practices
- [angular](src/skills/angular/SKILL.md) - Modules, DI, RxJS, and enterprise app structure
- [web-accessibility](src/skills/web-accessibility/SKILL.md) - WCAG compliance and inclusive UX patterns
- [performance](src/skills/performance/SKILL.md) - Rendering, code-splitting, and lighthouse targets
- [state-management](src/skills/state-management/SKILL.md) - Redux/Pinia/Zustand patterns and data flows

### Mobile

- [android-development](src/skills/android-development/SKILL.md) - Kotlin, Jetpack, Compose, MVVM, Hilt, Room, Retrofit
- [ios-development](src/skills/ios-development/SKILL.md) - SwiftUI/UIKit, Combine, architecture, networking, persistence
- [flutter-development](src/skills/flutter-development/SKILL.md) - Dart, MVVM + Clean Architecture, Riverpod/Bloc, platform integration

### Data & ML

- [data-pipelines](src/skills/data-pipelines/SKILL.md) - ETL/ELT workflows, orchestration, and data quality
- [model-serving](src/skills/model-serving/SKILL.md) - Deploying models to APIs, batch jobs, or streaming
- [ml-monitoring](src/skills/ml-monitoring/SKILL.md) - Drift, performance, and fairness monitoring

### DevOps & SRE

- [ci-cd-pipeline](src/skills/ci-cd-pipeline/SKILL.md) - Fast feedback, artifacts, progressive rollout, OIDC secrets
- [infrastructure-as-code](src/skills/infrastructure-as-code/SKILL.md) - Terraform, Pulumi, GitOps workflows, state management
- [containers-kubernetes](src/skills/containers-kubernetes/SKILL.md) - Docker best practices, K8s resources, Helm, Kustomize
- [observability](src/skills/observability/SKILL.md) - Structured logging, Prometheus metrics, OpenTelemetry tracing, SLOs
- [incident-response](src/skills/incident-response/SKILL.md) - Severity levels, on-call rotation, runbooks, blameless postmortems

### Security & Compliance

- [secure-coding](src/skills/secure-coding/SKILL.md) - Input validation, output encoding, and secure patterns
- [authn-authz](src/skills/authn-authz/SKILL.md) - Authentication flows and role/attribute-based access
- [secrets-management](src/skills/secrets-management/SKILL.md) - Vault/KMS, rotation, and least privilege
- [owasp-top-10](src/skills/owasp-top-10/SKILL.md) - Common web risks and mitigations
- [privacy-gdpr](src/skills/privacy-gdpr/SKILL.md) - Data handling, consent, and user rights

### Testing & Quality

- [unit-integration-e2e](src/skills/unit-integration-e2e/SKILL.md) - Layered tests for confidence and speed
- [test-strategy](src/skills/test-strategy/SKILL.md) - What to test, coverage goals, and flakiness control
- [contract-testing](src/skills/contract-testing/SKILL.md) - API/schema compatibility across services
- [property-based-testing](src/skills/property-based-testing/SKILL.md) - Generative inputs for edge case discovery

### Performance & Reliability

- [profiling](src/skills/profiling/SKILL.md) - Identify hotspots and optimize CPU/memory usage
- [load-testing](src/skills/load-testing/SKILL.md) - Capacity planning and regression prevention
- [resiliency-patterns](src/skills/resiliency-patterns/SKILL.md) - Circuit breakers, retries, timeouts, bulkheads
- [chaos-engineering](src/skills/chaos-engineering/SKILL.md) - Failure injection to test resilience

### Documentation & DX

- [business-context](src/skills/business-context/SKILL.md) - Domain knowledge and requirements context for AI agents
- [adrs](src/skills/adrs/SKILL.md) - Architecture Decision Records for transparent choices
- [changelogs](src/skills/changelogs/SKILL.md) - Human-friendly release summaries with automation
- [contributor-guide](src/skills/contributor-guide/SKILL.md) - Onboarding, workflow, and conventions for contributors
- [release-notes](src/skills/release-notes/SKILL.md) - User-facing change communication
- [code-comments](src/skills/code-comments/SKILL.md) - Intent-revealing comments only where needed

### AI Agent Ops

- [optimize-prompt](src/skills/optimize-prompt/SKILL.md) - Clear prompts, constraints, formats, and iterative refinement
- [tool-use](src/skills/tool-use/SKILL.md) - Safely invoking tools with plans, validation, idempotency, and verification
- [multi-agent-orchestration](src/skills/multi-agent-orchestration/SKILL.md) - Role design, structured messaging, handoffs, and coordination
- [memory-context](src/skills/memory-context/SKILL.md) - Managing context windows, recall, summarization, and caching

## Installation Scopes

| CLI    | User Scope          | Project Scope     |
| ------ | ------------------- | ----------------- |
| Claude | `~/.claude/skills/` | `.claude/skills/` |
| Codex  | `~/.codex/skills/`  | `.codex/skills/`  |
| Gemini | `~/.gemini/skills/` | `.gemini/skills/` |

### User Scope

Install skills globally for all projects:

```bash
# Copy skills to user scope
cp -r src/skills/ai-pair-programming ~/.claude/skills/
cp -r src/skills/code-review ~/.claude/skills/
```

## Skill Structure

Each skill follows a consistent format:

Keep SKILL.md under 500 lines for optimal performance. If your content exceeds this, split detailed reference material into separate files.

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

## CLI Tool

Install the CLI tool to easily manage and deploy skills:

```bash
# Install globally from npm
npm install -g ai-agent-toolkit

# Or install locally in development
npm link
```

### CLI Commands

```bash
# List all available skills
aat list

# Show detailed info about a skill
aat info react

# Copy skills interactively (with prompts)
aat copy

# Copy all skills to user scope
aat copy --all --dest ~/.claude/skills/

# Copy specific skills
aat copy --skills react vue angular --dest ./.claude/skills/
```

## Usage

Once installed, skills are automatically available to the AI agent when working within the configured scope. The agent will reference the skill instructions when appropriate for the task at hand.

## Contributing

To add a new skill:

1. Create a new folder in `src/skills/` with a descriptive name
2. Add a `SKILL.md` file following the standard format
3. Include clear name, description, and actionable steps
4. Provide Do's and Don'ts for clarity
5. Test the skill with real-world scenarios

## License

MIT License - Feel free to use and adapt these skills for your needs.
