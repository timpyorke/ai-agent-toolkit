# ADR Examples and Scenarios

## Scenario 1: Choosing a Database

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

## Scenario 2: Microservices vs Monolith

### Starting with Modular Monolith

```markdown
# ADR-0012: Start with Modular Monolith

## Status

Accepted

## Context

3-person team, unproven product, need fast iteration

Current situation:

- Team size: 3 engineers
- Product-market fit: Not yet proven
- Deployment experience: Limited with distributed systems
- Budget: Constrained startup funding

## Decision

Start with modular monolith with clear module boundaries.

Extract to services when:

- Team grows beyond 8-10 engineers
- Specific modules need independent scaling
- Clear organizational boundaries emerge

Module structure:

- User management
- Order processing
- Inventory
- Notifications
- Analytics

## Consequences

### Positive

- Faster initial delivery (single deployment pipeline)
- Simpler operations (one service to monitor)
- Natural transaction boundaries within process
- Easy refactoring within codebase
- Lower infrastructure costs

### Negative

- Can't scale modules independently
- Single deployment means coordinated releases
- All modules share same tech stack initially
- Memory/CPU constraints affect entire application

### Neutral

- Need clear module boundaries from day one
- Invest in modular architecture patterns
- Plan for eventual extraction to services

## Alternatives Considered

### Microservices from Day One

- **Pros**: Independent scaling, team autonomy, polyglot
- **Cons**: Over-engineering for team size, operational complexity, network latency
- **Why rejected**: Team lacks distributed systems experience, premature optimization

### Serverless (Lambda + DynamoDB)

- **Pros**: Auto-scaling, pay-per-use, no server management
- **Cons**: Cold starts, vendor lock-in, limited local dev experience
- **Why rejected**: Team lacks AWS Lambda experience, debugging complexity

## Notes

- Decision date: 2024-01-15
- Participants: @cto, @tech-lead, @senior-engineer
- Re-evaluate: When team reaches 8 engineers or at 6-month mark
- Related: ADR-0013 (Module boundaries), ADR-0014 (Extraction criteria)
```

## Scenario 3: Superseding an Old Decision

### Migrating from REST to GraphQL

```markdown
# ADR-020: Migrate API from REST to GraphQL

## Status

Accepted - Supersedes ADR-007

## Context

Since implementing REST API (ADR-007, June 2022), we've encountered:

Problems:

- Mobile app makes 5-8 API calls per screen (slow on 3G)
- Over-fetching: Web client gets 80% unused data per response
- Under-fetching: Need multiple round trips for related data
- API versioning becoming complex (v1, v2, v3 endpoints)

New requirements:

- Real-time updates for notifications
- Flexible queries for mobile offline mode
- Reduced bandwidth for international users

Team changes:

- Hired GraphQL-experienced engineers
- Mobile team requesting GraphQL specifically

## Decision

Migrate from REST to GraphQL for client-facing APIs over 6 months.

Approach:

- Phase 1 (Q1): GraphQL gateway wrapping REST APIs
- Phase 2 (Q2): Native GraphQL resolvers for new features
- Phase 3 (Q3): Migrate high-traffic endpoints
- Phase 4 (Q4): Deprecate REST endpoints (keep v1 for 1 year)

Technology:

- Apollo Server for GraphQL backend
- Apollo Client for web/mobile
- GraphQL subscriptions for real-time
- DataLoader for batching/caching

## Consequences

### Positive

- Single request for related data (users + posts + comments)
- Clients request exactly what they need
- Type safety with schema
- Real-time with subscriptions
- Better mobile performance (60% fewer requests)
- Simpler versioning (schema evolution)

### Negative

- Learning curve for backend team (2-week training)
- More complex caching strategies
- N+1 query risk (mitigated with DataLoader)
- Monitoring/logging more complex
- Migration takes 6 months of effort

### Neutral

- Need to maintain REST for 1 year during transition
- Requires new monitoring tools (Apollo Studio)
- Documentation needs update

## Alternatives Considered

### Keep REST, Add BFF Pattern

- **Pros**: No migration needed, team knows REST
- **Cons**: Still requires multiple calls, doesn't solve over-fetching
- **Why rejected**: Doesn't address root problems

### gRPC

- **Pros**: Type-safe, efficient binary protocol
- **Cons**: Poor browser support, no flexibility like GraphQL
- **Why rejected**: Not suitable for public API, mobile needs flexibility

### REST with GraphQL-like Features (JSONAPI)

- **Pros**: Incremental improvement to REST
- **Cons**: Still limited compared to GraphQL, less ecosystem
- **Why rejected**: Half-measure, doesn't provide enough benefits

## Migration Plan

### Phase 1: GraphQL Gateway (Q1 2024)

- Set up Apollo Server
- Wrap existing REST endpoints
- Add GraphQL to documentation
- Beta testing with web team

### Phase 2: Native Resolvers (Q2 2024)

- Implement resolvers for User, Post, Comment
- Set up DataLoader for performance
- Migrate web app to GraphQL

### Phase 3: High-Traffic Migration (Q3 2024)

- Migrate mobile app
- Implement subscriptions
- Performance testing at scale

### Phase 4: Deprecation (Q4 2024)

- Mark REST endpoints deprecated
- Migration guide for partners
- Keep v1 REST for 1 year minimum

## Notes

- Decision date: 2024-01-20
- Participants: @api-team, @mobile-lead, @web-lead, @architect
- Budget: $50k for Apollo Studio, training
- Success metrics: 60% reduction in mobile API calls, 40% bandwidth reduction
- Related: ADR-007 (original REST decision), ADR-021 (real-time strategy)
```

