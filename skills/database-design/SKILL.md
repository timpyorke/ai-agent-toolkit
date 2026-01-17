# 🗃️ Database Design Skill

---

name: database-design
description: Design scalable, consistent, and performant schemas with clear constraints, indexes, and data models

---

## Overview

This skill enables AI assistants to design relational and document schemas that balance normalization, performance, and developer experience while maintaining data integrity.

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

## Relational Modeling (SQL)

### Normalization

- 3NF baseline; denormalize where read-heavy joins hurt
- Use junction tables for many-to-many

### Example Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);
```

### Indexing Strategy

```sql
-- Access patterns
-- 1) Get orders for a user by recent
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- 2) Find users by email (login)
CREATE INDEX idx_users_email ON users (email);

-- 3) Analytics on order status
CREATE INDEX idx_orders_status_created ON orders (status, created_at);
```

### Constraints & Defaults

- Use `CHECK`, `NOT NULL`, `DEFAULT` for invariants
- Timestamps as `TIMESTAMPTZ`; store UTC
- Prefer `UUID`/`BIGINT` PKs; avoid composite PKs unless required

## Document Modeling (NoSQL)

- Model aggregates per access patterns
- Avoid hot partitions; use hash-based keys where needed
- Consistency strategies: single-writer, versioning

### Example (MongoDB)

```js
// users
{ _id: UUID, email: "a@b.com", name: "Alice", created_at: ISODate() }

// orders embedded items when access as a whole
{
  _id: UUID,
  user_id: UUID,
  status: "paid",
  items: [{ product_id: UUID, qty: 2, price_cents: 990 }],
  created_at: ISODate()
}
```

## Partitioning & Sharding

- Range vs hash partitioning based on query distribution
- Plan re-sharding strategy and key selection

## Migrations & Evolution

- Backward-compatible changes: add columns nullable/default
- Dual-write/dual-read strategies for big refactors
- Online migrations and data backfills

## Data Quality & Auditing

- Soft deletes vs hard deletes
- Audit tables or change-data-capture (CDC)
- Data retention policies

## Best Practices

### Do:

- ✅ Design for access patterns
- ✅ Enforce constraints in DB
- ✅ Document schema decisions and trade-offs
- ✅ Add only necessary indexes; monitor effectiveness

### Don't:

- ❌ Over-index; hurts writes and storage
- ❌ Store derived data without recomputation strategy
- ❌ Use generic types (TEXT) where specific types exist
- ❌ Skip foreign keys for convenience

## Quick Reference

- Relational: 3NF, constraints, indexes
- Document: aggregate modeling, partition awareness
- Migrations: backward compatible, online changes
- Auditing: CDC, soft deletes, retention
