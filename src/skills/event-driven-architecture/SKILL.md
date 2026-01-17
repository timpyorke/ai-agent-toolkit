---
name: Event-Driven Architecture
description: Design scalable, loosely-coupled systems using events, message brokers, and asynchronous communication patterns
---

# Event-Driven Architecture Skill

Master building reactive, scalable systems through events, enabling loose coupling, independent scaling, and complex business workflows across distributed services.

## Core Principles

### 1. Events as First-Class Citizens

- **Event**: Notification of something that happened
- **Immutable**: Events never change once created
- **Time-ordered**: Events have a timestamp
- **Complete**: Contains all relevant data

### 2. Asynchronous Communication

- **Decouple producers and consumers**: Services don't wait for responses
- **Temporal decoupling**: Systems can be offline and catch up later
- **Scalability**: Process events at different rates
- **Resilience**: Buffer for traffic spikes

### 3. Event Sourcing vs Event Notification

- **Event Notification**: Notify others something happened
- **Event-Carried State Transfer**: Event contains state snapshot
- **Event Sourcing**: Store all state changes as events
- **CQRS**: Separate read and write models

## Event Types

### 1. Domain Events

```typescript
// Capture business-significant occurrences
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: Date;
  version: number;
}

class OrderPlacedEvent implements DomainEvent {
  eventId: string;
  eventType = "OrderPlaced";
  aggregateId: string;
  aggregateType = "Order";
  occurredAt: Date;
  version: number;

  constructor(
    public orderId: string,
    public customerId: string,
    public items: OrderItem[],
    public totalAmount: Money,
    version: number,
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = orderId;
    this.occurredAt = new Date();
    this.version = version;
  }
}

class PaymentProcessedEvent implements DomainEvent {
  eventId: string;
  eventType = "PaymentProcessed";
  aggregateId: string;
  aggregateType = "Payment";
  occurredAt: Date;
  version: number;

  constructor(
    public paymentId: string,
    public orderId: string,
    public amount: Money,
    public paymentMethod: string,
    public transactionId: string,
    version: number,
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = paymentId;
    this.occurredAt = new Date();
    this.version = version;
  }
}
```

### 2. Integration Events

```typescript
// For inter-service communication
class CustomerCreatedIntegrationEvent {
  constructor(
    public eventId: string,
    public customerId: string,
    public email: string,
    public name: string,
    public createdAt: Date,
  ) {}

  // Serialize for messaging
  toJSON() {
    return {
      eventId: this.eventId,
      eventType: "CustomerCreated",
      data: {
        customerId: this.customerId,
        email: this.email,
        name: this.name,
      },
      occurredAt: this.createdAt.toISOString(),
    };
  }
}
```

### 3. Command Events

```typescript
// Trigger actions in other services
class SendWelcomeEmailCommand {
  constructor(
    public customerId: string,
    public email: string,
    public name: string,
  ) {}
}

class ProcessRefundCommand {
  constructor(
    public orderId: string,
    public amount: Money,
    public reason: string,
  ) {}
}
```

## Event Patterns

### 1. Pub/Sub (Publish-Subscribe)

```
┌──────────────┐        ┌────────────────┐
│   Publisher  │───────▶│  Event Broker  │
│  (Producer)  │        │  (Topic/Queue) │
└──────────────┘        └────────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌───────────┐ ┌───────────┐ ┌───────────┐
              │Subscriber │ │Subscriber │ │Subscriber │
              │     1     │ │     2     │ │     N     │
              └───────────┘ └───────────┘ └───────────┘

Characteristics:
- One-to-many communication
- Publishers don't know subscribers
- Subscribers can join/leave dynamically
- Each subscriber gets a copy
```

**Implementation with Kafka:**

