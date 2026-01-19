# Reference Material

## Core Principles

### 1. Events as First-Class Citizens
- **Event**: Notification of something that happened in the past
- **Immutable**: Events never change once created
- **Time-ordered**: Events happen in a sequence
- **Complete**: Typically contains the full state or delta required

### 2. Asynchronous Communication
- **Decoupling**: Producers and consumers don't know about each other
- **Temporal decoupling**: Systems don't need to be up at the same time
- **Scalability**: Buffering allows handling spikes in traffic
- **Resilience**: Failures in consumers don't block producers

### 3. Event Sourcing vs Event Notification
- **Event Notification**: Lightweight "ping" (something happened), receiver calls back for details.
- **Event-Carried State Transfer**: Event contains all data needed by consumer (no callback).
- **Event Sourcing**: Event log IS the source of truth for the system state.
- **CQRS**: Command Query Responsibility Segregation; split read and write models using events.

## Event Patterns

### Pub/Sub (Publish-Subscribe)
One-to-many communication where publishers send messages to topics, and all subscribers to that topic receive a copy.
- Good for: decoupling, broadcasting updates.

### Event Sourcing
Store the sequence of state-changing events rather than just the current state.
- Good for: audit trails, temporal queries, rebuilding state, complex domains.
- Challenges: snapshots, schema evolution, eventual consistency.

### CQRS
Separate the code that changes data (Commands) from the code that reads data (Queries).
- Good for: high-performance read requirements, complex domains.
- Often paired with Event Sourcing.

### Saga Pattern
Manage distributed transactions across multiple services using a sequence of local transactions and compensating events (rollbacks) if failure occurs.
- **Choreography**: Services subscribe to each other's events (decentralized).
- **Orchestration**: Central coordinator tells services what to do.

## Message Brokers

### Apache Kafka
- Log-based, persistent, high-throughput.
- Best for: Event Sourcing, data streaming, analytics, high volume.
- Semantics: At least once (standard), Exactly once (supported).

### RabbitMQ
- Queue-based, complex routing (exchanges/bindings).
- Best for: Job queues, complex routing logic, lower volume latency-sensitive tasks.
- Semantics: At least once.

### AWS SNS/SQS
- Managed simple pub/sub and queuing.
- Best for: Cloud-native apps on AWS, standard integration.

## Trade-offs
- **Complexity**: Higher operational complexity than monoliths.
- **Eventual Consistency**: Reads might be stale; UI needs to handle this.
- **Debugging**: Harder to trace flow across distributed services (need Distributed Tracing).
- **Ordering**: Strict ordering is hard at scale.
