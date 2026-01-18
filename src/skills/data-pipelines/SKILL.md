---
name: data-pipelines
description: Robust ETL/ELT pipelines with orchestration, quality checks, lineage, idempotency, and schema evolution.
---

# 🔄 Data Pipelines

## Overview

Design and operate reliable, scalable data pipelines for analytics and ML. This skill covers ETL vs ELT patterns, orchestration (Airflow/Prefect/Dagster), data quality gates, lineage tracking, incremental processing (watermarks/CDC), idempotency, and schema evolution.

## Core Principles

1. Reliability: make pipelines idempotent; fail fast; recover cleanly.
2. Observability: validate data, track lineage, alert on anomalies.
3. Scalability: partition by time/keys; use incremental loads and CDC.
4. Maintainability: declarative configs, modular tasks/assets, clear contracts.
5. Governance: enforce schemas, evolve compatibly, and document dependencies.

## Patterns: ETL vs ELT

### ETL (Extract, Transform, Load)

```python
# ETL: Transform in pipeline
def etl_pipeline():
    # 1. Extract
    raw_data = extract_from_source()

    # 2. Transform (in Python/Spark)
    transformed = (
        raw_data
        .filter(lambda x: x['status'] == 'completed')
        .map(lambda x: {
            'order_id': x['id'],
            'revenue': x['amount'] * (1 - x['discount']),
            'date': parse_date(x['timestamp'])
        })
    )

    # 3. Load
    load_to_warehouse(transformed)
```

Use for small/medium volumes, sensitive transforms pre-load, or limited warehouse compute.

### ELT (Extract, Load, Transform)

```sql
-- ELT: Transform in warehouse with SQL/dbt
CREATE TABLE analytics.orders_summary AS
SELECT
    order_id,
    amount * (1 - discount) AS revenue,
    DATE(timestamp) AS order_date
FROM raw.orders
WHERE status = 'completed';
```

Use for large volumes on modern cloud warehouses; preserve raw data; leverage warehouse compute.

| Aspect             | ETL                      | ELT                    |
| ------------------ | ------------------------ | ---------------------- |
| Transform location | Pipeline (Spark, Python) | Warehouse (SQL/dbt)    |
| Raw data storage   | Often discarded          | Always preserved       |
| Scalability        | Pipeline-bound           | Warehouse-powered      |
| Flexibility        | Rebuild pipeline         | Re-run SQL on raw data |
| Best for           | Legacy/small data        | Cloud/big data         |

## Orchestration

### Apache Airflow

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
    'email': ['alerts@company.com']
}

with DAG(
    'daily_sales_pipeline',
    default_args=default_args,
    description='Aggregate daily sales',
    schedule_interval='0 2 * * *',
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['sales', 'analytics']
) as dag:

    extract = PythonOperator(
        task_id='extract_orders',
        python_callable=extract_orders_from_postgres
    )

    validate = PythonOperator(
        task_id='validate_data',
        python_callable=validate_data_quality
    )

    transform = PostgresOperator(
        task_id='transform_orders',
        postgres_conn_id='warehouse',
        sql="""
            INSERT INTO analytics.daily_sales
            SELECT
                DATE(order_date) as date,
                COUNT(*) as order_count,
                SUM(amount) as revenue
            FROM staging.orders
            WHERE DATE(order_date) = '{{ ds }}'
            GROUP BY DATE(order_date);
        """
    )

    load_cache = PythonOperator(
        task_id='load_to_redis',
        python_callable=load_to_redis_cache
    )

    extract >> validate >> transform >> load_cache
```

Features: UI, integrations, retries/alerts, backfills, dynamic DAGs.

### Prefect

```python
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta

@task(retries=3, cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=1))
def extract_data(date: str):
    return db.query(f"SELECT * FROM orders WHERE date = '{date}'")

@task
def validate_data(data):
    assert len(data) > 0, "No data extracted"
    assert all('order_id' in row for row in data), "Missing order_id"
    return data

@task
def transform_data(data):
    from collections import defaultdict
    aggregated = defaultdict(lambda: {'count': 0, 'revenue': 0})
    for row in data:
        product = row['product_id']
        aggregated[product]['count'] += 1
        aggregated[product]['revenue'] += row['amount']
    return dict(aggregated)

@task
def load_data(aggregated):
    warehouse.bulk_insert('analytics.product_sales', aggregated)

@flow(name="sales-pipeline")
def sales_pipeline(date: str):
    raw_data = extract_data(date)
    validated = validate_data(raw_data)
    transformed = transform_data(validated)
    load_data(transformed)
```

Features: native Python, dynamic workflows, caching, cloud-native.

### Dagster

```python
from dagster import asset, AssetExecutionContext, Definitions
from dagster import DailyPartitionsDefinition

daily_partition = DailyPartitionsDefinition(start_date="2024-01-01")

