# Examples

## ETL vs ELT Patterns

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

## Data Quality

### Schema Validation (Pydantic)
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

### Statistical Checks (Pandas)
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

## Incremental & Idempotent Processing

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
# Debezium Configuration
debezium_config = {
    "name": "postgres-cdc-connector",
    "config": {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.hostname": "postgres.company.com",
        "database.port": "5432",
        "database.user": "cdc_user",
        "database.password": "***",
        "database.dbname": "production",
        "table.include.list": "public.orders,public.customers",
        "plugin.name": "pgoutput",
        "publication.name": "cdc_publication",
        "slot.name": "cdc_slot"
    }
}

# Kafka Consumer
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

### Idempotent Upsert (SQL)
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

### Atomic Writes (Python)
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

## Lineage & schema

### Custom Metadata Tracking
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

## Quick Reference Code
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
