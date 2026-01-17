---
name: Domain Modeling
description: Design rich domain models using DDD principles with entities, value objects, aggregates, and bounded contexts
---

# Domain Modeling Skill

Master Domain-Driven Design (DDD) to create expressive, maintainable models that reflect business logic and enable collaborative understanding between technical and domain experts.

## Core Principles

### 1. Ubiquitous Language

- **Shared vocabulary**: Same terms used by developers and domain experts
- **Consistent naming**: Code reflects business concepts exactly
- **Evolves with understanding**: Refine as domain knowledge deepens
- **Context-specific**: Terms may differ across bounded contexts

### 2. Strategic Design

- **Bounded contexts**: Clear boundaries around models
- **Context mapping**: Define relationships between contexts
- **Core domain**: Focus investment on business differentiators
- **Supporting/Generic subdomains**: Buy or delegate when possible

### 3. Tactical Design

- **Entities**: Objects with identity and lifecycle
- **Value objects**: Immutable objects defined by attributes
- **Aggregates**: Consistency boundaries and transactional units
- **Domain events**: Capture business-significant state changes
- **Repositories**: Persist and retrieve aggregates

## Building Blocks

### 1. Entities

**Characteristics:**

- Identity that persists over time
- Mutable state
- Equality based on ID, not attributes

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

### 2. Value Objects

**Characteristics:**

- No identity
- Immutable
- Equality based on all attributes
- Side-effect free methods

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

  format(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}

// Value Object: Email
class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid email address");
    }
    this.value = value.toLowerCase();
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

### 3. Aggregates

**Characteristics:**

- Cluster of entities and value objects
- One entity is the aggregate root
- External references only to root
- Enforces invariants
- Transactional consistency boundary

```typescript
// Aggregate Root: Order
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

  // Expose only what's needed
  getId(): OrderId {
    return this.id;
  }

  getTotal(): Money {
    return this.totalAmount;
  }

  getStatus(): OrderStatus {
    return this.status;
  }
}

// Internal entity (not an aggregate root)
class OrderItem {
  private readonly productId: ProductId;
  private quantity: number;
  private readonly unitPrice: Money;

  constructor(productId: ProductId, quantity: number, unitPrice: Money) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  increaseQuantity(amount: number): void {
    this.quantity += amount;
  }

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  getProductId(): ProductId {
    return this.productId;
  }

  toSnapshot() {
    return {
      productId: this.productId.toString(),
      quantity: this.quantity,
      unitPrice: this.unitPrice,
    };
  }
}
```

### 4. Domain Events

**Characteristics:**

- Capture something that happened in the domain
- Immutable
- Named in past tense
- Contain all relevant data

```typescript
// Domain Event
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

class OrderShippedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly shippingAddress: Address,
    public readonly trackingNumber: string,
  ) {
    super();
  }
}

class PaymentProcessedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly amount: Money,
    public readonly paymentMethod: PaymentMethod,
    public readonly transactionId: string,
  ) {
    super();
  }
}

// Aggregate publishes events
class Order {
  private domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### 5. Repositories

**Characteristics:**

- Persist and retrieve aggregates
- Operate on aggregate roots only
- Abstract data access details
- Collection-like interface

```typescript
// Repository interface
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}

// Implementation
class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    const data = {
      id: order.getId().toString(),
      customer_id: order.getCustomerId().toString(),
      status: order.getStatus(),
      total_amount: order.getTotal().getAmount(),
      currency: order.getTotal().getCurrency(),
      // ... other fields
    };

    await this.db.upsert("orders", data);

    // Save order items (part of aggregate)
    for (const item of order.getItems()) {
      await this.db.upsert("order_items", {
        order_id: order.getId().toString(),
        product_id: item.getProductId().toString(),
        quantity: item.getQuantity(),
        unit_price: item.getUnitPrice().getAmount(),
      });
    }

    // Publish domain events
    const events = order.getDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.db.query("SELECT * FROM orders WHERE id = $1", [
      id.toString(),
    ]);

    if (!row) return null;

    const items = await this.db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [id.toString()],
    );

    return this.reconstitute(row, items);
  }

  private reconstitute(orderData: any, itemsData: any[]): Order {
    // Reconstruct aggregate from data
    const order = new Order(
      new OrderId(orderData.id),
      new CustomerId(orderData.customer_id),
      // ... other params
    );

    // Restore state
    for (const itemData of itemsData) {
      // Add items without triggering business logic
      order.addItemInternal(
        new ProductId(itemData.product_id),
        itemData.quantity,
        new Money(itemData.unit_price, Currency.USD),
      );
    }

    return order;
  }
}
```

## Bounded Contexts

### Defining Boundaries

```
E-commerce System Bounded Contexts:

