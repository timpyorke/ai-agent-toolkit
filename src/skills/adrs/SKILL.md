---
name: adrs
description: Document significant architectural decisions with context, consequences, and alternatives for transparent evolution
---

# 📝 Architecture Decision Records (ADRs) Skill

## Overview

This skill enables AI assistants to create and maintain Architecture Decision Records (ADRs) that document significant architectural choices, their context, consequences, and alternatives considered. ADRs preserve institutional memory, enable transparent decision-making, and help teams understand the "why" behind architectural choices.

## Core Principles

### 1. Document Context, Not Just Decisions

- Capture the forces at play (technical, political, social, project constraints)
- Explain why the decision matters and what problem it solves
- Record alternatives considered and why they were rejected
- Include both positive and negative consequences honestly

### 2. Write Early, Keep Forever

- Create ADRs before implementation begins, not after the fact
- Never delete superseded ADRs - mark them as deprecated and link to replacements
- Maintain a searchable index of all decisions
- ADRs are immutable historical records that provide context

### 3. Keep ADRs Concise and Actionable

- Focus on the decision and its rationale, not implementation details
- Use standard templates for consistency across all ADRs
- Link to detailed docs for configuration specifics
- Target 1-2 pages maximum per ADR

## ADR Template Structure

### Standard Template (Michael Nygard Format)

```markdown
# ADR-001: [Title - Brief, Action-Oriented]

## Status

[Proposed | Accepted | Deprecated | Superseded | Rejected]

## Context

[Forces at play, requirements, constraints, current state]

## Decision

[Explicit statement of what was decided]

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]

### Negative

- [Trade-off 1]
- [Trade-off 2]

### Neutral

- [Implication 1]

## Alternatives Considered

### [Alternative 1]

- **Pros**: [advantages]
- **Cons**: [disadvantages]
- **Why rejected**: [specific reason]
```

**See [reference.md](reference.md) for full template with examples**

## When to Write ADRs

### Write ADRs For

**Technology Choices**: Database selection, frontend framework, API style, cloud provider

**Architectural Patterns**: Microservices vs monolith, event-driven vs request-response, authentication strategy

**Significant Structural Changes**: Service decomposition, deployment strategy changes, database sharding

**Cross-Cutting Concerns**: Logging strategy, error handling patterns, security model, testing strategy

### Don't Write ADRs For

- Tactical code decisions (variable names, small refactorings)
- Obvious choices (using Git for version control)
- Temporary experiments (unless they become permanent)
- Individual feature implementations (unless architecturally significant)

## ADR Lifecycle and Status Values

### Status Transitions

- **Proposed**: Draft, under discussion, seeking feedback
- **Accepted**: Decision finalized, implementation can proceed
- **Deprecated**: No longer relevant, context has changed
- **Superseded**: Replaced by newer decision, link to superseding ADR
- **Rejected**: Considered but not chosen, preserve rationale

## Organizing and Storing ADRs

### File Structure Options

```bash
# Option 1: In repository root
docs/adr/
  ├── README.md              # Index of all ADRs
  ├── 0001-use-react-frontend.md
  └── 0002-adopt-microservices.md

# Option 2: Near relevant code
backend/docs/adr/
frontend/docs/adr/

# Option 3: Centralized architecture docs
architecture/decisions/
```

### Naming Conventions

```bash
# Sequential numbering (most common)
0001-record-architecture-decisions.md
0002-use-postgresql-for-storage.md

# Date-based
2024-01-15-database-migration.md

# Category-based
database-0001-choose-postgresql.md
api-0001-rest-vs-graphql.md
```

### Creating an ADR Index

```markdown
# Architecture Decision Records

| ADR                                           | Title                               | Status   | Date       |
| --------------------------------------------- | ----------------------------------- | -------- | ---------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions       | Accepted | 2024-01-10 |
| [0002](0002-use-postgresql.md)                | Use PostgreSQL for primary database | Accepted | 2024-01-15 |

## By Category

### Infrastructure

- ADR-0002: Use PostgreSQL
```

## Superseding Decisions

When creating a superseding ADR:

1. **Reference original ADR**: Link to the decision being superseded
2. **Explain what changed**: New requirements, scale, lessons learned
3. **Document migration plan**: Steps and timeline for transition
4. **Update original ADR**: Add "Superseded by" note with link

```markdown
# ADR-015: Migrate from MongoDB to PostgreSQL

## Status

Accepted - Supersedes ADR-003

## Context

Since ADR-003 (Use MongoDB), we've encountered:

- Complex transactions difficult to implement
- ACID guarantees critical for financial data
- Query performance poor on relational data

## Migration Plan

1. Set up PostgreSQL cluster (Q1 2024)
2. Implement dual-write pattern (Q1 2024)
3. Backfill historical data (Q2 2024)
```

