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
# ADR-001: Use React for Frontend Framework

## Status

Accepted

## Context

We are building a customer-facing web application that requires:

- Rich interactive UI with complex state management
- Good developer experience with fast iteration cycles
- Strong ecosystem and community support
- Ability to hire developers easily
- Server-side rendering for SEO

We need to choose a frontend framework for the entire application.

## Decision

We will use React as our primary frontend framework.

## Consequences

### Positive

- Large talent pool and hiring is easier
- Excellent ecosystem (Next.js for SSR, React Query, etc.)
- Component reusability across projects
- Strong TypeScript support
- Battle-tested at scale (Facebook, Netflix, Airbnb)
- Great developer tools (React DevTools)

### Negative

- Requires additional libraries for routing, state management
- JSX syntax has learning curve for some developers
- Bundle size can be large without optimization
- Need to be careful about re-renders and performance

### Neutral

- Team needs training on React best practices
- Migration from prototype (jQuery) will take 3 months

## Alternatives Considered

### Vue.js

- **Pros**: Easier learning curve, single-file components
- **Cons**: Smaller ecosystem, harder to hire experienced developers
- **Why rejected**: Hiring constraints and smaller ecosystem

### Angular

- **Pros**: Full-featured framework, TypeScript first
- **Cons**: Steeper learning curve, more opinionated, heavier bundle
- **Why rejected**: Team preference for lighter-weight solution

## Notes

- Decision made in collaboration with frontend team
- Reviewed by: @tech-lead, @architect
- Related to: ADR-002 (state management), ADR-005 (SSR strategy)
```

## When to Write ADRs

### Write ADRs For

**Technology Choices**

- Database selection (PostgreSQL vs MongoDB vs DynamoDB)
- Frontend framework (React vs Vue vs Angular)
- API style (REST vs GraphQL vs gRPC)
- Cloud provider (AWS vs GCP vs Azure)

**Architectural Patterns**

- Microservices vs monolith
- Event-driven vs request-response
- CQRS implementation
- Authentication strategy (JWT vs sessions)

**Significant Structural Changes**

- Splitting a monolith into services
- Changing deployment strategy
- Adopting new communication patterns
- Database sharding approach

**Cross-Cutting Concerns**

- Logging and observability strategy
- Error handling patterns
- Security model decisions
- Testing strategy

### Don't Write ADRs For

- Tactical code decisions (variable names, small refactorings)
- Obvious choices (using Git for version control)
- Temporary experiments (unless they become permanent)
- Individual feature implementations (unless architecturally significant)

## ADR Lifecycle and Status Values

### Status Transitions

```markdown
## Status: Proposed

- Draft, under discussion
- Not yet implemented
- Seeking feedback and review

## Status: Accepted

- Decision finalized
- Implementation can proceed
- Team has committed

## Status: Deprecated

- No longer relevant
- Context has changed
- May be superseded by another ADR

## Status: Superseded

- Replaced by a newer decision
- Link to superseding ADR
- Keep for historical context

## Status: Rejected

- Considered but not chosen
- Document rationale for rejection
- Preserve for future reference
```

## Organizing and Storing ADRs

### File Structure Options

```bash
# Option 1: In repository root
docs/
  adr/
    0001-use-react-frontend.md
    0002-adopt-microservices.md
    0003-use-postgresql.md
    README.md  # Index of all ADRs

# Option 2: Near relevant code
backend/
  docs/adr/
    0001-use-postgresql.md
frontend/
  docs/adr/
    0001-use-react.md

# Option 3: Centralized architecture docs
architecture/
  decisions/
    2024-01-database-choice.md
    2024-02-api-gateway.md
```

### Naming Conventions

```bash
# Sequential numbering (most common)
0001-record-architecture-decisions.md
0002-use-postgresql-for-storage.md
0003-adopt-microservices-architecture.md

# Date-based
2024-01-15-database-migration.md
2024-02-01-api-versioning-strategy.md

# Category-based
database-0001-choose-postgresql.md
api-0001-rest-vs-graphql.md
frontend-0001-react-framework.md
```

### Creating an ADR Index

```markdown
# Architecture Decision Records

## Index

| ADR                                           | Title                               | Status     | Date       |
| --------------------------------------------- | ----------------------------------- | ---------- | ---------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions       | Accepted   | 2024-01-10 |
| [0002](0002-use-postgresql.md)                | Use PostgreSQL for primary database | Accepted   | 2024-01-15 |
| [0003](0003-adopt-microservices.md)           | Adopt microservices architecture    | Accepted   | 2024-02-01 |
| [0004](0004-use-mongodb.md)                   | Use MongoDB for analytics           | Superseded | 2024-02-10 |

## By Category

### Infrastructure

- ADR-0002: Use PostgreSQL
- ADR-0004: Use MongoDB (Superseded)

### Architecture Patterns

- ADR-0003: Microservices architecture
```

## Superseding Decisions

### Creating a Superseding ADR

```markdown
# ADR-015: Migrate from MongoDB to PostgreSQL

## Status

Accepted - Supersedes ADR-003

