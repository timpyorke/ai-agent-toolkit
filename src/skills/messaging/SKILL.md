---
name: Messaging & Queues
description: Enable asynchronous processing and service communication with queues, topics, retries, and reliability patterns
---

# Messaging Skill

Design robust async communication with clear delivery semantics, idempotent consumers, and failure handling.

## Messaging Models

- **Queue (point-to-point)**: One consumer processes each message
- **Pub/Sub (topics)**: Many subscribers receive copies of messages
- **Streams (log)**: Append-only with consumer offsets

## Delivery Semantics

- **At-most-once**: No duplicates, may lose messages
- **At-least-once**: No loss, may deliver duplicates → require idempotency
- **Exactly-once**: Hard in distributed systems; use transactional outbox + idempotent consumers

## Core Patterns

### Producer/Consumer

```ts
// Kafka (kafkajs)
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "order-svc", brokers: ["k1:9092"] });

export async function publishOrder(event: any) {
  const p = kafka.producer({ idempotent: true });
  await p.connect();
  await p.send({
    topic: "orders",
    messages: [{ key: event.orderId, value: JSON.stringify(event) }],
  });
  await p.disconnect();
}

export async function consumeOrders() {
  const c = kafka.consumer({ groupId: "inventory-svc" });
  await c.connect();
  await c.subscribe({ topic: "orders", fromBeginning: false });
  await c.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value!.toString());
      await handle(event); // idempotent
    },
  });
}
```

### Idempotent Consumers

```ts
async function handle(event: any) {
  // dedupe by eventId
  if (await db.processed.exists(event.eventId)) return;
  await processEvent(event);
  await db.processed.insert({ id: event.eventId, at: new Date() });
}
```

### Retry with Backoff & DLQ

```ts
function backoff(retry: number) {
  return Math.min(30000, 2 ** retry * 100 + Math.random() * 100);
}

async function processWithRetry(msg: Message) {
  let retries = msg.attributes.retries ?? 0;
  try {
    await handle(msg);
  } catch (e) {
    if (retries < 5) {
      await schedule(msg, backoff(retries + 1));
    } else {
      await dlq.publish({
        original: msg,
        error: e.message,
        failedAt: new Date(),
      });
    }
  }
}
```

### Transactional Outbox

Ensure message publish is atomic with DB updates.

```ts
// Within a DB transaction
await db.tx(async (tx) => {
  await tx.update("orders", { id, status: "PLACED" });
  await tx.insert("outbox", {
    id: crypto.randomUUID(),
    topic: "orders",
    payload: JSON.stringify(event),
  });
});

// Outbox relay (separate worker)
setInterval(async () => {
  const pending = await db.query(
    "SELECT * FROM outbox WHERE sent = false LIMIT 100",
  );
  for (const row of pending) {
    await broker.publish(row.topic, row.payload);
    await db.update("outbox", { id: row.id, sent: true, sentAt: new Date() });
  }
}, 500);
```

## Ordering & Partitioning

- Partition by key to preserve order per aggregate (e.g., `orderId`)
- Avoid cross-partition ordering assumptions

## Message Schema & Versioning

- Envelope with `eventType`, `eventId`, `occurredAt`, `data`
- Support upcasting older events to new schema
- Include `correlationId` and `causationId` for tracing

```json
{
  "eventId": "uuid",
  "eventType": "OrderPlaced",
  "occurredAt": "2025-01-01T10:00:00Z",
  "correlationId": "uuid-of-request",
  "data": { "orderId": "123", "items": [ ... ] }
}
```

## Request-Reply Pattern

- Use temporary reply queues or headers to correlate responses
- Set timeouts and fallbacks

## Broker Choices

- **Kafka**: High-throughput streaming, consumer groups, partitions
- **RabbitMQ**: Queues/exchanges, routing keys, priorities, dead-lettering
- **SNS/SQS**: Fanout + polling queues, simple, managed

## Observability

- Metrics: consumed/produced, lag, retries, DLQ rate
- Traces with message IDs and correlation IDs
- Alert on consumer lag and DLQ spikes

## Anti-Patterns

- Non-idempotent consumers under at-least-once semantics
- Dropping messages silently on failure
- Overloaded partitions with skewed keys (use better partition strategy)

## Quick Reference

- Use transactional outbox for consistency
- Always build idempotent consumers
- Add DLQ and bounded retries with backoff
- Preserve ordering by partition key

## Resources

- Enterprise Integration Patterns — https://www.enterpriseintegrationpatterns.com/
- Kafka Docs — https://kafka.apache.org/
- RabbitMQ Tutorials — https://www.rabbitmq.com/tutorials/
- AWS SNS/SQS — https://docs.aws.amazon.com/