## Scenario 4: Documenting a Rejected Proposal

### Service Mesh Proposal (Rejected)

```markdown
# ADR-018: Adopt Service Mesh (Rejected)

## Status

Rejected (2024-03-15)

## Context

Proposed to add Istio service mesh for our microservices platform.

Current setup:

- 5 microservices (User, Order, Payment, Inventory, Notification)
- Direct service-to-service HTTP calls
- Basic nginx load balancing
- No mTLS between services
- Prometheus for metrics

Proposal drivers:

- Security team wants mTLS everywhere
- Observability gaps in distributed tracing
- Traffic management needs (canary, circuit breaking)

## Why Rejected

### Reason 1: Operational Complexity Too High

- Team has zero service mesh experience (6-month learning curve estimated)
- Requires dedicated platform engineer (not in budget)
- Troubleshooting becomes significantly more complex
- Istio adds 2 sidecars per pod (resource overhead)

### Reason 2: Below Complexity Threshold

- Only 5 microservices (Istio typically valuable at 15+)
- Current problems solvable with simpler tools:
  - mTLS: Can use AWS ACM + ALB
  - Tracing: Can add Jaeger without service mesh
  - Circuit breaking: Can use resilience4j library

### Reason 3: Cost vs Benefit

- Estimated costs:
  - 1 platform engineer: $180k/year
  - Additional infrastructure: $2k/month
  - Training: $15k
  - Total Year 1: $220k
- Benefits don't justify costs at current scale

### Reason 4: Team Feedback

- Polled 8 engineers: 2 yes, 3 no, 3 neutral
- Concerns: complexity, operational burden, learning curve
- Preference: Solve problems incrementally with known tools

## What We'll Do Instead

### Short Term (Next 3 months)

1. Add application-level circuit breakers (resilience4j)
2. Implement distributed tracing with Jaeger
3. Set up mutual TLS with AWS ACM

### Medium Term (6-12 months)

1. Improve logging with structured JSON logs
2. Add service-level metrics (RED method)
3. Document service dependencies

## When to Reconsider

Reconsider service mesh when we meet these criteria:

1. **Scale**: 15+ microservices in production
2. **Team**: Hired platform engineer with mesh experience
3. **Complexity**: Cross-team services with complex routing needs
4. **Compliance**: Regulatory requirement for mTLS
5. **Traffic**: 100k+ requests/second across services

## Alternatives We're Pursuing

### Option 1: Application Libraries (Chosen)

- Use resilience4j for circuit breaking
- Add Jaeger SDK to each service
- Implement correlation IDs manually

### Option 2: API Gateway Pattern

- Consolidate external traffic through Kong
- Add rate limiting and auth at gateway
- Leave internal service calls simple

## Notes

- Proposal date: 2024-02-15
- Rejection date: 2024-03-15
- Participants: @platform-team, @security, @all-engineers
- Review scheduled: Q4 2024 (when we hit 10 services)
- Related: ADR-019 (Circuit breaker strategy), ADR-020 (Observability)
```

## Scenario 5: Technology Migration

### Example: Monorepo Adoption

