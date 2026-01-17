---
name: System Design
description: Architect scalable, maintainable systems with clear component design, data flow, and trade-off analysis
---

# System Design Skill

Master the art of designing robust, scalable systems by understanding components, data flow, scalability patterns, and making informed architectural trade-offs.

## Core Principles

### 1. Scalability First

- **Horizontal vs Vertical**: Scale out (add servers) vs scale up (bigger servers)
- **Stateless services**: Enable easy horizontal scaling
- **Partitioning**: Shard data and workload appropriately
- **Caching**: Reduce load on backend systems

### 2. Reliability & Availability

- **Redundancy**: Eliminate single points of failure
- **Fault tolerance**: Gracefully handle component failures
- **Load balancing**: Distribute traffic evenly
- **Health checks**: Monitor and route around unhealthy instances

### 3. Maintainability

- **Separation of concerns**: Clear module boundaries
- **Loose coupling**: Minimize dependencies between components
- **High cohesion**: Related functionality grouped together
- **Observable**: Built-in logging, metrics, and tracing

### 4. Performance

- **Latency optimization**: Minimize response times
- **Throughput maximization**: Handle high request volumes
- **Resource efficiency**: Optimal CPU, memory, disk, network usage
- **Bottleneck identification**: Profile and optimize critical paths

## System Design Framework

### 1. Requirements Gathering

```markdown
## Functional Requirements

- What features must the system provide?
- What are the user workflows?
- What operations need to be supported?

## Non-Functional Requirements

- **Scale**: Users, requests/sec, data volume?
- **Performance**: Latency targets (p50, p95, p99)?
- **Availability**: Uptime requirements (99.9%, 99.99%)?
- **Consistency**: Strong vs eventual consistency?
- **Security**: Authentication, authorization, encryption?

## Constraints

- Budget limitations?
- Technology stack preferences?
- Compliance requirements (GDPR, HIPAA)?
- Time to market?
```

### 2. Capacity Estimation

```python
# Example: Social Media Feed Service

# Traffic estimates
daily_active_users = 100_000_000
posts_per_user_per_day = 2
reads_per_user_per_day = 50

# QPS calculations
write_qps = (daily_active_users * posts_per_user_per_day) / 86400
# = 100M * 2 / 86400 ≈ 2,315 writes/sec

read_qps = (daily_active_users * reads_per_user_per_day) / 86400
# = 100M * 50 / 86400 ≈ 57,870 reads/sec

# Storage estimates
avg_post_size = 1_kb  # text + metadata
media_avg_size = 500_kb  # images/videos
posts_per_year = daily_active_users * posts_per_user_per_day * 365

text_storage_per_year = posts_per_year * avg_post_size
# = 100M * 2 * 365 * 1KB ≈ 73 TB/year

media_storage_per_year = posts_per_year * media_avg_size * 0.3  # 30% include media
# ≈ 10,950 TB/year

# Bandwidth
write_bandwidth = write_qps * (avg_post_size + media_avg_size * 0.3)
# ≈ 2,315 * 151KB ≈ 350 MB/sec

read_bandwidth = read_qps * avg_post_size
# ≈ 57,870 * 1KB ≈ 58 MB/sec
```

### 3. High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  Web Browsers, Mobile Apps, Third-party Integrations        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN / Edge Network                        │
│  Static Assets, Cached Responses, DDoS Protection           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (L7)                        │
│  Route requests, SSL termination, Health checks             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌─────┐      ┌─────┐      ┌─────┐
    │API  │      │API  │      │API  │
    │Svc 1│      │Svc 2│      │Svc N│
    └──┬──┘      └──┬──┘      └──┬──┘
       │            │            │
       └────────────┼────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌────────────────┐      ┌────────────────┐
│  Cache Layer   │      │  Message Queue │
│  (Redis/Memcached)│   │  (Kafka/RabbitMQ)│
└────────────────┘      └────────────────┘
        │                       │
        ▼                       ▼