```typescript
// Producer
class OrderEventProducer {
  constructor(private kafka: Kafka) {}

  async publishOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    const producer = this.kafka.producer();
    await producer.connect();

    await producer.send({
      topic: "order-events",
      messages: [
        {
          key: event.orderId, // Partition key
          value: JSON.stringify(event),
          headers: {
            "event-type": event.eventType,
            "event-id": event.eventId,
          },
        },
      ],
    });

    await producer.disconnect();
  }
}

// Consumer
class InventoryService {
  constructor(private kafka: Kafka) {}

  async start(): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: "inventory-service" });
    await consumer.connect();
    await consumer.subscribe({ topic: "order-events" });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());

        if (event.eventType === "OrderPlaced") {
          await this.handleOrderPlaced(event);
        }
      },
    });
  }

  private async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Reserve inventory
    for (const item of event.items) {
      await this.inventoryRepository.reserveStock(
        item.productId,
        item.quantity,
      );
    }
  }
}
```

### 2. Event Sourcing

```
Traditional State Storage:
┌─────────────────┐
│ Current State   │
│ balance: $500   │
└─────────────────┘
(Lost history of how we got here)

Event Sourcing:
┌────────────────────────────────────────┐
│ Event Store (Append-only log)         │
├────────────────────────────────────────┤
│ 1. AccountOpened     { balance: 0 }    │
│ 2. MoneyDeposited    { amount: 1000 }  │
│ 3. MoneyWithdrawn    { amount: 200 }   │
│ 4. MoneyWithdrawn    { amount: 300 }   │
└────────────────────────────────────────┘
   ↓ Replay events
┌─────────────────┐
│ Current State   │
│ balance: $500   │
└─────────────────┘
```

**Implementation:**

```typescript
// Events
class AccountOpenedEvent {
  constructor(
    public accountId: string,
    public ownerId: string,
    public initialBalance: number,
  ) {}
}

class MoneyDepositedEvent {
  constructor(
    public accountId: string,
    public amount: number,
    public balance: number,
  ) {}
}

class MoneyWithdrawnEvent {
  constructor(
    public accountId: string,
    public amount: number,
    public balance: number,
  ) {}
}

// Aggregate with Event Sourcing
class Account {
  private accountId: string;
  private balance: number = 0;
  private version: number = 0;
  private uncommittedEvents: any[] = [];

  // Reconstruct from events
  static fromEvents(events: any[]): Account {
    const account = new Account();

    for (const event of events) {
      account.apply(event, false);
    }

    return account;
  }

  // Handle commands
  openAccount(accountId: string, ownerId: string): void {
    const event = new AccountOpenedEvent(accountId, ownerId, 0);
    this.apply(event, true);
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const newBalance = this.balance + amount;
    const event = new MoneyDepositedEvent(this.accountId, amount, newBalance);
    this.apply(event, true);
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    if (this.balance < amount) {
      throw new Error("Insufficient funds");
    }

    const newBalance = this.balance - amount;
    const event = new MoneyWithdrawnEvent(this.accountId, amount, newBalance);
    this.apply(event, true);
  }

  // Apply event to state
  private apply(event: any, isNew: boolean): void {
    if (event instanceof AccountOpenedEvent) {
      this.accountId = event.accountId;
      this.balance = event.initialBalance;
    } else if (event instanceof MoneyDepositedEvent) {
      this.balance = event.balance;
    } else if (event instanceof MoneyWithdrawnEvent) {
      this.balance = event.balance;
    }

    this.version++;

    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }

  getUncommittedEvents(): any[] {
    return this.uncommittedEvents;
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }
}

// Event Store
interface EventStore {
  saveEvents(
    aggregateId: string,
    events: any[],
    expectedVersion: number,
  ): Promise<void>;
  getEvents(aggregateId: string): Promise<any[]>;
}

class PostgresEventStore implements EventStore {
  constructor(private db: Database) {}

  async saveEvents(
    aggregateId: string,
    events: any[],
    expectedVersion: number,
  ): Promise<void> {
    // Optimistic concurrency check
    const currentVersion = await this.getVersion(aggregateId);

    if (currentVersion !== expectedVersion) {
      throw new Error("Concurrency conflict");
    }

    // Store events atomically
    await this.db.transaction(async (tx) => {
      for (const event of events) {
        await tx.insert("events", {
          aggregate_id: aggregateId,
          event_type: event.constructor.name,
          event_data: JSON.stringify(event),
          version: ++expectedVersion,
          occurred_at: new Date(),
        });
      }
    });
  }

  async getEvents(aggregateId: string): Promise<any[]> {
    const rows = await this.db.query(
      "SELECT * FROM events WHERE aggregate_id = $1 ORDER BY version",
      [aggregateId],
    );

    return rows.map((row) => this.deserialize(row));
  }

  private deserialize(row: any): any {
    const eventData = JSON.parse(row.event_data);
    // Reconstruct event object based on event_type
    // ... implementation details
    return eventData;
  }
}
```

