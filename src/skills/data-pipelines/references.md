# Reference Material

## Core Principles

1. **Reliability**: make pipelines idempotent; fail fast; recover cleanly.
2. **Observability**: validate data, track lineage, alert on anomalies.
3. **Scalability**: partition by time/keys; use incremental loads and CDC.
4. **Maintainability**: declarative configs, modular tasks/assets, clear contracts.
5. **Governance**: enforce schemas, evolve compatibly, and document dependencies.

## Patterns: ETL vs ELT

| Aspect | ETL | ELT |
| :--- | :--- | :--- |
| **Transform location** | Pipeline (Spark, Python) | Warehouse (SQL/dbt) |
| **Raw data storage** | Often discarded | Always preserved |
| **Scalability** | Pipeline-bound | Warehouse-powered |
| **Flexibility** | Rebuild pipeline | Re-run SQL on raw data |
| **Best for** | Legacy/small data, privacy masking | Cloud/big data, auditing |

## Orchestration Tools

### Apache Airflow
- **Features**: UI, integrations, retries/alerts, backfills, dynamic DAGs.
- **Model**: Directed Acyclic Graph (DAG) of tasks.
- **Use Case**: Complex dependency management, legacy integration.

### Prefect
- **Features**: Native Python, dynamic workflows, caching, cloud-native.
- **Model**: Flows and Tasks.
- **Use Case**: Developer-friendly dataflows, modern stack.

### Dagster
- **Features**: Asset-first, strong typing/lineage, testing/local dev, multi-tenant.
- **Model**: Software-defined assets.
- **Use Case**: Data platform engineering, complex asset dependencies.

## Incremental Processing

### Strategies
- **Watermark/Timestamp**: Query data > last run time. Simple but deletes not captured.
- **CDC (Change Data Capture)**: Read transaction logs (WAL). Captures inserts, updates, deletes fully.
- **Partition Exchange**: Swap table partitions (Hive/BigQuery).

## Idempotency

### Concepts
- **Definition**: Running a job multiple times produces the same result as running it once.
- **Critical for**: Retries, backfills, and error recovery.

### Techniques
- **Upserts (MERGE)**: Update if exists, insert if new.
- **Atomic Swap**: Write to temp, swap pointer.
- **Partition Overwrite**: Delete partition X, insert X.

## Data Lineage

- **Importance**: Understanding dependencies, root cause analysis, impact analysis.
- **Standards**: OpenLineage (JSON spec for lineage events).

## Schema Evolution

### Backward Compatibility
- **Safe**: Adding nullable columns, adding default values.
- **Unsafe**: Renaming columns (without aliases), changing types incompatibly, removing required fields.

### Strategies
- **Schema Registry**: Enforce compatibility at producer/consumer level (Avro/Protobuf).
- **Versioned Tables**: `orders_v1`, `orders_v2` with a `VIEW` unioning them.
- **Dual Write**: Write to old and new schemas during migration.

## Best Practices

- **Make pipelines idempotent**: Allow safe retries.
- **Validate early**: Fail fast on quality gates (inputs).
- **Track lineage**: Document upstream/downstream dependencies.
- **Partition data**: Improve query performance and manageable chunks.
- **Parameterize time**: Avoid `now()` in code; use execution date.
- **Handle errors**: Alert on failures, dead-letter queues for bad data.

## Anti-Patterns

- **Loading without validation**: Garbage In, Garbage Out.
- **Hard-coded dates**: Makes backfilling impossible.
- **Silent failures**: Catching exceptions without alerting.
- **Non-idempotent writes**: Duplicate data on retry.
- **No partitioning**: Full table scans on petabyte datasets.
- **Untracked lineage**: "Who consumes this table?" becomes a mystery.

## Scenarios

### Build Daily Sales Pipeline
1. Orchestrate with Airflow DAG (extract → validate → transform → load)
2. Add Great Expectations checkpoint to block bad data
3. Partition by date for performance and idempotent re-runs

### Migrate ETL to ELT
1. Load raw data to `raw.*` tables
2. Use dbt/SQL transformations in warehouse
3. Preserve raw for backfills and reprocessing

### Add CDC for Near-Real-Time
1. Configure Debezium connector → Kafka topics
2. Upsert changes to warehouse with `MERGE`
3. Monitor lag and alert on anomalies

### Recover a Failed Run
1. Use watermarks to identify incomplete partitions
2. Re-run idempotent partition jobs; verify with quality checks
3. Emit lineage events for audit trail