┌────────────────────────────────────────┐
│          Application Services          │
│  User, Post, Feed, Notification, etc.  │
└────────────┬───────────────────────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│ DB     │ │ DB     │ │ Object │
│Primary │ │Replica │ │Storage │
└────────┘ └────────┘ └────────┘
```

## Common Architectural Patterns

### 1. Microservices Architecture

```
Characteristics:
✓ Independent deployment
✓ Service per bounded context
✓ Decentralized data management
✓ Technology heterogeneity

Trade-offs:
+ Scalability and flexibility
+ Team autonomy
- Distributed system complexity
- Network latency and reliability
- Data consistency challenges
```

**Service Design:**

```yaml
User Service:
  Responsibilities:
    - User registration and authentication
    - Profile management
    - User preferences
  Data:
    - User credentials
    - Profile information
  APIs:
    - POST /users (create)
    - GET /users/{id} (read)
    - PUT /users/{id} (update)
  Dependencies:
    - Notification Service (async)
    - Auth Service

Post Service:
  Responsibilities:
    - Create, read, update, delete posts
    - Post metadata management
  Data:
    - Post content
    - Author reference
    - Timestamps
  APIs:
    - POST /posts
    - GET /posts/{id}
    - GET /users/{userId}/posts
  Dependencies:
    - User Service
    - Media Service
    - Feed Service (async)
```

### 2. Event-Driven Architecture

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│ Service A│──Event─▶│ Message Broker│──Event─▶│ Service B│
└──────────┘         │  (Kafka/SNS) │         └──────────┘
                     └──────┬───────┘
                            │
                            │ Event
                            ▼
                     ┌──────────┐
                     │ Service C│
                     └──────────┘

Benefits:
+ Loose coupling between services
+ Asynchronous processing
+ Easy to add new subscribers
+ Event replay capability

Challenges:
- Event schema evolution
- Debugging distributed flows
- Eventual consistency
- Message ordering guarantees
```

### 3. CQRS (Command Query Responsibility Segregation)

```
Write Path (Commands):
┌────────┐    ┌─────────────┐    ┌──────────────┐
│Command │───▶│Command Handler│───▶│ Write Model  │
└────────┘    └─────────────┘    │  (Postgres)  │
                                  └──────┬───────┘
                                         │ Events
                                         ▼
                                  ┌──────────────┐
                                  │ Event Stream │
                                  └──────┬───────┘
                                         │
Read Path (Queries):                    │ Projection
┌────────┐    ┌─────────────┐          ▼
│ Query  │───▶│ Query Handler│    ┌──────────────┐
└────────┘    └─────────────┘    │  Read Model  │
                     ▲            │ (Elasticsearch)│
                     └────────────└──────────────┘

Use Cases:
- Different read/write patterns
- Complex querying needs
- High read/write ratio
- Event sourcing
```

## Scalability Patterns

### 1. Database Scaling

**Vertical Scaling:**

```
┌─────────────────┐
│ Single Database │
│  (Bigger Box)   │
│                 │
│ CPU: 64 cores   │
│ RAM: 512 GB     │
│ Disk: 10 TB SSD │
└─────────────────┘

Pros: Simple, no application changes
Cons: Expensive, limited ceiling
```

**Read Replicas:**

```
         ┌──────────────┐
    ┌───▶│ Read Replica │
    │    └──────────────┘
    │
┌───┴──────┐    ┌──────────────┐
│ Primary  │───▶│ Read Replica │
│ (Writes) │    └──────────────┘
└──────────┘
    │
    │    ┌──────────────┐
    └───▶│ Read Replica │
         └──────────────┘

Pros: Handle read-heavy workloads
Cons: Replication lag, write bottleneck
```

**Sharding (Horizontal Partitioning):**