### 3. CQRS (Command Query Responsibility Segregation)

```
┌─────────────────────────────────────────────────────────┐
│                      Command Side                       │
│  (Write Model - Optimized for writes)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Command ──▶ Handler ──▶ Aggregate ──▶ Event Store     │
│                              │                          │
│                              │ Events                   │
│                              ▼                          │
│                        Event Bus                        │
└──────────────────────────────┬──────────────────────────┘
                               │ Events
                               ▼
┌─────────────────────────────────────────────────────────┐
│                       Query Side                        │
│  (Read Model - Optimized for queries)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Event Handler ──▶ Update Projections ──▶ Read DB      │
│                    (Denormalized views)                 │
│                                                         │
│  Query ──▶ Read DB ──▶ Response                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// Command Side
class CreateOrderCommand {
  constructor(
    public customerId: string,
    public items: { productId: string; quantity: number }[],
  ) {}
}

class CreateOrderHandler {
  constructor(
    private orderRepository: EventSourcedRepository<Order>,
    private eventBus: EventBus,
  ) {}

  async handle(command: CreateOrderCommand): Promise<string> {
    // Create aggregate
    const order = new Order();
    order.create(crypto.randomUUID(), command.customerId, command.items);

    // Save events
    await this.orderRepository.save(order);

    // Publish events
    const events = order.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return order.getId();
  }
}

// Query Side - Projections
class OrderProjection {
  constructor(
    public orderId: string,
    public customerId: string,
    public customerName: string,
    public status: string,
    public totalAmount: number,
    public itemCount: number,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

class OrderProjectionHandler {
  constructor(private db: Database) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // Get customer name from customer service or cache
    const customer = await this.customerService.getCustomer(event.customerId);

    // Create denormalized read model
    await this.db.insert("order_projections", {
      order_id: event.orderId,
      customer_id: event.customerId,
      customer_name: customer.name,
      status: "PENDING",
      total_amount: event.totalAmount,
      item_count: event.items.length,
      created_at: event.occurredAt,
      updated_at: event.occurredAt,
    });
  }

  async handleOrderShipped(event: OrderShippedEvent): Promise<void> {
    await this.db.update(
      "order_projections",
      { order_id: event.orderId },
      {
        status: "SHIPPED",
        updated_at: event.occurredAt,
      },
    );
  }
}

// Query Service
class OrderQueryService {
  constructor(private db: Database) {}

  async getOrderById(orderId: string): Promise<OrderProjection | null> {
    const row = await this.db.queryOne(
      "SELECT * FROM order_projections WHERE order_id = $1",
      [orderId],
    );

    return row ? this.mapToProjection(row) : null;
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderProjection[]> {
    const rows = await this.db.query(
      "SELECT * FROM order_projections WHERE customer_id = $1 ORDER BY created_at DESC",
      [customerId],
    );

    return rows.map((row) => this.mapToProjection(row));
  }
}
```

## Message Brokers

### 1. Apache Kafka

**Use Cases:**

- High-throughput event streaming
- Event sourcing
- Log aggregation
- Real-time analytics

