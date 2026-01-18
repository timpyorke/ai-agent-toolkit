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

- [system-design](skills/system-design/SKILL.md) - Scalability patterns, capacity estimation, architectural patterns
- [domain-modeling](skills/domain-modeling/SKILL.md) - DDD tactical/strategic patterns, entities, value objects, aggregates
- [event-driven-architecture](skills/event-driven-architecture/SKILL.md) - Event sourcing, CQRS, pub/sub, message brokers, sagas
- [api-versioning](skills/api-versioning/SKILL.md) - Versioning strategies, deprecation lifecycle, backward compatibility

### Backend & Services

- [api-design](skills/api-design/SKILL.md) - REST/GraphQL conventions, naming, pagination, errors
- [api-mocking](skills/api-mocking/SKILL.md) - Contract-first mocks for dev/test (Prism/MSW)
- [database-design](skills/database-design/SKILL.md) - Schema integrity, indexing, partitioning
- [database-management](skills/database-management/SKILL.md) - Migrations, backups, tuning, monitoring
- [caching](skills/caching/SKILL.md) - Reduce latency and load with appropriate cache layers
- [messaging](skills/messaging/SKILL.md) - Async processing and service communication with queues/streams

### Frontend Web

- [react](skills/react/SKILL.md) - Component architecture, hooks, patterns, and testing
- [vue](skills/vue/SKILL.md) - Composition API, components, and ecosystem best practices
- [angular](skills/angular/SKILL.md) - Modules, DI, RxJS, and enterprise app structure
- [accessibility](skills/accessibility/SKILL.md) - WCAG compliance and inclusive UX patterns
- [performance](skills/performance/SKILL.md) - Rendering, code-splitting, and lighthouse targets
- [state-management](skills/state-management/SKILL.md) - Redux/Pinia/Zustand patterns and data flows

### Mobile

- [android-development](skills/android-development/SKILL.md) - Kotlin, Jetpack, Compose, MVVM, Hilt, Room, Retrofit
- [ios-development](skills/ios-development/SKILL.md) - SwiftUI/UIKit, Combine, architecture, networking, persistence
- [flutter-development](skills/flutter-development/SKILL.md) - Dart, MVVM + Clean Architecture, Riverpod/Bloc, platform integration

### Data & ML

- [data-pipelines](skills/data-pipelines/SKILL.md) - ETL/ELT workflows, orchestration, and data quality
- [model-serving](skills/model-serving/SKILL.md) - Deploying models to APIs, batch jobs, or streaming
- [ml-monitoring](skills/ml-monitoring/SKILL.md) - Drift, performance, and fairness monitoring

### DevOps & SRE

- [ci-cd-pipeline](skills/ci-cd-pipeline/SKILL.md) - Fast feedback, artifacts, progressive rollout, OIDC secrets
- [infrastructure-as-code](skills/infrastructure-as-code/SKILL.md) - Terraform, Pulumi, GitOps workflows, state management
- [containers-kubernetes](skills/containers-kubernetes/SKILL.md) - Docker best practices, K8s resources, Helm, Kustomize
- [observability](skills/observability/SKILL.md) - Structured logging, Prometheus metrics, OpenTelemetry tracing, SLOs
- [incident-response](skills/incident-response/SKILL.md) - Severity levels, on-call rotation, runbooks, blameless postmortems

### Security & Compliance

- [secure-coding](skills/secure-coding/SKILL.md) - Input validation, output encoding, and secure patterns
- [authn-authz](skills/authn-authz/SKILL.md) - Authentication flows and role/attribute-based access
- [secrets-management](skills/secrets-management/SKILL.md) - Vault/KMS, rotation, and least privilege
- [owasp-top-10](skills/owasp-top-10/SKILL.md) - Common web risks and mitigations
- [privacy-gdpr](skills/privacy-gdpr/SKILL.md) - Data handling, consent, and user rights

### Testing & Quality

- [unit-integration-e2e](skills/unit-integration-e2e/SKILL.md) - Layered tests for confidence and speed
- [test-strategy](skills/test-strategy/SKILL.md) - What to test, coverage goals, and flakiness control
- [contract-testing](skills/contract-testing/SKILL.md) - API/schema compatibility across services
- [property-based-testing](skills/property-based-testing/SKILL.md) - Generative inputs for edge case discovery

### Performance & Reliability

- [profiling](skills/profiling/SKILL.md) - Identify hotspots and optimize CPU/memory usage
- [load-testing](skills/load-testing/SKILL.md) - Capacity planning and regression prevention
- [resiliency-patterns](skills/resiliency-patterns/SKILL.md) - Circuit breakers, retries, timeouts, bulkheads
- [chaos-engineering](skills/chaos-engineering/SKILL.md) - Failure injection to test resilience

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

- **Completed**: 47/55 skills (85%)
- **Phase 1 (Core Skills)**: 15/15 ✅ Complete
- **Phase 2 (Architectural Foundations)**: 4/4 ✅ Complete
- **Phase 5 (DevOps & Infrastructure)**: 4/4 ✅ Complete
- **Phase 6 (Security & Compliance)**: 5/5 ✅ Complete
- **Phase 7 (Testing & Quality)**: 4/4 ✅ Complete
- **Phase 8 (Performance & Reliability)**: 4/4 ✅ Complete
- **Phase 9 (Data & ML)**: 3/3 ✅ Complete
- **Frontend Web**: 6/6 ✅ Complete

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
cp -r skills/ai-pair-programming ~/.claude/skills/
cp -r skills/code-review ~/.claude/skills/
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

## CLI Tool

Install the CLI tool to easily manage and deploy skills:

```bash
# Install globally using npm
npm install -g .

# Or use the install script
chmod +x scripts/install.sh
./scripts/install.sh
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

1. Create a new folder in `skills/` with a descriptive name
2. Add a `SKILL.md` file following the standard format
3. Include clear name, description, and actionable steps
4. Provide Do's and Don'ts for clarity
5. Test the skill with real-world scenarios

## License

MIT License - Feel free to use and adapt these skills for your needs.