```
User Hash: user_id % num_shards

Shard 0:           Shard 1:           Shard 2:
users 0-999        users 1000-1999    users 2000-2999
┌──────────┐       ┌──────────┐       ┌──────────┐
│ User DB  │       │ User DB  │       │ User DB  │
│ Shard 0  │       │ Shard 1  │       │ Shard 2  │
└──────────┘       └──────────┘       └──────────┘

Pros: Horizontal scaling, isolated failures
Cons: Complex queries, rebalancing, hotspots
```

**Strategies:**

- **Range-based**: Users A-M, N-Z
- **Hash-based**: Hash(user_id) % shards
- **Geographic**: US-East, US-West, EU
- **Feature-based**: Free users vs Premium users

### 2. Caching Strategies

**Cache-Aside (Lazy Loading):**

```python
def get_user(user_id):
    # Try cache first
    user = cache.get(f"user:{user_id}")
    if user:
        return user

    # Cache miss: fetch from DB
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # Populate cache
    cache.set(f"user:{user_id}", user, ttl=3600)
    return user
```

**Write-Through:**

```python
def update_user(user_id, data):
    # Update DB
    db.execute("UPDATE users SET ... WHERE id = ?", user_id, data)

    # Update cache
    cache.set(f"user:{user_id}", data, ttl=3600)
```

**Write-Behind (Write-Back):**

```python
def update_user(user_id, data):
    # Update cache immediately
    cache.set(f"user:{user_id}", data, ttl=3600)

    # Async write to DB
    queue.publish("user.update", {"user_id": user_id, "data": data})
```

**Cache Invalidation:**

```python
# TTL-based
cache.set(key, value, ttl=300)  # Expire after 5 minutes

# Event-based
def on_user_update(user_id):
    cache.delete(f"user:{user_id}")
    cache.delete(f"user:{user_id}:posts")
    cache.delete(f"feed:{user_id}")

# Version-based
cache.set(f"user:{user_id}:v{version}", value)
```

### 3. Load Balancing

**Algorithms:**

- **Round Robin**: Distribute evenly across servers
- **Least Connections**: Route to server with fewest active connections
- **IP Hash**: Sticky sessions based on client IP
- **Weighted**: Route based on server capacity

**Layers:**

```
Layer 4 (Transport):
- TCP/UDP level
- Fast, simple
- No content inspection

Layer 7 (Application):
- HTTP level
- Path/header routing
- SSL termination
- Request rewriting
```

## Data Storage Patterns

### 1. Database Selection

| Type              | Use Case                  | Examples            | Strengths                     | Weaknesses                     |
| ----------------- | ------------------------- | ------------------- | ----------------------------- | ------------------------------ |
| **Relational**    | Structured data, ACID     | PostgreSQL, MySQL   | ACID, SQL, Relations          | Scaling writes, Schema changes |
| **Document**      | Semi-structured, flexible | MongoDB, Couchbase  | Flexible schema, Easy scaling | No joins, Consistency          |
| **Key-Value**     | Simple lookups, caching   | Redis, DynamoDB     | Fast, Scalable                | Limited queries                |
| **Column-Family** | Time-series, analytics    | Cassandra, HBase    | Write-heavy, Scalable         | Complex queries                |
| **Graph**         | Relationships, networks   | Neo4j, Neptune      | Complex relationships         | Not general purpose            |
| **Search**        | Full-text search          | Elasticsearch, Solr | Fast search, Analytics        | Not source of truth            |

### 2. Data Partitioning

**Consistent Hashing:**

```
Benefits:
- Minimal data movement when adding/removing nodes
- Even distribution with virtual nodes

Implementation:
┌─────────────────────────────────┐
│     Hash Ring (0 to 2^32-1)     │
│                                 │
│  Node A ●                       │
│         │\                      │
│         │ \  VNodes: A1, A2, A3│
│         │  \                    │
│  Node B ●   ●                   │
│             /                   │
│            /  VNodes: B1, B2, B3│
│           /                     │
│  Node C ●                       │
└─────────────────────────────────┘
```

