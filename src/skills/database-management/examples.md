# Examples

## Migrations

### Flyway/SQL Migration
```sql
-- V20260117__add_users_table.sql
BEGIN;
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
COMMIT;
```

## Operations

### Backups & Restore (Postgres)
```bash
# Backup
pg_dump -Fc -d $DB_URL -f backups/db_$(date +%F).dump

# Restore
pg_restore -d $RESTORE_DB_URL backups/db_2026-01-17.dump
```

### Performance Tuning
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;

-- Check for bloat (Postgres specific example query - requires extension or complex query, simpler placeholder here for typical admin check)
SELECT schemaname, relname, n_dead_tup, n_live_tup, (n_dead_tup::float / n_live_tup::float) as bloat_ratio
FROM pg_stat_user_tables
WHERE n_live_tup > 0 ORDER BY bloat_ratio DESC;
```

## Admin Commands

### Check Connections
```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```

### Kill Long Running Query
```sql
SELECT pg_terminate_backend(pid);
```
