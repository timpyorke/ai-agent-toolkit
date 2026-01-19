# Reference Material

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

## Migrations Strategy
- Use tooling: Flyway, Liquibase, Rails migrations.
- Versioned, idempotent scripts; checksum validation.
- `up`/`down` with transactional safety.
- **Zero Downtime**: Add column -> Backfill -> Switch code -> Remove column (if needed).

## Backups & Restore
- **Types**: Full, Differential, Transaction Log.
- **Storage**: Encrypt at rest and in transit.
- **Verification**: Regular restore testing to verify integrity (Mean Time To Recovery).

## Performance Tuning
- **Query Optimization**: Identify slow queries via `EXPLAIN ANALYZE`.
- **Indexing**: Add/adjust indexes; avoid sequential scans; remove unused indexes.
- **Schema**: Optimize data types and constraints.
- **Parameters**: Tune `work_mem`, `shared_buffers`, `maintenance_work_mem` (Postgres).

## Operations & Monitoring
- **Metrics**: Query latency, throughput, queue depth, deadlocks, disk usage.
- **Alerts**: Replication lag, high connection count, storage near full.
- **Logs**: Audit connections, failed auth attempts, slow queries.

## Security
- **Access**: Role-based access (RBAC); no shared superusers.
- **Credentials**: Rotate credentials; use secrets management (Vault/KMS).
- **Row-Level Security**: Tenant isolation at database level.
- **Encryption**: TLS with certificate management.

## High Availability
- **Replication**: Primary/Replica with auto-failover (e.g., Patroni).
- **Scaling**: Read scaling via replicas; write scaling via sharding.
- **Recovery Point Objective (RPO)**: Max data loss tolerated.
- **Recovery Time Objective (RTO)**: Max time to restore service.

## Runbooks
- Incident response steps for common issues (high CPU, lock contention).
- Migration rollback procedures.
- Backup restore checklist.

## Best Practices

### Do
- ✅ Validate migrations in staging
- ✅ Monitor and alert on key metrics
- ✅ Perform regular restore drills
- ✅ Keep access minimal and audited
- ✅ Document operations

### Don't
- ❌ Run heavy queries in production without analysis
- ❌ Rely on backups you haven't restored
- ❌ Share admin credentials across team
- ❌ Skip encryption for sensitive data

## Quick Reference
- **Migrations**: Flyway/Liquibase, transactions
- **Backups**: pg_dump/pg_restore; restore testing
- **Tuning**: EXPLAIN ANALYZE; index optimization
- **Security**: RBAC, secrets management, TLS
