# 🛡️ Database Management Skill

---

name: database-management
description: Operate databases reliably with migrations, backups, performance tuning, monitoring, and security

---

## Overview

This skill enables AI assistants to manage databases safely in development and production environments, focusing on migrations, backups, observability, performance, and access control.

## Core Principles

### 1. Safety First

- Test migrations and rollbacks before production
- Backups verified with restore drills
- Principle of least privilege for access

### 2. Observability & Automation

- Monitor health: CPU, memory, I/O, locks
- Track slow queries and plan cache
- Automate routine tasks with runbooks

### 3. Performance & Capacity

- Index tuning based on actual workload
- Connection pool sizing and timeouts
- Capacity planning and scaling strategies

## Migrations

- Use tooling: Flyway, Liquibase, Rails migrations
- Versioned, idempotent scripts; checksum validation
- `up`/`down` with transactional safety

```sql
-- Flyway V20260117__add_users_table.sql
BEGIN;
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
COMMIT;
```

## Backups & Restore

- Full and incremental backups; snapshot strategies
- Encrypt at rest and in transit
- Regular restore testing to verify integrity

```bash
# Postgres
pg_dump -Fc -d $DB_URL -f backups/db_$(date +%F).dump
pg_restore -d $RESTORE_DB_URL backups/db_2026-01-17.dump
```

## Performance Tuning

- Identify slow queries via `EXPLAIN ANALYZE`
- Add/adjust indexes; avoid sequential scans
- Optimize schema (types, constraints)
- Tune parameters: work_mem, shared_buffers (Postgres)

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;
```

## Operations & Monitoring

- Metrics: query latency, queue depth, deadlocks
- Alerts: replication lag, storage usage
- Logs: audit connections, failed auth attempts

## Security

- Role-based access; no shared superusers
- Rotate credentials; use secrets management (Vault/KMS)
- Row-level security where applicable
- TLS with certificate management

## High Availability

- Replication: primary/replica with failover
- Read scaling via replicas; write scaling via sharding
- Use managed services when appropriate

## Runbooks

- Incident response steps for common issues
- Migration rollback procedures
- Backup restore checklist

## Best Practices

### Do:

- ✅ Validate migrations in staging
- ✅ Monitor and alert on key metrics
- ✅ Perform regular restore drills
- ✅ Keep access minimal and audited
- ✅ Document operations

### Don't:

- ❌ Run heavy queries in production without analysis
- ❌ Rely on backups you haven't restored
- ❌ Share admin credentials across team
- ❌ Skip encryption for sensitive data

## Quick Reference

- Migrations: Flyway/Liquibase, transactions
- Backups: pg_dump/pg_restore; restore testing
- Tuning: EXPLAIN ANALYZE; index optimization
- Security: RBAC, secrets management, TLS