```typescript
// Kafka Setup
import { Kafka, Producer, Consumer } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["kafka1:9092", "kafka2:9092", "kafka3:9092"],
});

// Producer with retries
const producer = kafka.producer({
  idempotent: true, // Exactly-once semantics
  maxInFlightRequests: 5,
  retry: {
    maxRetryTime: 30000,
    initialRetryTime: 300,
    retries: 10,
  },
});

await producer.connect();

// Produce with partition key
await producer.send({
  topic: "orders",
  messages: [
    {
      key: orderId, // Same key → same partition → ordering guaranteed
      value: JSON.stringify(event),
      headers: {
        "correlation-id": correlationId,
      },
    },
  ],
});

// Consumer with consumer group
const consumer = kafka.consumer({
  groupId: "inventory-service",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

await consumer.connect();
await consumer.subscribe({
  topic: "orders",
  fromBeginning: false,
});

await consumer.run({
  eachMessage: async ({ topic, partition, message, heartbeat }) => {
    try {
      const event = JSON.parse(message.value.toString());
      await handleEvent(event);

      // Manual commit for at-least-once semantics
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    } catch (error) {
      // Handle error, maybe send to DLQ
      console.error("Failed to process message", error);
    }
  },
});
```

### 2. RabbitMQ

**Use Cases:**

- Task queues
- Complex routing
- Request/reply patterns
- Priority queues

```typescript
import amqp from "amqplib";

// Publisher
async function publishEvent(event: OrderPlacedEvent): Promise<void> {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "order-events";
  const routingKey = "order.placed";

  await channel.assertExchange(exchange, "topic", { durable: true });

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(event)), {
    persistent: true,
    contentType: "application/json",
    messageId: event.eventId,
    timestamp: event.occurredAt.getTime(),
  });

  await channel.close();
  await connection.close();
}

// Subscriber
async function subscribeToOrders(): Promise<void> {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "order-events";
  const queue = "inventory-service-orders";
  const routingPattern = "order.*"; // order.placed, order.cancelled, etc.

  await channel.assertExchange(exchange, "topic", { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingPattern);

  // Prefetch: limit unacked messages
  await channel.prefetch(10);

  await channel.consume(queue, async (message) => {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString());
      await handleEvent(event);

      // Acknowledge
      channel.ack(message);
    } catch (error) {
      // Reject and requeue (or send to DLQ)
      channel.nack(message, false, false);
    }
  });
}
```

### 3. AWS SNS + SQS

```typescript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

// Publish to SNS topic
const snsClient = new SNSClient({ region: "us-east-1" });

async function publishEvent(event: OrderPlacedEvent): Promise<void> {
  await snsClient.send(
    new PublishCommand({
      TopicArn: "arn:aws:sns:us-east-1:123456789:order-events",
      Message: JSON.stringify(event),
      MessageAttributes: {
        "event-type": {
          DataType: "String",
          StringValue: "OrderPlaced",
        },
      },
    }),
  );
}

// Consume from SQS queue (subscribed to SNS)
const sqsClient = new SQSClient({ region: "us-east-1" });

async function pollMessages(): Promise<void> {
  while (true) {
    const response = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl:
          "https://sqs.us-east-1.amazonaws.com/123456789/inventory-queue",
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling
        VisibilityTimeout: 30,
      }),
    );

    if (!response.Messages) continue;

    for (const message of response.Messages) {
      try {
        const event = JSON.parse(message.Body);
        await handleEvent(event);

        // Delete message
        await sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl:
              "https://sqs.us-east-1.amazonaws.com/123456789/inventory-queue",
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
      } catch (error) {
        // Message will become visible again after VisibilityTimeout
        console.error("Failed to process message", error);
      }
    }
  }
}
```

## Saga Pattern

Manage distributed transactions across services.

### Choreography-Based Saga