@asset(partitions_def=daily_partition)
def raw_orders(context: AssetExecutionContext):
    partition_date = context.partition_key
    orders = db.query(f"""
        SELECT * FROM orders
        WHERE DATE(created_at) = '{partition_date}'
    """)
    return orders

@asset(partitions_def=daily_partition)
def validated_orders(raw_orders):
    assert not any(o['amount'] is None for o in raw_orders)
    assert all(o['amount'] > 0 for o in raw_orders)
    return raw_orders

@asset(partitions_def=daily_partition)
def daily_sales_summary(validated_orders):
    total_revenue = sum(o['amount'] for o in validated_orders)
    total_orders = len(validated_orders)
    return {
        'date': validated_orders[0]['date'],
        'revenue': total_revenue,
        'order_count': total_orders,
        'avg_order_value': total_revenue / total_orders
    }

defs = Definitions(assets=[raw_orders, validated_orders, daily_sales_summary])
```

Features: asset-first, strong typing/lineage, testing/local dev, multi-tenant.

## Data Quality

### Schema Validation

```python
from pydantic import BaseModel, validator
from typing import List
from datetime import datetime

class OrderRecord(BaseModel):
    order_id: str
    customer_id: str
    amount: float
    status: str
    created_at: datetime

    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

    @validator('status')
    def status_must_be_valid(cls, v):
        valid_statuses = ['pending', 'completed', 'cancelled']
        if v not in valid_statuses:
            raise ValueError(f'Invalid status: {v}')
        return v

def validate_batch(records: List[dict]) -> List[OrderRecord]:
    valid_records = []
    errors = []
    for i, record in enumerate(records):
        try:
            valid_records.append(OrderRecord(**record))
        except Exception as e:
            errors.append({'row': i, 'error': str(e), 'record': record})
    if errors:
        log_validation_errors(errors)
    return valid_records
```

### Statistical Checks

```python
import pandas as pd

def check_data_quality(df: pd.DataFrame, date: str):
    checks = []

    null_check = df[['order_id', 'amount']].isnull().sum()
    checks.append({'check': 'null_check', 'passed': null_check.sum() == 0, 'details': null_check.to_dict()})

    duplicate_check = df['order_id'].duplicated().sum()
    checks.append({'check': 'uniqueness', 'passed': duplicate_check == 0, 'duplicates': duplicate_check})

    amount_range = (df['amount'] >= 0) & (df['amount'] <= 1_000_000)
    checks.append({'check': 'amount_range', 'passed': amount_range.all(), 'violations': (~amount_range).sum()})

    max_date = df['created_at'].max()
    is_fresh = (pd.Timestamp.now() - max_date).days <= 1
    checks.append({'check': 'freshness', 'passed': is_fresh, 'max_date': str(max_date)})

    expected_range = (1000, 100000)
    row_count = len(df)
    checks.append({'check': 'volume', 'passed': expected_range[0] <= row_count <= expected_range[1], 'row_count': row_count})

    store_quality_metrics(date, checks)

    critical = [c for c in checks if not c['passed'] and c['check'] in ['null_check', 'uniqueness']]
    if critical:
        raise DataQualityException(critical)
    return checks
```

### Great Expectations

```python
import great_expectations as gx

context = gx.get_context()
expectation_suite = context.add_expectation_suite("orders_suite")

expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_not_be_null",
        kwargs={"column": "order_id"}
    )
)

expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_be_between",
        kwargs={"column": "amount", "min_value": 0, "max_value": 1000000}
    )
)

expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_be_in_set",
        kwargs={"column": "status", "value_set": ["pending", "completed", "cancelled"]}
    )
)

batch_request = {
    "datasource_name": "postgres_datasource",
    "data_connector_name": "default",
    "data_asset_name": "orders",
    "partition_request": {"batch_identifiers": {"date": "2024-01-15"}}
}

checkpoint = context.add_checkpoint(
    name="orders_checkpoint",
    expectation_suite_name="orders_suite",
    batch_request=batch_request,
    action_list=[
        {"name": "store_validation_result"},
        {"name": "update_data_docs"},
        {"name": "send_slack_notification_on_failure"}
    ]
)

result = checkpoint.run()
if not result["success"]:
    raise DataQualityException("Expectations failed")
```

## Incremental Processing

### Incremental Load

```python
from datetime import datetime

def incremental_load(table: str, timestamp_column: str):
    last_run = get_last_run_timestamp(table)
    if last_run is None:
        query = f"SELECT * FROM {table}"
    else:
        query = f"""
            SELECT * FROM {table}
            WHERE {timestamp_column} > '{last_run}'
        """
    data = source_db.query(query)
    target_db.upsert(table=f"staging.{table}", data=data, key_columns=['id'])
    set_last_run_timestamp(table, datetime.now())
```

### Change Data Capture (CDC)

```python
debezium_config = {
    "name": "postgres-cdc-connector",
    "config": {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.hostname": "postgres.company.com",
        "database.port": "5432",
        "database.user": "cdc_user",
        "database.password": "***",
        "database.dbname": "production",
        "database.server.name": "prod_db",
        "table.include.list": "public.orders,public.customers",
        "plugin.name": "pgoutput",
        "publication.name": "cdc_publication",
        "slot.name": "cdc_slot"
    }
}

