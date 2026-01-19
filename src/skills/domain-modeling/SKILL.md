---
name: Domain Modeling
description: Design rich domain models using DDD principles with entities, value objects, aggregates, and bounded contexts
---

# 🏛️ Domain Modeling Skill

## Overview

Master Domain-Driven Design (DDD) to create expressive, maintainable models that reflect business logic and enable collaborative understanding between technical and domain experts.

## Core Principles

See [Reference Material](references.md#core-principles).

## Building Blocks

### Entities & Value Objects

See [Examples](examples.md#entities) and [Reference Material](references.md#building-blocks).

### Aggregates

See [Examples](examples.md#aggregates) and [Reference Material](references.md#aggregates).

### Domain Events

See [Examples](examples.md#domain-events) and [Reference Material](references.md#domain-events).

### Repositories

See [Examples](examples.md#repositories) and [Reference Material](references.md#repositories).

## Bounded Contexts

See [Examples](examples.md#context-mapping-acl) and [Reference Material](references.md#bounded-contexts).

## Domain Services

See [Examples](examples.md#domain-services) and [Reference Material](references.md#domain-services).

## Patterns & Practices

See [Examples](examples.md#patterns) and [Reference Material](references.md#patterns--practices).
  ) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    // Reserve inventory
    await this.inventoryService.reserveStock({
      orderId: event.orderId,
      items: event.items,
    });

    // Send confirmation email
    await this.notificationService.sendEmail({
      to: event.customerEmail,
      template: "order-confirmation",
      data: {
        orderId: event.orderId,
        total: event.totalAmount,
      },
    });
  }
}

// Event Bus
class DomainEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> =
    new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    await Promise.all(handlers.map((handler) => handler(event)));
  }
}
```

## Best Practices

### 1. Keep Aggregates Small

```typescript
// ❌ Bad: Large aggregate
class Order {
  items: OrderItem[];
  payments: Payment[];
  shipments: Shipment[];
  returns: Return[];
  reviews: Review[];
  // Too much!
}

// ✅ Good: Focused aggregate
class Order {
  items: OrderItem[]; // Only what's needed for order consistency

  // References to other aggregates
  paymentId?: PaymentId;
  shipmentId?: ShipmentId;
}

class Payment {
  orderId: OrderId; // Reference back
  amount: Money;
  status: PaymentStatus;
}
```

### 2. Invariants Within Aggregates

```typescript
// Aggregate enforces business rules
class Account {
  private balance: Money;
  private overdraftLimit: Money;

  withdraw(amount: Money): void {
    const newBalance = this.balance.subtract(amount);

    // Invariant: balance must stay above overdraft limit
    if (newBalance.isLessThan(this.overdraftLimit.negate())) {
      throw new Error("Withdrawal exceeds overdraft limit");
    }

    this.balance = newBalance;
  }
}
```

### 3. Repository Per Aggregate

```typescript
// ✅ One repository per aggregate root
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
}

// ❌ No repository for internal entities
// No OrderItemRepository!
```

### 4. Avoid Bidirectional Associations

```typescript
// ❌ Bad: Bidirectional
class Order {
  customer: Customer;
}
class Customer {
  orders: Order[];
}

// ✅ Good: Unidirectional
class Order {
  customerId: CustomerId; // ID reference only
}

// Query when needed
const orders = await orderRepository.findByCustomer(customerId);
```

## Anti-Patterns

### ❌ Anemic Domain Model

```typescript
// Bad: No behavior, just data
class Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: string;
}

// Service does all the work
class OrderService {
  placeOrder(order: Order) {
    // Validate
    if (order.items.length === 0) throw new Error();

    // Calculate total
    order.total = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Update status
    order.status = "PLACED";
  }
}

// Good: Rich domain model
class Order {
  placeOrder() {
    this.validate();
    this.calculateTotal();
    this.status = OrderStatus.Placed;
  }
}
```

### ❌ God Aggregate

```typescript
// Bad: Everything in one aggregate
class Customer {
  orders: Order[]; // Separate aggregate
  payments: Payment[]; // Separate aggregate
  addresses: Address[]; // Could be separate
  preferences: Preferences; // Could be separate
  reviews: Review[]; // Separate aggregate
}
```

### ❌ Exposing Internal State

```typescript
// Bad
class Order {
  items: OrderItem[]; // Public, mutable!
}

order.items.push(new OrderItem()); // Bypass business logic

// Good
class Order {
  private items: OrderItem[];

  addItem(product: Product, quantity: number): void {
    // Enforce business rules
    this.items.push(new OrderItem(product, quantity));
  }

  getItems(): readonly OrderItem[] {
    return Object.freeze([...this.items]);
  }
}
```

## Quick Reference

### Entity vs Value Object

| Aspect         | Entity        | Value Object          |
| -------------- | ------------- | --------------------- |
| **Identity**   | Yes (ID)      | No                    |
| **Mutability** | Mutable       | Immutable             |
| **Equality**   | By ID         | By attributes         |
| **Lifecycle**  | Has lifecycle | Replaced entirely     |
| **Example**    | User, Order   | Money, Address, Email |

### Aggregate Design Rules

```
1. Protect invariants within aggregate boundaries
2. Design small aggregates
3. Reference other aggregates by ID
4. Update one aggregate per transaction
5. Use eventual consistency between aggregates
```

## Resources

- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design (Vaughn Vernon)](https://vaughnvernon.com/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)
- [Martin Fowler: Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

---

_Rich domain models express business logic clearly, making systems easier to understand, maintain, and evolve with changing requirements._