```
Order Service     Payment Service    Inventory Service   Shipping Service
     │                  │                   │                   │
     │ OrderPlaced      │                   │                   │
     ├─────────────────▶│                   │                   │
     │                  │ PaymentProcessed  │                   │
     │                  ├──────────────────▶│                   │
     │                  │                   │ InventoryReserved │
     │                  │                   ├──────────────────▶│
     │                  │                   │                   │ ShipmentCreated
     │◀─────────────────┴───────────────────┴───────────────────┤
     │                                                           │
```

```typescript
// Each service reacts to events

// Order Service
class OrderService {
  async createOrder(command: CreateOrderCommand): Promise<void> {
    const order = new Order(command);
    await this.orderRepository.save(order);

    // Publish event
    await this.eventBus.publish(
      new OrderPlacedEvent(order.id, order.customerId, order.totalAmount),
    );
  }

  // Listen for completion
  async handleShipmentCreated(event: ShipmentCreatedEvent): Promise<void> {
    const order = await this.orderRepository.findById(event.orderId);
    order.markAsShipped();
    await this.orderRepository.save(order);
  }
}

// Payment Service
class PaymentService {
  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    try {
      const payment = await this.processPayment(
        event.customerId,
        event.totalAmount,
      );

      await this.eventBus.publish(
        new PaymentProcessedEvent(payment.id, event.orderId, event.totalAmount),
      );
    } catch (error) {
      // Publish failure event
      await this.eventBus.publish(
        new PaymentFailedEvent(event.orderId, error.message),
      );
    }
  }
}

// Inventory Service
class InventoryService {
  async handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    try {
      await this.reserveInventory(event.orderId);

      await this.eventBus.publish(new InventoryReservedEvent(event.orderId));
    } catch (error) {
      // Trigger compensation
      await this.eventBus.publish(
        new InventoryReservationFailedEvent(event.orderId, error.message),
      );
    }
  }

  // Compensating transaction
  async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    // No action needed, payment never succeeded
  }
}
```

### Orchestration-Based Saga

```
              Saga Orchestrator
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  Order Service  Payment     Inventory
                 Service      Service
```

```typescript
// Saga Orchestrator
class OrderSagaOrchestrator {
  async executeOrderSaga(command: CreateOrderCommand): Promise<void> {
    const sagaId = crypto.randomUUID();
    const saga = new OrderSaga(sagaId, command);

    try {
      // Step 1: Create order
      const order = await this.orderService.createOrder(command);
      saga.orderCreated(order.id);

      // Step 2: Process payment
      const payment = await this.paymentService.processPayment(
        order.customerId,
        order.totalAmount,
      );
      saga.paymentProcessed(payment.id);

      // Step 3: Reserve inventory
      await this.inventoryService.reserveInventory(order.items);
      saga.inventoryReserved();

      // Step 4: Create shipment
      await this.shippingService.createShipment(
        order.id,
        order.shippingAddress,
      );
      saga.shipmentCreated();

      // Success!
      saga.complete();
    } catch (error) {
      // Compensate in reverse order
      await this.compensate(saga, error);
    }
  }

  private async compensate(saga: OrderSaga, error: Error): Promise<void> {
    if (saga.inventoryReserved) {
      await this.inventoryService.releaseInventory(saga.orderId);
    }

    if (saga.paymentProcessed) {
      await this.paymentService.refundPayment(saga.paymentId);
    }

    if (saga.orderCreated) {
      await this.orderService.cancelOrder(saga.orderId);
    }

    saga.fail(error);
  }
}
```

## Best Practices

### 1. Event Schema Versioning