## Context

Since ADR-003 (Use MongoDB), we've encountered several issues:

- Complex transactions are difficult to implement correctly
- ACID guarantees are critical for financial data integrity
- Query performance on relational data is poor
- Team expertise is stronger in SQL databases

## Decision

Migrate from MongoDB to PostgreSQL for primary application database.

## Migration Plan

1. Set up PostgreSQL cluster (Q1 2024)
2. Implement dual-write pattern (Q1 2024)
3. Backfill historical data (Q2 2024)
4. Switch reads to PostgreSQL (Q2 2024)
5. Decommission MongoDB (Q3 2024)

## Link to Original Decision

- Supersedes: ADR-003 (Use MongoDB)
- Original decision made: 2022-06-15
- Reasons for change: Transaction complexity, data integrity needs
```

### Updating the Original ADR

```markdown
# ADR-003: Use MongoDB for Primary Database

## Status

Superseded by ADR-015 (2024-01-15)

## Context

[original content...]

## Note

This decision was superseded by ADR-015: Migrate to PostgreSQL
Reason: Transaction and data integrity requirements changed
```

## Linking ADRs to Code

### In-Code References

```typescript
// File: src/database/connection.ts

/**
 * Database connection management
 *
 * Architecture Decision: ADR-0002 (Use PostgreSQL)
 * - Chosen for ACID compliance and relational data model
 * - See docs/adr/0002-use-postgresql.md for rationale
 */
export class DatabaseConnection {
  // Implementation...
}
```

```python
# File: services/payment/processor.py

# ADR-0012: Payment processing uses synchronous API
# We chose synchronous over async because:
# - Need immediate confirmation for user experience
# - Acceptable latency (< 500ms)
# See: docs/adr/0012-synchronous-payment-api.md

class PaymentProcessor:
    def process_payment(self, transaction: Transaction) -> PaymentResult:
        # Implementation...
```

### Pull Request References

```markdown
## PR Description

This PR implements the API Gateway pattern as decided in ADR-0005.

Related ADRs:

- ADR-0005: Implement API Gateway pattern
- ADR-0003: Microservices architecture (context)

## Changes

- Added Kong API Gateway configuration
- Implemented rate limiting middleware
- Set up service routing rules

## Testing

- Verified rate limiting works (ADR-0005 requirement)
- Load tested gateway (handles 10k req/s as specified)
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

## Handling Different Scenarios

### Scenario 1: Choosing a Database

1. **Document requirements**: ACID needs, scale, query patterns, team expertise
2. **List candidates**: PostgreSQL, MySQL, MongoDB, DynamoDB, etc.
3. **Evaluate each**: Create comparison matrix of requirements vs capabilities
4. **Record decision**: Chosen database with specific version and configuration approach

```markdown
# ADR-0008: Use PostgreSQL for Transaction Data

## Context

E-commerce platform needs: ACID transactions, complex joins, strong consistency

## Decision

PostgreSQL 14+ as primary database, RDS deployment with read replicas

## Consequences

Positive: ACID guarantees, SQL expertise, strong JSON support
Negative: More expensive than MySQL, write scaling requires sharding

## Alternatives

MySQL: Rejected - weaker JSON support
MongoDB: Rejected - ACID transaction concerns
DynamoDB: Rejected - limited query flexibility
```

### Scenario 2: Microservices vs Monolith

1. **Assess team size**: Current team and growth plans
2. **Evaluate product maturity**: Is product-market fit proven?
3. **Consider operational capacity**: Can team handle distributed systems?
4. **Document trade-offs**: Speed vs scalability, simplicity vs flexibility

```markdown
# ADR-0012: Start with Modular Monolith

## Context

3-person team, unproven product, need fast iteration

## Decision

Modular monolith with clear module boundaries, extract to services when:

- Team grows beyond 8-10 engineers
- Specific modules need independent scaling

## Consequences

Positive: Faster delivery, simpler ops, natural transactions
Negative: Can't scale modules independently, single deployment

## Alternatives

Microservices from day one: Rejected - over-engineering for team size
Serverless: Rejected - team lacks experience
```

### Scenario 3: Superseding an Old Decision

1. **Reference original ADR**: Link to the decision being superseded
2. **Explain what changed**: New requirements, scale, lessons learned
3. **Document migration plan**: Steps and timeline for transition
4. **Update original ADR**: Add "Superseded by" note with link

```markdown
# ADR-020: Migrate API from REST to GraphQL

## Status

Accepted - Supersedes ADR-007

## Context

Since ADR-007 (REST API), we've encountered:

- Mobile app needs flexible queries (avoiding over-fetching)
- Frontend doing multiple round-trips for related data
- API versioning becoming complex

## Decision

Migrate to GraphQL for client-facing APIs over 6 months

## Migration Plan

Q1: GraphQL gateway over REST
Q2: Native GraphQL resolvers
Q3: Deprecate REST endpoints
```

### Scenario 4: Documenting a Rejected Proposal

