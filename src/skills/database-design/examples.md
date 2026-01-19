# Examples

## Relational Modeling (SQL)

### Relational Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);
```

### Indexing Strategy

```sql
-- Access patterns
-- 1) Get orders for a user by recent
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- 2) Find users by email (login)
CREATE INDEX idx_users_email ON users (email);

-- 3) Analytics on order status
CREATE INDEX idx_orders_status_created ON orders (status, created_at);
```

## Document Modeling (NoSQL)

### MongoDB Example

```js
// users
{ _id: UUID, email: "a@b.com", name: "Alice", created_at: ISODate() }

// orders embedded items when access as a whole
{
  _id: UUID,
  user_id: UUID,
  status: "paid",
  items: [{ product_id: UUID, qty: 2, price_cents: 990 }],
  created_at: ISODate()
}
```

## Partitioning Strategy (SQL)

```sql
-- Range Partitioning by Date
CREATE TABLE sales (
    id UUID,
    amount DECIMAL,
    sale_date DATE
) PARTITION BY RANGE (sale_date);

CREATE TABLE sales_2023_q4 PARTITION OF sales
    FOR VALUES FROM ('2023-10-01') TO ('2024-01-01');

CREATE TABLE sales_2024_q1 PARTITION OF sales
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```