```typescript
interface EventV1 {
  version: 1;
  orderId: string;
  customerId: string;
  amount: number;
}

interface EventV2 {
  version: 2;
  orderId: string;
  customerId: string;
  amount: {
    value: number;
    currency: string;
  };
  items: Array<{ productId: string; quantity: number }>;
}

class EventHandler {
  handle(event: EventV1 | EventV2): void {
    // Upcast old events to new format
    const v2Event = event.version === 1 ? this.upcastToV2(event) : event;

    this.processEvent(v2Event);
  }

  private upcastToV2(v1Event: EventV1): EventV2 {
    return {
      version: 2,
      orderId: v1Event.orderId,
      customerId: v1Event.customerId,
      amount: {
        value: v1Event.amount,
        currency: "USD", // Default
      },
      items: [], // Not available in V1
    };
  }
}
```

### 2. Idempotency

```typescript
class EventHandler {
  private processedEvents: Set<string> = new Set();

  async handle(event: DomainEvent): Promise<void> {
    // Check if already processed
    if (await this.isProcessed(event.eventId)) {
      console.log(`Event ${event.eventId} already processed, skipping`);
      return;
    }

    try {
      await this.processEvent(event);
      await this.markAsProcessed(event.eventId);
    } catch (error) {
      // Log and potentially retry
      console.error(`Failed to process event ${event.eventId}`, error);
      throw error;
    }
  }

  private async isProcessed(eventId: string): Promise<boolean> {
    const exists = await this.db.queryOne(
      "SELECT 1 FROM processed_events WHERE event_id = $1",
      [eventId],
    );
    return !!exists;
  }

  private async markAsProcessed(eventId: string): Promise<void> {
    await this.db.insert("processed_events", {
      event_id: eventId,
      processed_at: new Date(),
    });
  }
}
```

### 3. Dead Letter Queue

```typescript
class ResilientEventHandler {
  constructor(
    private maxRetries: number = 3,
    private dlqPublisher: DLQPublisher,
  ) {}

  async handle(event: DomainEvent, retryCount: number = 0): Promise<void> {
    try {
      await this.processEvent(event);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await this.scheduleRetry(event, retryCount + 1, delay);
      } else {
        // Send to DLQ for manual investigation
        await this.dlqPublisher.publish({
          event,
          error: error.message,
          retryCount,
          failedAt: new Date(),
        });
      }
    }
  }
}
```

## Anti-Patterns

### ❌ Event Chain Explosion

```
Problem: Event triggers event triggers event...

OrderPlaced → PaymentRequested → PaymentProcessed →
InventoryReserved → ShipmentRequested → ShipmentCreated →
NotificationSent → ...

Solution: Use saga orchestration or limit chain depth
```

### ❌ Large Event Payloads

```typescript
// Bad: Include everything
class OrderPlacedEvent {
  order: Order; // Full object
  customer: Customer; // Full object
  products: Product[]; // All product details
  relatedOrders: Order[]; // Historical data
}

// Good: Include just what's needed
class OrderPlacedEvent {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}
```

### ❌ Missing Correlation IDs

```typescript
// Bad: Can't trace requests
class OrderPlacedEvent {
  orderId: string;
}

// Good: Include correlation ID
class OrderPlacedEvent {
  orderId: string;
  correlationId: string; // Trace across services
  causationId: string; // Which event caused this
}
```

## Quick Reference

### When to Use Event-Driven Architecture

**Good For:**

- Microservices integration
- Real-time data processing
- Audit trails and compliance
- Complex workflows (sagas)
- High scalability requirements

**Not Ideal For:**

- Simple CRUD applications
- Strong consistency required
- Debugging complexity unacceptable
- Team lacks distributed systems experience

### Event Store Schema

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  UNIQUE(aggregate_id, version)
);

CREATE INDEX idx_events_aggregate ON events(aggregate_id, version);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred ON events(occurred_at);
```

## Resources

- [Event Sourcing (Martin Fowler)](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Kafka: The Definitive Guide](https://www.confluent.io/resources/kafka-the-definitive-guide/)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [AWS Event-Driven Architecture](https://aws.amazon.com/event-driven-architecture/)
- [CQRS Journey](<https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10)>)

---

_Event-driven architecture enables scalable, resilient systems by embracing asynchrony and eventual consistency while maintaining loose coupling between components._