### 3. Data Replication

**Strategies:**

- **Single-leader**: One primary, N replicas (simple, replication lag)
- **Multi-leader**: Multiple primaries (complex, write conflicts)
- **Leaderless**: All nodes equal (high availability, eventual consistency)

**Consistency Levels:**

```
Strong Consistency (Linearizability):
- Read reflects latest write
- Higher latency
- Lower availability

Eventual Consistency:
- Reads may be stale
- Lower latency
- Higher availability

Quorum Reads/Writes:
W + R > N (W: write replicas, R: read replicas, N: total)
```

## Performance Optimization

### 1. Identify Bottlenecks

```python
# CPU-bound
- Heavy computation
- Complex algorithms
→ Solution: Optimize code, cache results, use faster algorithms

# I/O-bound
- Database queries
- Network calls
→ Solution: Connection pooling, async I/O, caching

# Memory-bound
- Large in-memory datasets
- Memory leaks
→ Solution: Pagination, streaming, garbage collection tuning

# Network-bound
- High latency
- Bandwidth limits
→ Solution: CDN, compression, reduce payload size
```

### 2. Optimization Techniques

**Database Optimization:**

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at);

-- Use EXPLAIN to analyze query plans
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE author_id = 123
ORDER BY created_at DESC
LIMIT 10;

-- Denormalize for read performance
CREATE TABLE user_post_stats AS
SELECT
    user_id,
    COUNT(*) as post_count,
    MAX(created_at) as last_post_at
FROM posts
GROUP BY user_id;

-- Partition large tables
CREATE TABLE events (
    id BIGINT,
    event_type VARCHAR(50),
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at) (
    PARTITION p2024_01 VALUES LESS THAN ('2024-02-01'),
    PARTITION p2024_02 VALUES LESS THAN ('2024-03-01'),
    ...
);
```

**Application-Level Optimization:**

```python
# Batch API calls
async def get_user_posts_with_details(user_ids):
    # Bad: N+1 query problem
    # for user_id in user_ids:
    #     posts = await get_posts(user_id)
    #     for post in posts:
    #         author = await get_user(post.author_id)

    # Good: Batch queries
    posts = await get_posts_batch(user_ids)
    author_ids = {post.author_id for post in posts}
    authors = await get_users_batch(author_ids)

    # Combine results
    author_map = {a.id: a for a in authors}
    return [{**post, 'author': author_map[post.author_id]}
            for post in posts]

# Use async/await for I/O
async def fetch_user_data(user_id):
    profile, posts, followers = await asyncio.gather(
        get_profile(user_id),
        get_posts(user_id),
        get_followers(user_id)
    )
    return {
        'profile': profile,
        'posts': posts,
        'followers': followers
    }
```

## Reliability Patterns

### 1. Circuit Breaker

```python
from enum import Enum
import time

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e

    def on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Usage
payment_circuit = CircuitBreaker(failure_threshold=5, timeout=60)

def process_payment(amount):
    return payment_circuit.call(external_payment_api.charge, amount)
```

### 2. Retry with Backoff

```python
import time
import random

def exponential_backoff_retry(func, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise

            # Exponential backoff with jitter
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            time.sleep(delay)
            print(f"Retry {attempt + 1}/{max_retries} after {delay:.2f}s")

# Usage
result = exponential_backoff_retry(
    lambda: requests.get("https://api.example.com/data"),
    max_retries=3,
    base_delay=1
)
```

### 3. Rate Limiting

```python
from collections import deque
import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self):
        self._refill()

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        new_tokens = elapsed * self.refill_rate

        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_refill = now

# Usage: 100 requests per second, burst of 120
rate_limiter = TokenBucket(capacity=120, refill_rate=100)

def handle_request():
    if not rate_limiter.allow_request():
        return {"error": "Rate limit exceeded"}, 429

    # Process request
    return {"success": True}, 200
