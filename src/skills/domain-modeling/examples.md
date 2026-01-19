# Examples

## Entities

### Entity Implementation
```typescript
// Entity: Order
class Order {
  private readonly id: OrderId;
  private status: OrderStatus;
  private items: OrderItem[];
  private customerId: CustomerId;
  private placedAt: Date;
  private updatedAt: Date;

  constructor(id: OrderId, customerId: CustomerId) {
    this.id = id;
    this.customerId = customerId;
    this.status = OrderStatus.Draft;
    this.items = [];
    this.placedAt = new Date();
    this.updatedAt = new Date();
  }

  // Identity
  getId(): OrderId {
    return this.id;
  }

  // Business logic
  addItem(product: Product, quantity: number): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Cannot modify non-draft order");
    }

    const item = new OrderItem(product, quantity);
    this.items.push(item);
    this.updatedAt = new Date();
  }

  placeOrder(): void {
    if (this.items.length === 0) {
      throw new Error("Cannot place empty order");
    }
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Order already placed");
    }

    this.status = OrderStatus.Placed;
    this.updatedAt = new Date();

    // Emit domain event
    this.addDomainEvent(new OrderPlacedEvent(this.id, this.customerId));
  }

  // Equality based on ID
  equals(other: Order): boolean {
    return this.id.equals(other.id);
  }
}

// Strongly typed ID
class OrderId {
  private readonly value: string;

  constructor(value: string) {
    if (!value) throw new Error("OrderId cannot be empty");
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}
```

## Value Objects

### Money and Address Examples
```typescript
// Value Object: Money
class Money {
  private readonly amount: number;
  private readonly currency: Currency;

  constructor(amount: number, currency: Currency) {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    this.amount = amount;
    this.currency = currency;
  }

  // Immutable operations return new instances
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  // Value equality
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error("Cannot operate on different currencies");
    }
  }
}

// Value Object: Address
class Address {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zipCode: string,
    public readonly country: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.street || !this.city || !this.zipCode) {
      throw new Error("Invalid address");
    }
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode &&
      this.country === other.country
    );
  }
}
```

## Aggregates

### Aggregate Root: Order
```typescript
class Order {
  private readonly id: OrderId;
  private readonly customerId: CustomerId;
  private items: OrderItem[]; // Internal entities
  private shippingAddress: Address; // Value object
  private status: OrderStatus;
  private totalAmount: Money;

  constructor(id: OrderId, customerId: CustomerId, shippingAddress: Address) {
    this.id = id;
    this.customerId = customerId;
    this.items = [];
    this.shippingAddress = shippingAddress;
    this.status = OrderStatus.Draft;
    this.totalAmount = new Money(0, Currency.USD);
  }

  // Aggregate root controls access to internals
  addItem(productId: ProductId, quantity: number, price: Money): void {
    this.ensureOrderIsDraft();

    // Enforce business rules
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    // Check if item already exists
    const existingItem = this.items.find((item) =>
      item.getProductId().equals(productId),
    );

    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      const item = new OrderItem(productId, quantity, price);
      this.items.push(item);
    }

    this.recalculateTotal();
  }

  removeItem(productId: ProductId): void {
    this.ensureOrderIsDraft();

    this.items = this.items.filter(
      (item) => !item.getProductId().equals(productId),
    );

    this.recalculateTotal();
  }

  placeOrder(): void {
    this.ensureOrderIsDraft();

    // Enforce invariants
    if (this.items.length === 0) {
      throw new Error("Cannot place empty order");
    }

    if (this.totalAmount.isLessThan(new Money(1, Currency.USD))) {
      throw new Error("Order total too small");
    }

    this.status = OrderStatus.Placed;

    // Emit domain event
    this.addDomainEvent(
      new OrderPlacedEvent(
        this.id,
        this.customerId,
        this.totalAmount,
        this.items.map((item) => item.toSnapshot()),
      ),
    );
  }

  // Private: Maintain invariants
  private recalculateTotal(): void {
    this.totalAmount = this.items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      new Money(0, Currency.USD),
    );
  }

  private ensureOrderIsDraft(): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Order is not modifiable");
    }
  }
}
```

## Domain Events

### Event Definitions
```typescript
abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }
}

class OrderPlacedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly totalAmount: Money,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      unitPrice: Money;
    }>,
  ) {
    super();
  }
}
```

## Repositories

### Repository Implementation
```typescript
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}

class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    const data = {
      id: order.getId().toString(),
      customer_id: order.getCustomerId().toString(),
      status: order.getStatus(),
      total_amount: order.getTotal().getAmount(),
      // ...
    };

    await this.db.upsert("orders", data);

    // Publish domain events
    const events = order.getDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
  
  // findById implementation...
}
```

## Domain Services

### Service Examples
```typescript
// Domain Service: PricingService
class PricingService {
  calculateOrderTotal(
    items: OrderItem[],
    customer: Customer,
    promoCode?: PromoCode,
  ): Money {
    // Base total
    let total = items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      new Money(0, Currency.USD),
    );

    // Apply customer discount
    if (customer.isPremium()) {
      const discount = total.multiply(0.1); // 10% off
      total = total.subtract(discount);
    }
    return total;
  }
}
```

## Patterns

### Specification Pattern
```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
// ...
}

class CustomerIsEligibleForLoan implements Specification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return (
      customer.getCreditScore() >= 700 &&
      customer.getAge() >= 18
    );
  }
  // ...
}
```

### Factory Pattern
```typescript
class OrderFactory {
  create(customerId: CustomerId, items: Array<any>): Order {
    const orderId = new OrderId(crypto.randomUUID());
    const order = new Order(orderId, customerId, new Address(/*...*/));
    // ...
    return order;
  }
}
```

### Context Mapping (ACL)
```typescript
// Anti-corruption Layer: Translate Sales Order -> Inventory Reservation
class InventoryAdapter {
  toInventoryReservation(salesOrder: SalesOrder): InventoryReservation {
    const items = salesOrder.items.map((item) => ({
      sku: item.productId, // Different terminology
      quantity: item.quantity,
      warehouse: "MAIN",
    }));

    return new InventoryReservation(salesOrder.id, items);
  }
}
```
