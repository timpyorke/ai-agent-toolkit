# Examples

## Event Types

### Domain Events
```typescript
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
```

### Integration Events
```typescript
class CustomerCreatedIntegrationEvent {
  constructor(
    public eventId: string,
    public customerId: string,
    public email: string,
    public name: string,
    public createdAt: Date,
  ) {}

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

## Pub/Sub Implementation

### Kafka Producer
```typescript
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
```

### Kafka Consumer
```typescript
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
}
```

## Event Sourcing

### Aggregate
```typescript
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
  deposit(amount: number): void {
    const newBalance = this.balance + amount;
    const event = new MoneyDepositedEvent(this.accountId, amount, newBalance);
    this.apply(event, true);
  }

  // Apply event to state
  private apply(event: any, isNew: boolean): void {
    if (event instanceof MoneyDepositedEvent) {
      this.balance = event.balance;
    }
    // ...
    if (isNew) this.uncommittedEvents.push(event);
  }
}
```

## CQRS

### Command Side
```typescript
class CreateOrderHandler {
  constructor(
    private orderRepository: EventSourcedRepository<Order>,
    private eventBus: EventBus,
  ) {}

  async handle(command: CreateOrderCommand): Promise<string> {
    const order = new Order();
    order.create(command.customerId, command.items);
    await this.orderRepository.save(order);
    return order.getId();
  }
}
```

### Query Side
```typescript
class OrderProjectionHandler {
  constructor(private db: Database) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.db.insert("order_projections", {
      order_id: event.orderId,
      status: "PENDING",
      total_amount: event.totalAmount,
      // ...
    });
  }
}
```

## Message Brokers

### AWS SNS + SQS
```typescript
// Publish
await snsClient.send(
  new PublishCommand({
    TopicArn: "arn:aws:sns:us-east-1:123456789:order-events",
    Message: JSON.stringify(event),
  }),
);

// Consume (SQS)
const response = await sqsClient.send(
  new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  }),
);
```

### RabbitMQ
```typescript
// Publish
channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(event)));

// Consume
await channel.consume(queue, async (message) => {
  const event = JSON.parse(message.content.toString());
  await handleEvent(event);
  channel.ack(message);
});
```