```

## Trade-Off Analysis

### CAP Theorem

```
Consistency: All nodes see the same data
Availability: Every request gets a response
Partition Tolerance: System works despite network failures

Pick 2:
├─ CA: Consistent + Available (no partition tolerance)
│  Example: Traditional RDBMS in single datacenter
│
├─ CP: Consistent + Partition Tolerant (sacrifice availability)
│  Example: MongoDB, HBase, Redis Cluster
│  Use case: Financial transactions, inventory
│
└─ AP: Available + Partition Tolerant (eventual consistency)
   Example: Cassandra, DynamoDB, CouchDB
   Use case: Social media feeds, analytics
```

### Common Trade-Offs

| Aspect          | Option A                | Option B                     |
| --------------- | ----------------------- | ---------------------------- |
| **Consistency** | Strong (Linearizable)   | Eventual                     |
| **Latency**     | P99 < 10ms              | P99 < 100ms                  |
| **Cost**        | Premium instances       | Standard instances           |
| **Complexity**  | Monolith                | Microservices                |
| **Flexibility** | NoSQL schema-less       | SQL structured               |
| **Durability**  | Sync replication (slow) | Async (fast, potential loss) |

## Anti-Patterns

### ❌ Distributed Monolith

```
Problem: Microservices with tight coupling
- Shared database
- Synchronous calls between services
- Can't deploy independently

Solution:
- Define clear boundaries
- Async communication via events
- Database per service
```

### ❌ God Service

```
Problem: Service does too much
- User service: auth + profile + posts + comments + ...

Solution:
- Split by bounded context
- Single responsibility per service
```

### ❌ N+1 Query Problem

```python
# Bad
users = db.query("SELECT * FROM users")
for user in users:
    posts = db.query("SELECT * FROM posts WHERE author_id = ?", user.id)

# Good
users = db.query("SELECT * FROM users")
posts = db.query("SELECT * FROM posts WHERE author_id IN (?)", [u.id for u in users])
posts_by_user = group_by(posts, lambda p: p.author_id)
```

## Best Practices

### 1. Design for Failure

```
- Assume components will fail
- Implement timeouts for all external calls
- Use circuit breakers
- Retry with exponential backoff
- Graceful degradation
```

### 2. Monitor Everything

```
Metrics to track:
- Request rate, latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Resource utilization (CPU, memory, disk, network)
- Queue depths
- Database connection pool usage
- Cache hit rate

Alerting:
- SLO violations
- Error rate spikes
- Resource exhaustion
```

### 3. Design for Evolution

```
- Version APIs
- Feature flags for gradual rollout
- Database migration strategy
- Backward compatibility
- Graceful deprecation
```

## Quick Reference

### System Design Checklist

```markdown
□ Clarify requirements (functional + non-functional)
□ Estimate capacity (QPS, storage, bandwidth)
□ Define APIs and data models
□ High-level architecture diagram
□ Deep dive on critical components
□ Identify bottlenecks and optimize
□ Discuss scalability and reliability
□ Consider trade-offs and alternatives
□ Security and compliance considerations
```

### Back-of-Envelope Calculations

```
1 byte = 8 bits
1 KB = 1,000 bytes
1 MB = 1,000 KB = 1,000,000 bytes
1 GB = 1,000 MB = 1 billion bytes

Latencies:
- L1 cache: 0.5 ns
- L2 cache: 7 ns
- RAM: 100 ns
- SSD: 150 μs
- HDD: 10 ms
- Network (same datacenter): 0.5 ms
- Network (cross-region): 50-100 ms

QPS calculations:
- 1 million requests/day ≈ 12 requests/sec
- 100 million requests/day ≈ 1,160 requests/sec
```

## Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Designing Data-Intensive Applications](https://dataintensive.net/)
- [High Scalability Blog](http://highscalability.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Google SRE Book](https://sre.google/books/)

---

_Great system design balances simplicity with scalability, making pragmatic trade-offs based on requirements and constraints._
