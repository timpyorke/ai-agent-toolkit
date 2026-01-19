# Reference Material

## Core Principles

### 1. Integrity First
- Enforce primary/foreign keys and unique constraints
- Use appropriate data types and nullability
- Validate at both app and DB layer

### 2. Performance by Design
- Indexes for query patterns, not guesses
- Denormalize judiciously for hot paths
- Partition/cluster for large datasets

### 3. Evolution & Clarity
- Migration-friendly changes; backward compatible
- Clear naming conventions and documentation
- Avoid breaking changes without a plan

## Relational Modeling

### Normalization
- **1NF**: Atomic values, no repeating groups.
- **2NF**: No partial dependencies (composite key).
- **3NF**: No transitive dependencies.
- **Guideline**: 3NF baseline; denormalize where read-heavy joins hurt.
- **Many-to-Many**: Use junction tables.

### Constraints & Defaults
- Use `CHECK`, `NOT NULL`, `DEFAULT` for invariants.
- Timestamps as `TIMESTAMPTZ`; store UTC.
- Prefer `UUID`/`BIGINT` PKs; avoid composite PKs unless required.

## Document Modeling

- Model aggregates per access patterns.
- Avoid hot partitions; use hash-based keys where needed.
- Consistency strategies: single-writer, versioning.

## Partitioning & Sharding

- **Types**: Range (time-series), List (categories), Hash (even distribution).
- **Strategy**: Range vs hash partitioning based on query distribution.
- **Sharding**: Horizontal scaling across servers; plan re-sharding strategy and key selection.

## Migrations & Evolution

- **Backward-compatible changes**: add columns nullable/default.
- **Refactoring**: Dual-write/dual-read strategies for big refactors.
- **Operations**: Online migrations and data backfills.

## Data Quality & Auditing

- **Deletes**: Soft deletes (deleted_at) vs hard deletes.
- **Auditing**: Audit tables or change-data-capture (CDC).
- **Lifecycle**: Data retention policies.

## Best Practices

### Do
- ✅ Design for access patterns
- ✅ Enforce constraints in DB
- ✅ Document schema decisions and trade-offs
- ✅ Add only necessary indexes; monitor effectiveness

### Don't
- ❌ Over-index; hurts writes and storage
- ❌ Store derived data without recomputation strategy
- ❌ Use generic types (TEXT) where specific types exist
- ❌ Skip foreign keys for convenience

## Quick Reference

- **Relational**: 3NF, constraints, indexes
- **Document**: aggregate modeling, partition awareness
- **Migrations**: backward compatible, online changes
- **Auditing**: CDC, soft deletes, retention