from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'prod_db.public.orders',
    bootstrap_servers=['kafka:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    event = message.value
    if event['op'] == 'c':
        warehouse.insert('orders', event['after'])
    elif event['op'] == 'u':
        warehouse.update('orders', event['after'], key=event['after']['id'])
    elif event['op'] == 'd':
        warehouse.delete('orders', key=event['before']['id'])
```

## Idempotency

### Upserts

```sql
MERGE INTO target.orders AS t
USING staging.orders AS s
ON t.order_id = s.order_id
WHEN MATCHED THEN
    UPDATE SET amount = s.amount, status = s.status, updated_at = s.updated_at
WHEN NOT MATCHED THEN
    INSERT (order_id, customer_id, amount, status, created_at)
    VALUES (s.order_id, s.customer_id, s.amount, s.status, s.created_at);
```

### Atomic Writes

```python
import tempfile, shutil
from pathlib import Path

def write_file_atomically(data, target_path: str):
    target = Path(target_path)
    temp_file = tempfile.NamedTemporaryFile(mode='w', dir=target.parent, delete=False)
    try:
        temp_file.write(data)
        temp_file.close()
        shutil.move(temp_file.name, target)
    except Exception:
        Path(temp_file.name).unlink(missing_ok=True)
        raise
```

### Partition-Based Idempotency

```python
def process_partition(date: str):
    warehouse.query(f"""
        DELETE FROM sales_summary WHERE partition_date = '{date}'
    """)
    warehouse.query(f"""
        INSERT INTO sales_summary
        SELECT '{date}' as partition_date, product_id, SUM(amount) as revenue, COUNT(*) as order_count
        FROM orders WHERE DATE(created_at) = '{date}' GROUP BY product_id
    """)
```

## Data Lineage

### Metadata Tracking

```python
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class DataLineage:
    dataset: str
    timestamp: datetime
    sources: List[str]
    transformations: List[Dict]
    destination: str
    row_count: int

def track_lineage(dataset: str, sources: List[str], transformations: List[Dict], destination: str, row_count: int):
    lineage = DataLineage(dataset, datetime.now(), sources, transformations, destination, row_count)
    lineage_db.insert('lineage', lineage.__dict__)
    return lineage
```

### OpenLineage

```python
from openlineage.client import OpenLineageClient
from openlineage.client.event import RunEvent, Run, Job, InputDataset, OutputDataset
from openlineage.client.facet import SchemaDatasetFacet, SchemaField

client = OpenLineageClient(url="http://marquez:5000")
job = Job(namespace="company", name="daily_sales_pipeline")
inputs = [
    InputDataset(
        namespace="postgres",
        name="public.orders",
        facets={"schema": SchemaDatasetFacet(fields=[
            SchemaField(name="order_id", type="VARCHAR"),
            SchemaField(name="amount", type="DECIMAL"),
            SchemaField(name="created_at", type="TIMESTAMP")
        ])}
    )
]
outputs = [
    OutputDataset(
        namespace="snowflake",
        name="analytics.daily_sales",
        facets={"schema": SchemaDatasetFacet(fields=[
            SchemaField(name="date", type="DATE"),
            SchemaField(name="revenue", type="DECIMAL"),
            SchemaField(name="order_count", type="INTEGER")
        ])}
    )
]
client.emit(RunEvent(eventType="START", job=job, run=Run(runId="run-123"), inputs=inputs, outputs=outputs))
client.emit(RunEvent(eventType="COMPLETE", job=job, run=Run(runId="run-123"), inputs=inputs, outputs=outputs))
```

## Schema Evolution

### Backward Compatibility

```python
class OrderV1:
    order_id: str
    amount: float

class OrderV2:
    order_id: str
    amount: float
    currency: str = "USD"
    discount: float = 0.0

def migrate_v1_to_v2(old_data: List[OrderV1]) -> List[OrderV2]:
    return [
        OrderV2(order_id=o.order_id, amount=o.amount, currency="USD", discount=0.0)
        for o in old_data
    ]
```

### Schema Registry (Avro)

```python
from confluent_kafka import avro
from confluent_kafka.avro import AvroProducer

value_schema_str = """
{
   "type": "record",
   "name": "Order",
   "namespace": "com.company.orders",
   "fields": [
       {"name": "order_id", "type": "string"},
       {"name": "amount", "type": "double"},
       {"name": "currency", "type": "string", "default": "USD"},
       {"name": "discount", "type": ["null", "double"], "default": null}
   ]
}
"""

value_schema = avro.loads(value_schema_str)
producer = AvroProducer({'bootstrap.servers': 'kafka:9092', 'schema.registry.url': 'http://schema-registry:8081'}, default_value_schema=value_schema)
producer.produce(topic='orders', value={'order_id': '123', 'amount': 99.99, 'currency': 'EUR'})
```

### Versioned Tables

```sql
CREATE TABLE orders_v1 (order_id VARCHAR, amount DECIMAL);
CREATE TABLE orders_v2 (order_id VARCHAR, amount DECIMAL, currency VARCHAR DEFAULT 'USD', discount DECIMAL DEFAULT 0);

CREATE VIEW orders AS
SELECT order_id, amount, 'USD' as currency, 0 as discount FROM orders_v1
UNION ALL
SELECT order_id, amount, currency, COALESCE(discount, 0) as discount FROM orders_v2;
```

## Best Practices

- Make pipelines idempotent and retry-safe
- Validate early; fail fast on quality gates
- Track lineage and dependencies
- Partition data (e.g., by date) to improve performance
- Parameterize time ranges; avoid hard-coded dates
- Handle errors and alert; avoid silent failures

## Anti-Patterns

- Loading data without validation or quality checks
- Hard-coded dates and environment-specific paths
- Silent failures (swallowing exceptions); no alerts
- Non-idempotent writes leading to duplicates
- No partitioning; full scans on large tables
- Untracked lineage making audits impossible

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

## Tools & Techniques

- Orchestrators: Airflow, Prefect, Dagster
- Transform: dbt, Spark, SQL
- Quality: Great Expectations, Pydantic, pandas checks
- Lineage: OpenLineage, custom metadata store
- Movement: Debezium, Kafka, Batch loaders
- Warehouses: Snowflake, BigQuery, Redshift

## Quick Reference

```python
# Airflow DAG
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG('my_pipeline', schedule_interval='@daily') as dag:
    task1 = PythonOperator(task_id='extract', python_callable=extract)
    task2 = PythonOperator(task_id='transform', python_callable=transform)
    task1 >> task2

# Great Expectations validation
import great_expectations as gx
context = gx.get_context()
result = context.run_checkpoint("my_checkpoint")

# Idempotent upsert (SQL)
MERGE INTO target USING source
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...

# OpenLineage tracking
from openlineage.client import OpenLineageClient
client = OpenLineageClient(url="http://marquez:5000")
client.emit(RunEvent(eventType="START", job=job, run=run))
```

## Conclusion

Build pipelines that are observable, idempotent, and scalable. Prefer ELT on cloud warehouses, enforce quality gates, track lineage, and evolve schemas carefully to keep analytics and ML reliable.

---

Related Skills: [database-management](../database-management/SKILL.md) | [observability](../observability/SKILL.md) | [model-serving](../model-serving/SKILL.md) | [ml-monitoring](../ml-monitoring/SKILL.md)

## ETL vs ELT

### ETL (Extract, Transform, Load)

**Pattern**: Transform data before loading to destination.

```python
# ETL: Transform in pipeline
def etl_pipeline():
    # 1. Extract
    raw_data = extract_from_source()

    # 2. Transform (in Python/Spark)
    transformed = (
        raw_data
        .filter(lambda x: x['status'] == 'completed')
        .map(lambda x: {
            'order_id': x['id'],
            'revenue': x['amount'] * (1 - x['discount']),
            'date': parse_date(x['timestamp'])
        })
    )

    # 3. Load
    load_to_warehouse(transformed)
```

**Use cases**:

- Small to medium data volumes
- Complex transformations requiring specialized tools
- Data masking/encryption before load
- Target system has limited compute

### ELT (Extract, Load, Transform)

**Pattern**: Load raw data first, transform in destination.

```sql
-- ELT: Transform in warehouse with SQL/dbt
-- 1. Extract & Load: Raw data loaded to warehouse

-- 2. Transform (in warehouse)
CREATE TABLE analytics.orders_summary AS
SELECT
    order_id,
    amount * (1 - discount) AS revenue,
    DATE(timestamp) AS order_date
FROM raw.orders
WHERE status = 'completed';
```

**Use cases**:

- Large data volumes
- Modern cloud warehouses (Snowflake, BigQuery)
- Preserve raw data for reprocessing
- Leverage warehouse's compute power

**Comparison**:

| Aspect             | ETL                        | ELT                        |
| ------------------ | -------------------------- | -------------------------- |
| Transform location | Pipeline (Spark, Python)   | Warehouse (SQL)            |
| Raw data storage   | Often discarded            | Always preserved           |
| Scalability        | Limited by pipeline        | Leverages warehouse        |
| Flexibility        | Need to rebuild pipeline   | Re-run SQL on raw data     |
| Best for           | Legacy systems, small data | Cloud warehouses, big data |

## Orchestration Tools

### Apache Airflow

Most popular open-source orchestrator.

**DAG (Directed Acyclic Graph)**

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
    'email': ['alerts@company.com']
}

with DAG(
    'daily_sales_pipeline',
    default_args=default_args,
    description='Aggregate daily sales',
    schedule_interval='0 2 * * *',  # 2 AM daily
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['sales', 'analytics']
) as dag:

    # Task 1: Extract
    extract = PythonOperator(
        task_id='extract_orders',
        python_callable=extract_orders_from_postgres
    )

    # Task 2: Validate
    validate = PythonOperator(
        task_id='validate_data',
        python_callable=validate_data_quality
    )

    # Task 3: Transform
    transform = PostgresOperator(
        task_id='transform_orders',
        postgres_conn_id='warehouse',
        sql="""
            INSERT INTO analytics.daily_sales
            SELECT
                DATE(order_date) as date,
                COUNT(*) as order_count,
                SUM(amount) as revenue
            FROM staging.orders
            WHERE DATE(order_date) = '{{ ds }}'
            GROUP BY DATE(order_date);
        """
    )

    # Task 4: Load to cache
    load_cache = PythonOperator(
        task_id='load_to_redis',
        python_callable=load_to_redis_cache
    )

    # Define dependencies
    extract >> validate >> transform >> load_cache
```

**Key features**:

- Rich UI for monitoring
- Extensive integrations (AWS, GCP, Azure, Snowflake, etc.)
- Dynamic DAG generation
- Task retries and alerting
- Backfilling for historical runs

### Prefect

Modern alternative with dynamic workflows.

```python
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta

@task(retries=3, cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=1))
def extract_data(date: str):
    """Extract orders for date"""
    return db.query(f"SELECT * FROM orders WHERE date = '{date}'")

@task
def validate_data(data):
    """Check data quality"""
    assert len(data) > 0, "No data extracted"
    assert all('order_id' in row for row in data), "Missing order_id"
    return data

@task
def transform_data(data):
    """Aggregate by product"""
    from collections import defaultdict
    aggregated = defaultdict(lambda: {'count': 0, 'revenue': 0})

    for row in data:
        product = row['product_id']
        aggregated[product]['count'] += 1
        aggregated[product]['revenue'] += row['amount']

    return dict(aggregated)

@task
def load_data(aggregated):
    """Load to warehouse"""
    warehouse.bulk_insert('analytics.product_sales', aggregated)

@flow(name="sales-pipeline")
def sales_pipeline(date: str):
    """Daily sales processing pipeline"""
    raw_data = extract_data(date)
    validated = validate_data(raw_data)
    transformed = transform_data(validated)
    load_data(transformed)

# Run
if __name__ == "__main__":
    from datetime import date
    sales_pipeline(date.today().isoformat())
```

**Key features**:

- Dynamic workflows (conditional logic)
- Native Python (no DSL)
- Built-in caching
- Cloud-native (Prefect Cloud)
- Observability out of the box

### Dagster

Asset-centric orchestration.

```python
from dagster import asset, AssetExecutionContext, Definitions
from dagster import DailyPartitionsDefinition

daily_partition = DailyPartitionsDefinition(start_date="2024-01-01")

@asset(partitions_def=daily_partition)
def raw_orders(context: AssetExecutionContext):
    """Extract raw orders from source"""
    partition_date = context.partition_key

    orders = db.query(f"""
        SELECT * FROM orders
        WHERE DATE(created_at) = '{partition_date}'
    """)

    return orders

@asset(partitions_def=daily_partition)
def validated_orders(raw_orders):
    """Validate data quality"""
    # Check for nulls
    assert not any(o['amount'] is None for o in raw_orders)

    # Check ranges
    assert all(o['amount'] > 0 for o in raw_orders)

    return raw_orders

@asset(partitions_def=daily_partition)
def daily_sales_summary(validated_orders):
    """Aggregate daily sales"""
    total_revenue = sum(o['amount'] for o in validated_orders)
    total_orders = len(validated_orders)

    return {
        'date': validated_orders[0]['date'],
        'revenue': total_revenue,
        'order_count': total_orders,
        'avg_order_value': total_revenue / total_orders
    }

defs = Definitions(
    assets=[raw_orders, validated_orders, daily_sales_summary]
)
```

**Key features**:

- Asset-first (focus on data, not tasks)
- Software-defined assets (SDA)
- Type system and lineage
- Testing and local development
- Multi-tenancy support

## Data Quality Checks

### Schema Validation

```python
from pydantic import BaseModel, validator
from typing import List
from datetime import datetime

class OrderRecord(BaseModel):
    order_id: str
    customer_id: str
    amount: float
    status: str
    created_at: datetime

    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

    @validator('status')
    def status_must_be_valid(cls, v):
        valid_statuses = ['pending', 'completed', 'cancelled']
        if v not in valid_statuses:
            raise ValueError(f'Invalid status: {v}')
        return v

def validate_batch(records: List[dict]) -> List[OrderRecord]:
    """Validate entire batch, collect errors"""
    valid_records = []
    errors = []

    for i, record in enumerate(records):
        try:
            valid_records.append(OrderRecord(**record))
        except Exception as e:
            errors.append({'row': i, 'error': str(e), 'record': record})

    if errors:
        # Log errors, send to dead letter queue
        log_validation_errors(errors)

    return valid_records
```

### Statistical Checks

```python
import pandas as pd

def check_data_quality(df: pd.DataFrame, date: str):
    """Run statistical checks"""
    checks = []

    # 1. Completeness: No missing critical fields
    null_check = df[['order_id', 'amount']].isnull().sum()
    checks.append({
        'check': 'null_check',
        'passed': null_check.sum() == 0,
        'details': null_check.to_dict()
    })

    # 2. Uniqueness: order_id should be unique
    duplicate_check = df['order_id'].duplicated().sum()
    checks.append({
        'check': 'uniqueness',
        'passed': duplicate_check == 0,
        'duplicates': duplicate_check
    })

    # 3. Consistency: amount range
    amount_range = (df['amount'] >= 0) & (df['amount'] <= 1_000_000)
    checks.append({
        'check': 'amount_range',
        'passed': amount_range.all(),
        'violations': (~amount_range).sum()
    })

    # 4. Freshness: data is recent
    max_date = df['created_at'].max()
    is_fresh = (pd.Timestamp.now() - max_date).days <= 1
    checks.append({
        'check': 'freshness',
        'passed': is_fresh,
        'max_date': str(max_date)
    })

    # 5. Volume: expected row count
    expected_range = (1000, 100000)
    row_count = len(df)
    checks.append({
        'check': 'volume',
        'passed': expected_range[0] <= row_count <= expected_range[1],
        'row_count': row_count
    })

    # Store results
    store_quality_metrics(date, checks)

    # Fail pipeline if critical checks fail
    critical_failures = [c for c in checks if not c['passed'] and c['check'] in ['null_check', 'uniqueness']]
    if critical_failures:
        raise DataQualityException(critical_failures)

    return checks
```

### Great Expectations

Industry-standard data quality framework.

```python
import great_expectations as gx

# Create data context
context = gx.get_context()

# Define expectations
expectation_suite = context.add_expectation_suite("orders_suite")

# Add expectations
expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_not_be_null",
        kwargs={"column": "order_id"}
    )
)

expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_be_between",
        kwargs={"column": "amount", "min_value": 0, "max_value": 1000000}
    )
)

expectation_suite.add_expectation(
    gx.core.ExpectationConfiguration(
        expectation_type="expect_column_values_to_be_in_set",
        kwargs={"column": "status", "value_set": ["pending", "completed", "cancelled"]}
    )
)

# Validate data
batch_request = {
    "datasource_name": "postgres_datasource",
    "data_connector_name": "default",
    "data_asset_name": "orders",
    "partition_request": {"batch_identifiers": {"date": "2024-01-15"}}
}

checkpoint = context.add_checkpoint(
    name="orders_checkpoint",
    expectation_suite_name="orders_suite",
    batch_request=batch_request,
    action_list=[
        {"name": "store_validation_result"},
        {"name": "update_data_docs"},
        {"name": "send_slack_notification_on_failure"}
    ]
)

result = checkpoint.run()

if not result["success"]:
    raise DataQualityException("Expectations failed")
```

## Incremental Processing

### Incremental Load Pattern

```python
from datetime import datetime, timedelta

def incremental_load(table: str, timestamp_column: str):
    """Load only new/updated records"""

    # Get last successful run timestamp
    last_run = get_last_run_timestamp(table)

    if last_run is None:
        # First run: full load
        query = f"SELECT * FROM {table}"
    else:
        # Incremental: only new records
        query = f"""
            SELECT * FROM {table}
            WHERE {timestamp_column} > '{last_run}'
        """

    data = source_db.query(query)

    # Upsert to target (update if exists, insert if new)
    target_db.upsert(
        table=f"staging.{table}",
        data=data,
        key_columns=['id']
    )

    # Update watermark
    set_last_run_timestamp(table, datetime.now())
```

### Change Data Capture (CDC)

```python
# Debezium CDC connector config
debezium_config = {
    "name": "postgres-cdc-connector",
    "config": {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.hostname": "postgres.company.com",
        "database.port": "5432",
        "database.user": "cdc_user",
        "database.password": "***",
        "database.dbname": "production",
        "database.server.name": "prod_db",
        "table.include.list": "public.orders,public.customers",
        "plugin.name": "pgoutput",
        "publication.name": "cdc_publication",
        "slot.name": "cdc_slot"
    }
}

# Consume CDC events from Kafka
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'prod_db.public.orders',
    bootstrap_servers=['kafka:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    event = message.value

    if event['op'] == 'c':  # Create
        warehouse.insert('orders', event['after'])
    elif event['op'] == 'u':  # Update
        warehouse.update('orders', event['after'], key=event['after']['id'])
    elif event['op'] == 'd':  # Delete
        warehouse.delete('orders', key=event['before']['id'])
```

## Idempotency

Ensure pipeline can run multiple times without side effects.

### Idempotent Inserts

```sql
-- Use MERGE (upsert) instead of INSERT
MERGE INTO target.orders AS t
USING staging.orders AS s
ON t.order_id = s.order_id
WHEN MATCHED THEN
    UPDATE SET
        amount = s.amount,
        status = s.status,
        updated_at = s.updated_at
WHEN NOT MATCHED THEN
    INSERT (order_id, customer_id, amount, status, created_at)
    VALUES (s.order_id, s.customer_id, s.amount, s.status, s.created_at);
```

### Idempotent File Writes

```python
import tempfile
import shutil
from pathlib import Path

def write_file_atomically(data, target_path: str):
    """Write to temp file, then atomic rename"""
    target = Path(target_path)

    # Write to temporary file in same directory
    temp_file = tempfile.NamedTemporaryFile(
        mode='w',
        dir=target.parent,
        delete=False
    )

    try:
        # Write data
        temp_file.write(data)
        temp_file.close()

        # Atomic rename (overwrites if exists)
        shutil.move(temp_file.name, target)
    except Exception as e:
        # Cleanup temp file on error
        Path(temp_file.name).unlink(missing_ok=True)
        raise e
```

### Partition-Based Idempotency

```python
def process_partition(date: str):
    """Process data for specific date partition"""

    # Delete existing partition
    warehouse.query(f"""
        DELETE FROM sales_summary
        WHERE partition_date = '{date}'
    """)

    # Insert new data for partition
    warehouse.query(f"""
        INSERT INTO sales_summary
        SELECT
            '{date}' as partition_date,
            product_id,
            SUM(amount) as revenue,
            COUNT(*) as order_count
        FROM orders
        WHERE DATE(created_at) = '{date}'
        GROUP BY product_id
    """)

    # Running twice produces same result (idempotent)
```

## Data Lineage

Track data flow from source to destination.

### Lineage with Metadata

```python
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class DataLineage:
    dataset: str
    timestamp: datetime
    sources: List[str]
    transformations: List[Dict]
    destination: str
    row_count: int

def track_lineage(
    dataset: str,
    sources: List[str],
    transformations: List[Dict],
    destination: str,
    row_count: int
):
    """Record lineage metadata"""
    lineage = DataLineage(
        dataset=dataset,
        timestamp=datetime.now(),
        sources=sources,
        transformations=transformations,
        destination=destination,
        row_count=row_count
    )

    # Store in lineage database
    lineage_db.insert('lineage', lineage.__dict__)

    return lineage

# Usage in pipeline
lineage = track_lineage(
    dataset='daily_sales_summary',
    sources=['postgres.orders', 'postgres.customers'],
    transformations=[
        {'step': 'filter', 'condition': 'status=completed'},
        {'step': 'join', 'tables': ['orders', 'customers']},
        {'step': 'aggregate', 'groupby': ['date', 'customer_segment']}
    ],
    destination='snowflake.analytics.sales_summary',
    row_count=15234
)
```

### OpenLineage

Industry standard for lineage tracking.

```python
from openlineage.client import OpenLineageClient
from openlineage.client.event import (
    RunEvent, Run, Job, Dataset, InputDataset, OutputDataset
)
from openlineage.client.facet import (
    SqlJobFacet, SchemaDatasetFacet, SchemaField
)

client = OpenLineageClient(url="http://marquez:5000")

# Define job
job = Job(
    namespace="company",
    name="daily_sales_pipeline"
)

# Define input datasets
inputs = [
    InputDataset(
        namespace="postgres",
        name="public.orders",
        facets={
            "schema": SchemaDatasetFacet(
                fields=[
                    SchemaField(name="order_id", type="VARCHAR"),
                    SchemaField(name="amount", type="DECIMAL"),
                    SchemaField(name="created_at", type="TIMESTAMP")
                ]
            )
        }
    )
]

# Define output dataset
outputs = [
    OutputDataset(
        namespace="snowflake",
        name="analytics.daily_sales",
        facets={
            "schema": SchemaDatasetFacet(
                fields=[
                    SchemaField(name="date", type="DATE"),
                    SchemaField(name="revenue", type="DECIMAL"),
                    SchemaField(name="order_count", type="INTEGER")
                ]
            )
        }
    )
]

# Emit START event
client.emit(
    RunEvent(
        eventType="START",
        job=job,
        run=Run(runId="run-123"),
        inputs=inputs,
        outputs=outputs
    )
)

# ... pipeline execution ...

# Emit COMPLETE event
client.emit(
    RunEvent(
        eventType="COMPLETE",
        job=job,
        run=Run(runId="run-123"),
        inputs=inputs,
        outputs=outputs
    )
)
```

## Schema Evolution

Handle schema changes gracefully.

### Backward Compatibility

```python
# Old schema
class OrderV1:
    order_id: str
    amount: float

# New schema (backward compatible)
class OrderV2:
    order_id: str
    amount: float
    currency: str = "USD"  # Default value for existing data
    discount: float = 0.0  # Optional field with default

def migrate_v1_to_v2(old_data: List[OrderV1]) -> List[OrderV2]:
    """Add default values for new fields"""
    return [
        OrderV2(
            order_id=order.order_id,
            amount=order.amount,
            currency="USD",  # Default
            discount=0.0     # Default
        )
        for order in old_data
    ]
```

### Schema Registry (Avro)

```python
from confluent_kafka import avro
from confluent_kafka.avro import AvroProducer

# Define schema with evolution rules
value_schema_str = """
{
   "type": "record",
   "name": "Order",
   "namespace": "com.company.orders",
   "fields": [
       {"name": "order_id", "type": "string"},
       {"name": "amount", "type": "double"},
       {"name": "currency", "type": "string", "default": "USD"},
       {"name": "discount", "type": ["null", "double"], "default": null}
   ]
}
"""

value_schema = avro.loads(value_schema_str)

# Producer with schema registry
producer = AvroProducer({
    'bootstrap.servers': 'kafka:9092',
    'schema.registry.url': 'http://schema-registry:8081'
}, default_value_schema=value_schema)

# Schema registry handles compatibility checks
producer.produce(
    topic='orders',
    value={'order_id': '123', 'amount': 99.99, 'currency': 'EUR'}
)
```

### Versioned Tables

```sql
-- Maintain multiple schema versions
CREATE TABLE orders_v1 (
    order_id VARCHAR,
    amount DECIMAL
);

CREATE TABLE orders_v2 (
    order_id VARCHAR,
    amount DECIMAL,
    currency VARCHAR DEFAULT 'USD',
    discount DECIMAL DEFAULT 0
);

-- Unified view for backward compatibility
CREATE VIEW orders AS
SELECT
    order_id,
    amount,
    'USD' as currency,
    0 as discount
FROM orders_v1
UNION ALL
SELECT
    order_id,
    amount,
    currency,
    COALESCE(discount, 0) as discount
FROM orders_v2;
```

## Best Practices

### ✅ DO

1. **Make pipelines idempotent**

```python
# ✅ Safe to re-run
def pipeline(date):
    # Delete and reinsert
    delete_partition(date)
    insert_data(date)
```

2. **Fail fast with validation**

```python
# ✅ Validate early
def pipeline():
    data = extract()
    validate(data)  # Fail here if bad
    transform(data)
    load(data)
```

3. **Track lineage**

```python
# ✅ Record dependencies
lineage = {
    'sources': ['orders', 'customers'],
    'transformations': ['filter', 'join', 'aggregate'],
    'destination': 'sales_summary'
}
```

4. **Use partitioning for performance**

```sql
-- ✅ Partition by date
CREATE TABLE orders (
    order_id VARCHAR,
    amount DECIMAL,
    order_date DATE
)
PARTITION BY RANGE (order_date);
```

### ❌ DON'T

1. **Don't ignore data quality**

```python
# ❌ No validation
data = extract()
load(data)  # Garbage in, garbage out
```

2. **Don't hardcode dates**

```python
# ❌ Hardcoded
data = extract("WHERE date = '2024-01-15'")

# ✅ Parameterized
data = extract(f"WHERE date = '{execution_date}'")
```

3. **Don't skip error handling**

```python
# ❌ Fails silently
try:
    load_data()
except:
    pass  # Silent failure

# ✅ Handle and alert
try:
    load_data()
except Exception as e:
    log.error(f"Load failed: {e}")
    send_alert(e)
    raise
```

## Quick Reference

```python
# Airflow DAG
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG('my_pipeline', schedule_interval='@daily') as dag:
    task1 = PythonOperator(task_id='extract', python_callable=extract)
    task2 = PythonOperator(task_id='transform', python_callable=transform)
    task1 >> task2

# Great Expectations validation
import great_expectations as gx
context = gx.get_context()
result = context.run_checkpoint("my_checkpoint")

# Idempotent upsert (SQL)
MERGE INTO target USING source
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...

# OpenLineage tracking
from openlineage.client import OpenLineageClient
client = OpenLineageClient(url="http://marquez:5000")
client.emit(RunEvent(eventType="START", job=job, run=run))
```

## Additional Resources

- [Apache Airflow Documentation](https://airflow.apache.org/docs/)
- [Prefect Documentation](https://docs.prefect.io/)
- [Dagster Documentation](https://docs.dagster.io/)
- [Great Expectations Documentation](https://docs.greatexpectations.io/)
- [OpenLineage](https://openlineage.io/)
- [Fundamentals of Data Engineering Book](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/)
- [Data Pipelines Pocket Reference](https://www.oreilly.com/library/view/data-pipelines-pocket/9781492087823/)

---

**Related Skills**: [database-management](../database-management/SKILL.md) | [observability](../observability/SKILL.md) | [model-serving](../model-serving/SKILL.md) | [ml-monitoring](../ml-monitoring/SKILL.md)