1. **Create ADR with Rejected status**: Important to preserve the reasoning
2. **Explain why it was proposed**: Context that led to considering it
3. **Document why rejected**: Specific reasons, not just "team didn't want it"
4. **Suggest when to reconsider**: Conditions under which this might make sense

```markdown
# ADR-018: Adopt Service Mesh (Rejected)

## Status

Rejected (2024-03-15)

## Context

Proposed to add Istio service mesh for:

- Service-to-service encryption
- Traffic management
- Observability

## Why Rejected

- Team lacks service mesh expertise (6-month learning curve)
- Only 5 microservices (below complexity threshold)
- Can achieve same goals with simpler tools (nginx, Prometheus)
- Operational overhead too high for current team

## When to Reconsider

- When we reach 15+ microservices
- After hiring platform engineer with mesh experience
- When mTLS becomes compliance requirement
```

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

```markdown
## ADR Review Checklist

- [ ] Context is clear and complete
- [ ] Decision is explicitly stated
- [ ] Consequences (positive and negative) documented
- [ ] Alternatives were considered
- [ ] Technical feasibility confirmed
- [ ] Cost implications understood
- [ ] Timeline is realistic
- [ ] Team has necessary skills
- [ ] Security reviewed (if applicable)
- [ ] Migration plan exists (if needed)
```

## Quick Reference

### ADR Template Sections

1. **Status**: Proposed, Accepted, Deprecated, Superseded, Rejected
2. **Context**: Forces at play, requirements, constraints
3. **Decision**: Explicit statement of what was decided
4. **Consequences**: Positive, negative, and neutral outcomes
5. **Alternatives Considered**: Other options with pros/cons and rejection rationale
6. **Notes**: Participants, dates, related ADRs

### When to Write

| Write ADR              | Don't Write ADR       |
| ---------------------- | --------------------- |
| Database choice        | Variable naming       |
| Architecture pattern   | Small refactorings    |
| Tech stack decision    | Obvious choices       |
| Cross-cutting concerns | Temporary experiments |
| Service boundaries     | Individual features   |

### File Organization

```
docs/adr/
├── README.md              # Index of all ADRs
├── 0001-record-architecture-decisions.md
├── 0002-use-postgresql.md
├── 0003-adopt-microservices.md
└── 0004-api-gateway-pattern.md
```

## Example ADRs

### Complete Example: Database Choice

```markdown
# ADR-0008: Use PostgreSQL for Transaction Data

## Status

Accepted (2024-03-20)

## Context

Our e-commerce platform needs to store:

- Order transactions (10k/day, growing)
- Inventory management
- User account data
- Payment history

Requirements:

- ACID transactions (critical for financial accuracy)
- Complex joins for reporting
- Strong consistency
- SQL expertise in team

Current state: Prototype uses SQLite

## Decision

Use PostgreSQL 14+ as primary database for transactional data.

Configuration:

- Primary instance: RDS PostgreSQL 14, db.r5.xlarge
- Read replicas: 2x for reporting queries
- Connection pooling: PgBouncer
- Backup: Daily snapshots + WAL archiving

## Consequences

### Positive

- ACID transactions ensure data integrity
- Excellent JSON support for flexible schemas
- Strong ecosystem (Supabase, Timescale extensions)
- Team has PostgreSQL experience
- Great tooling (pgAdmin, DataGrip)

### Negative

- PostgreSQL licensing requires attribution
- More expensive than MySQL ($2k/month vs $1.2k)
- Scaling writes requires sharding (future concern)

### Neutral

- Need to configure replication (estimated 2 days)
- Monitoring setup with CloudWatch (1 day)

## Alternatives Considered

### MySQL

- **Pros**: Slightly cheaper, team knows it
- **Cons**: JSON support is weaker, less sophisticated optimizer
- **Why rejected**: PostgreSQL JSON features important for flexible data

### MongoDB

- **Pros**: Flexible schema, easy horizontal scaling
- **Cons**: Transactions were limited, ACID concerns for financial data
- **Why rejected**: Financial data requires strong ACID guarantees

### DynamoDB

- **Pros**: Fully managed, infinite scale
- **Cons**: No joins, limited query patterns, expensive at small scale
- **Why rejected**: Query flexibility needed for reporting

## Notes

- Decision date: 2024-03-20
- Participants: @db-admin, @backend-lead, @tech-lead
- Implementation timeline: 2 weeks
- Related: ADR-0009 (Caching strategy)
```

## Conclusion

Architecture Decision Records are essential for maintaining institutional memory and enabling informed decision-making as projects and teams evolve. By documenting decisions with their full context, consequences, and alternatives, ADRs prevent repeated debates, help onboard new team members, and provide clear rationale for architectural choices. Write ADRs early in the decision process, be honest about trade-offs, preserve historical records, and maintain them as living documentation that guides your project's architectural evolution.

**Remember**: If you can't explain why a decision was made, you'll make the same mistakes again - and your team will too.

---

**Related Skills**: [system-design](../system-design/SKILL.md) | [domain-modeling](../domain-modeling/SKILL.md) | [contributor-guide](../contributor-guide/SKILL.md) | [code-review](../code-review/SKILL.md)
