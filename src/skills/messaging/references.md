# Reference Material

## Messaging Models
- **Queue (Point-to-Point)**: One consumer processes each message. Good for work distribution.
- **Pub/Sub (Topics)**: Many subscribers receive copies. Good for event notifications.
- **Streams (Log)**: Append-only with consumer offsets. Good for event sourcing and replay.

## Delivery Semantics
1. **At-most-once**: Fire and forget. No duplicates, but may lose messages.
2. **At-least-once**: Retries ensure delivery. No data loss, but duplicates possible (requires idempotency).
3. **Exactly-once**: Hard to achieve distributedly. Usually means "Transactional Outbox + Idempotent Consumer".

## Best Practices
- **Idempotency**: Consumers must handle duplicate messages gracefully.
- **Ordering**: Partition by key (e.g., `orderId`) to preserve order where it matters.
- **Poison Pills**: Use Dead Letter Queues (DLQ) for unprocessable messages to prevent blocking.
- **Schema Evolution**: Design for backward compatibility (additive changes).

## Broker Choices
| Broker | Type | Use Case |
|--------|------|----------|
| **Kafka** | Stream | High throughput, log retention, replay |
| **RabbitMQ** | Queue | Complex routing, priorities, flexible patterns |
| **AWS SQS** | Queue | Simple, fully managed, serverless |
| **AWS SNS** | Pub/Sub | Fan-out notifications to SQS/HTTP/Email |

## Anti-Patterns
- **Database as Queue**: Polling SQL tables for jobs (use Outbox instead).
- **Fat Events**: Sending full state in events (consider "Claim Check" pattern for large payloads).
- **Assumed Global Order**: Distributed systems generally only guarantee order per partition.
