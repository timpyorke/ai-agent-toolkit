# Examples

## Kafka (Producer/Consumer)
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

## Reliability Patterns

### Idempotent Consumer
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

## Schema Example
```json
{
  "eventId": "uuid",
  "eventType": "OrderPlaced",
  "occurredAt": "2025-01-01T10:00:00Z",
  "correlationId": "uuid-of-request",
  "data": { "orderId": "123", "items": [ ... ] }
}
```
