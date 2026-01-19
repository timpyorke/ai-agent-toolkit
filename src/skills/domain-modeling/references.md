# Reference Material

## Core Principles

### 1. Ubiquitous Language
- **Shared vocabulary**: Same terms used by developers and domain experts
- **Consistent naming**: Code reflects business concepts exactly
- **Evolves with understanding**: Refine as domain knowledge deepens
- **Context-specific**: Terms may differ across bounded contexts

### 2. Strategic Design
- **Bounded contexts**: Clear boundaries around models
- **Context mapping**: Define relationships between contexts
- **Core domain**: Focus investment on business differentiators
- **Supporting/Generic subdomains**: Buy or delegate when possible

### 3. Tactical Design
- **Entities**: Objects with identity and lifecycle
- **Value objects**: Immutable objects defined by attributes
- **Aggregates**: Consistency boundaries and transactional units
- **Domain events**: Capture business-significant state changes
- **Repositories**: Persist and retrieve aggregates

## Building Blocks

### Entities
- Identity that persists over time
- Mutable state
- Equality based on ID, not attributes

### Value Objects
- No identity
- Immutable
- Equality based on all attributes
- Side-effect free methods

### Aggregates
- Cluster of entities and value objects
- One entity is the aggregate root
- External references only to root
- Enforces invariants
- Transactional consistency boundary

### Domain Events
- Capture something that happened in the domain
- Immutable
- Named in past tense
- Contain all relevant data

### Repositories
- Persist and retrieve aggregates
- Operate on aggregate roots only
- Abstract data access details
- Collection-like interface

## Bounded Contexts

### Defining Boundaries
Example: "Customer" implies different things in different contexts:
- **Sales Context**: Buyer identity, profile
- **Shipping Context**: Delivery address, recipient
- **Support Context**: Ticket history, satisfaction score

### Context Mapping Patterns
- **Partnership**: Teams work together
- **Shared Kernel**: Shared subset of domain model
- **Customer/Supplier**: One context feeds another
- **Conformist**: Downstream adopts upstream model
- **Anti-Corruption Layer (ACL)**: Translation layer between contexts
- **Open Host Service**: Public API protocol
- **Published Language**: Standard interchange format

## Domain Services
**When to use:**
- Logic doesn't belong to a single entity
- Operation spans multiple aggregates
- Stateless operations

## Patterns & Practices

### Specification Pattern
- Encapsulate complex validation or selection rules
- Composable rules (AND, OR, NOT)

### Factory Pattern
- Encapsulate complex object creation
- Ensure objects are created in valid state

### Domain Event Handling
- Decouple side effects from aggregate logic
- Handle cross-aggregate consistency eventually

## Best Practices
- **Focus on behavior, not data bags**: Avoid Anemic Domain Model
- **Make invariants explicit**: Construct valid objects or throw
- **Keep aggregates small**: One transaction, one aggregate
- **Use Domain Services sparingly**: Check if logic belongs on an Entity first