**Update the original:**

```markdown
# ADR-003: Use MongoDB

## Status

Superseded by ADR-015 (2024-01-15)

## Note

Reason: Transaction and data integrity requirements changed
```

## Linking ADRs to Code

### In-Code References

```typescript
/**
 * Database connection management
 *
 * Architecture Decision: ADR-0002 (Use PostgreSQL)
 * See docs/adr/0002-use-postgresql.md for rationale
 */
export class DatabaseConnection {
  // Implementation...
}
```

### Pull Request References

```markdown
## PR Description

Implements API Gateway pattern as decided in ADR-0005.

Related ADRs:

- ADR-0005: Implement API Gateway pattern
- ADR-0003: Microservices architecture (context)
```

## Best Practices

### Writing

- Write ADRs before implementation, not as documentation after the fact
- Be specific and concrete with decisions and consequences
- Document all alternatives considered with pros/cons
- Include honest assessment of negative consequences
- Specify who participated in the decision
- Link related ADRs to show decision evolution

### Organization

- Maintain a consistent numbering scheme across all ADRs
- Create and keep updated an ADR index/README
- Use categories or tags to group related decisions
- Store ADRs in version control with the code
- Make ADRs easily searchable and discoverable

### Review Process

- Define required reviewers for different types of decisions
- Set review deadlines to avoid decision paralysis
- Include open questions section for discussion
- Link to discussion threads (GitHub, Slack, meeting notes)
- Document when decision was proposed, reviewed, and accepted

## Anti-Patterns to Avoid

### Don't:

- ❌ Write ADRs after implementation is complete - lose context and rationale
- ❌ Delete or hide superseded ADRs - lose institutional memory
- ❌ Make ADRs too detailed with implementation specifics - keep focused
- ❌ Only document positive consequences - be honest about trade-offs
- ❌ Skip documenting alternatives - show you considered multiple options
- ❌ Use vague language like "use a good database" - be specific
- ❌ Hide controversial decisions or team disagreement - be transparent

### Do:

- ✅ Write ADRs during decision-making process while context is fresh
- ✅ Mark superseded ADRs but preserve them for historical reference
- ✅ Focus on decision rationale, link to detailed implementation docs
- ✅ Document both positive and negative consequences honestly
- ✅ List all alternatives with why they were rejected
- ✅ Be specific: "PostgreSQL 14+ with read replicas in us-east-1"
- ✅ Document disagreements: "3 voted PostgreSQL, 2 voted MongoDB"

## Tools & Techniques

### Command Line Tools

```bash
# adr-tools (npm/brew)
npm install -g adr-log
adr init docs/adr
adr new "Use GraphQL for API"
adr new -s 3 "Migrate from REST to GraphQL"  # Supersedes ADR-3
adr generate toc > docs/adr/README.md

# Custom script for ADR creation
#!/bin/bash
ADR_DIR="docs/adr"
NEXT_NUM=$(printf "%04d" $(($(ls -1 $ADR_DIR/*.md 2>/dev/null | wc -l) + 1)))
TITLE="$1"
cat > "$ADR_DIR/$NEXT_NUM-$(echo "$TITLE" | tr '[:upper:] ' '[:lower:]-').md" <<EOF
# ADR-$NEXT_NUM: $TITLE
## Status
Proposed
## Context
## Decision
## Consequences
## Alternatives Considered
EOF
```

### Web-Based Tools

**log4brains** - ADR management with web UI

```bash
npm install -g log4brains
log4brains init
log4brains preview  # Opens http://localhost:4004
# Features: templates, search, linking, static site export
```

### Review Process Template

````

### Web-Based Tools

**log4brains** - ADR management with web UI

```bash
npm install -g log4brains
log4brains init
log4brains preview  # Opens http://localhost:4004
````

**See [reference.md](reference.md) for complete tooling guide**omplete ADR Examples with Full Context

## Conclusion

Architecture Decision Records are essential for maintaining institutional memory and enabling informed decision-making as projects evolve. Write ADRs early, be honest about trade-offs, preserve historical records, and maintain them as living documentation that guides your project's architectural evolution.

**Remember**: If you can't explain why a decision was made, you'll make the same mistakes again - and your team will too.

---

**Related Skills**: [system-design](../system-design/SKILL.md) | [domain-modeling](../domain-modeling/SKILL.md) | [contributor-guide](../contributor-guide/SKILL.md) | [code-review](../code-review/SKILL.md)

npm install -g log4brains
log4brains init
log4brains preview # Opens http://localhost:4004

```

**See [reference.md](reference.md) for complete tooling guide**
```