```markdown
# ADR-025: Migrate to Monorepo with Nx

## Status

Accepted

## Context

Current state:

- 12 repositories (3 frontends, 6 backends, 3 libraries)
- Dependency hell: Updating shared library requires 9 PRs
- Inconsistent tooling across repos
- Difficult to coordinate changes across services
- CI/CD duplication (12 separate pipelines)

Pain points:

- Cross-repo changes take 2-3 days for all PRs
- Version conflicts in shared dependencies
- Hard to discover code (developers don't know what exists)
- Testing cross-service changes is manual

Team context:

- 15 engineers across 3 teams
- All teams contribute to shared libraries
- Need atomic commits across services

## Decision

Migrate to monorepo using Nx for build orchestration.

Structure:
```

monorepo/
apps/
web-app/
mobile-app/
admin-dashboard/
services/
user-service/
order-service/
libs/
shared/ui-components/
shared/utils/
shared/types/

```

Tools:
- Nx for caching and orchestration
- Turborepo evaluated but Nx has better Angular support
- Single CI/CD pipeline with affected detection

## Consequences

### Positive

- Atomic commits across apps and services
- Shared dependency versions (single package.json)
- Code reuse discovery improved
- CI caching reduces build time by 60%
- Easier to coordinate breaking changes
- Single source of truth for tooling (ESLint, Prettier, TypeScript)

### Negative

- Repository clone is 2GB (vs 200MB per repo)
- Git blame history requires migration
- CI runs take longer (but cached well)
- Requires migration period (3 months)

### Neutral

- Need to train team on Nx commands
- Codeowners file becomes more complex
- Requires discipline around boundaries

## Migration Plan

### Phase 1: Foundation (Month 1)
- Create monorepo structure
- Set up Nx workspace
- Migrate shared libraries first

### Phase 2: Applications (Month 2)
- Migrate frontends
- Update CI/CD pipelines
- Set up affected detection

### Phase 3: Services (Month 3)
- Migrate backend services
- Establish module boundaries
- Deprecate old repos

## Notes

- Decision date: 2024-04-01
- Estimated completion: 2024-06-30
- Participants: @all-tech-leads, @devops
- Related: ADR-026 (Code boundaries), ADR-027 (Shared library strategy)
```

## Scenario 6: Framework Selection

### Example: Choosing a Frontend Framework

```markdown
# ADR-030: Adopt Vue 3 for New Dashboard

## Status

Accepted

## Context

Building new admin dashboard from scratch:

Requirements:

- Rich data tables and charts
- Real-time updates via WebSocket
- Complex form validation
- Moderate interactivity (not as complex as main app)

Team context:

- Main app uses React (established, not changing)
- Dashboard team: 2 new junior developers
- Need fast onboarding and development velocity

Constraints:

- Must integrate with existing Auth service (framework-agnostic)
- Must share design system (component library exists in both React/Vue)

## Decision

Use Vue 3 (Composition API) for admin dashboard.

Rationale:

- Separate application, different team, different requirements
- Vue's learning curve better for junior developers
- Built-in reactivity suits real-time dashboard requirements
- Vite integration for fast development

## Consequences

### Positive

- Faster onboarding for junior devs (1-week vs 3-week for React)
- Vue's reactivity model natural for real-time data
- Smaller bundle size for dashboard (~30% smaller)
- Built-in transitions and animations
- Single-file components easier for beginners

### Negative

- Introduces second frontend framework to maintain
- Can't share React components (but design system covers 80%)
- Split expertise across frontend teams
- Two sets of tooling to maintain

### Neutral

- Need Vue-specific CI/CD configuration
- Separate dependency management for dashboard
- Auth integration requires framework-agnostic approach (already planned)

## Alternatives Considered

### Use React (Same as Main App)

- **Pros**: Single framework, shared components, unified expertise
- **Cons**: Steeper learning curve for juniors, overkill for dashboard complexity
- **Why rejected**: Optimizing for team velocity and learning curve

### Use Svelte

- **Pros**: Even simpler than Vue, smallest bundle size
- **Cons**: Smaller ecosystem, harder to hire, less mature tooling
- **Why rejected**: Too risky for production dashboard

### Use Angular

- **Pros**: Full-featured, enterprise-ready
- **Cons**: Heavy framework for simple dashboard, steepest learning curve
- **Why rejected**: Over-engineering for requirements

## Notes

- Decision date: 2024-05-10
- Participants: @dashboard-team-lead, @frontend-architect
- Timeline: Dashboard launch Q3 2024
- Re-evaluate: If dashboard team grows beyond 5 developers
- Related: ADR-001 (React for main app), ADR-031 (Design system strategy)
```
