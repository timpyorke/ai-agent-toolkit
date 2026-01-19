# Reference Material

## Core Concepts

1.  **Scalability**: Horizontal (add nodes) vs Vertical (bigger nodes).
2.  **Availability**: Redundancy, failover, health checks.
3.  **Consistency**: Strong vs Eventual (CAP Theorem).
4.  **Partitioning**: Sharding data to distribute load.

## CAP Theorem

| Property | Description | Example |
|----------|-------------|---------|
| **CP** | Consistent + Partition Tolerant (Sacrifice Availability) | Banking (RDBMS/HBase) |
| **AP** | Available + Partition Tolerant (Sacrifice Consistency) | Social Feeds (Cassandra/Dynamo) |
| **CA** | Consistent + Available (No Network Partitions, impossible in dist sys) | Single SQL Node |

## Database Types

-   **Relational (SQL)**: Structured, ACID, expensive scaling. (Postgres, MySQL)
-   **NoSQL (Document)**: Flexible schema, easy scaling. (MongoDB)
-   **NoSQL (Wide-Column)**: High write throughput, time-series. (Cassandra)
-   **Key-Value**: Caching, simple lookups. (Redis)

## Trade-offs

-   **Latency vs. Consistency**: waiting for all replicas to sync increases latency.
-   **SQL vs. NoSQL**: SQL gives guarantees; NoSQL gives scale.
-   **REST vs. RPC**: REST is standard; RPC is faster (protobufs).