┌─────────────────────────────────────────────────────────┐
│                    Sales Context                        │
│  - Customer (buyer identity)                            │
│  - Order (items, pricing, status)                       │
│  - Product (catalog info)                               │
│  Language: "Place order", "Add to cart"                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Inventory Context                       │
│  - Product (stock levels, locations)                     │
│  - Warehouse                                            │
│  - StockItem                                            │
│  Language: "Allocate stock", "Restock"                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Shipping Context                         │
│  - Shipment (parcels, tracking)                         │
│  - Customer (delivery address)                          │
│  - Order (items to ship)                                │
│  Language: "Dispatch", "Track shipment"                 │
└─────────────────────────────────────────────────────────┘

Note: "Customer", "Order", "Product" have different
meanings in each context!
```

### Context Mapping

```typescript
// Anti-corruption Layer (ACL)
// Translate between contexts

// Sales Context
class SalesOrder {
  constructor(
    public id: string,
    public customerId: string,
    public items: SalesOrderItem[],
  ) {}
}

// Inventory Context
class InventoryReservation {
  constructor(
    public orderId: string,
    public items: ReservationItem[],
  ) {}
}

// ACL: Translate Sales → Inventory
class InventoryAdapter {
  toInventoryReservation(salesOrder: SalesOrder): InventoryReservation {
    const items = salesOrder.items.map((item) => ({
      sku: item.productId, // Different terminology
      quantity: item.quantity,
      warehouse: this.selectWarehouse(item),
    }));

    return new InventoryReservation(salesOrder.id, items);
  }

  private selectWarehouse(item: SalesOrderItem): string {
    // Business logic specific to translation
    return "MAIN_WAREHOUSE";
  }
}

// Usage
class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private inventoryService: InventoryService,
    private inventoryAdapter: InventoryAdapter,
  ) {}

  async placeOrder(order: SalesOrder): Promise<void> {
    // Work in Sales context
    await this.orderRepository.save(order);

    // Translate to Inventory context
    const reservation = this.inventoryAdapter.toInventoryReservation(order);

    // Interact with Inventory context
    await this.inventoryService.reserveStock(reservation);
  }
}
```

## Domain Services

**When to use:**

- Logic doesn't belong to a single entity
- Operation spans multiple aggregates
- Stateless operations

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

    // Apply promo code
    if (promoCode) {
      const promoDiscount = promoCode.calculateDiscount(total);
      total = total.subtract(promoDiscount);
    }

    return total;
  }
}

// Domain Service: TransferService
class TransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    // Operation spans two aggregates
    if (!from.canWithdraw(amount)) {
      throw new Error("Insufficient funds");
    }

    from.withdraw(amount);
    to.deposit(amount);

    // Emit event
    this.eventPublisher.publish(
      new MoneyTransferredEvent(from.getId(), to.getId(), amount),
    );
  }
}
```

## Patterns & Practices

### 1. Specification Pattern

```typescript
// Specification for complex business rules
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

class CustomerIsEligibleForLoan implements Specification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return (
      customer.getCreditScore() >= 700 &&
      customer.getAge() >= 18 &&
      customer.hasStableIncome()
    );
  }

  and(other: Specification<Customer>): Specification<Customer> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<Customer>): Specification<Customer> {
    return new OrSpecification(this, other);
  }

  not(): Specification<Customer> {
    return new NotSpecification(this);
  }
}

// Usage
const eligibleForLoan = new CustomerIsEligibleForLoan();
const hasNoOutstandingDebt = new CustomerHasNoOutstandingDebt();
const isVerified = new CustomerIsVerified();

const canGetLoan = eligibleForLoan.and(hasNoOutstandingDebt).and(isVerified);

if (canGetLoan.isSatisfiedBy(customer)) {
  // Process loan application
}
```

### 2. Factory Pattern

```typescript
// Factory for complex object creation
class OrderFactory {
  create(
    customerId: CustomerId,
    items: Array<{ productId: ProductId; quantity: number }>,
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
  ): Order {
    // Generate ID
    const orderId = new OrderId(crypto.randomUUID());

    // Create order
    const order = new Order(orderId, customerId, shippingAddress);

    // Add items with pricing
    for (const item of items) {
      const product = this.productRepository.findById(item.productId);
      const price = this.pricingService.getPrice(product, customerId);
      order.addItem(item.productId, item.quantity, price);
    }

    // Set payment
    order.setPaymentMethod(paymentMethod);

    return order;
  }

  reconstitute(data: OrderData): Order {
    // Reconstruct from persistence
    const order = new Order(
      new OrderId(data.id),
      new CustomerId(data.customerId),
      new Address(/* ... */),
    );

    // Restore state without validation
    // ...

    return order;
  }
}
```

### 3. Domain Event Handling

```typescript
// Event Handler
class OrderPlacedEventHandler {
  constructor(
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
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
