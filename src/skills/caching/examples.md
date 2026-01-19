# Code Examples

## Implementation Patterns

### Cache-Aside (Lazy Loading)

```ts
// Node/TypeScript cache-aside
import Redis from "ioredis";
const redis = new Redis();

async function getUser(userId: string) {
  const key = `user:${userId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(userId);
  await redis.set(key, JSON.stringify(user), "EX", 3600); // TTL 1h
  return user;
}

async function updateUser(userId: string, patch: Partial<User>) {
  const updated = await db.users.update(userId, patch);
  await redis.del(`user:${userId}`); // invalidate
  return updated;
}
```

### Write-Through

```ts
async function putProduct(product: Product) {
  await db.products.upsert(product);
  await redis.set(`product:${product.id}`, JSON.stringify(product));
}
```

### Refresh-Ahead

```ts
async function refreshAhead(
  key: string,
  loader: () => Promise<any>,
  ttl = 3600,
) {
  const remaining = await redis.ttl(key);
  if (remaining > 0 && remaining < ttl * 0.1) {
    const value = await loader();
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }
}
```

## Key Management

### Key Generation

```ts
function keyUser(id: string) {
  return `v2:user:${id}`;
}
function keyUserList(page: number) {
  return `v1:users:page:${page}`;
}
```

## Stampede Prevention

### Locking and Coalescing

```ts
const locks = new Map<string, Promise<any>>();

async function loadOnce(key: string, loader: () => Promise<any>) {
  if (locks.has(key)) return locks.get(key);
  const p = (async () => {
    try {
      return await loader();
    } finally {
      locks.delete(key);
    }
  })();
  locks.set(key, p);
  return p;
}
```
