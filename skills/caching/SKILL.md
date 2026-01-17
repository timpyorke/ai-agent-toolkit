---
name: Caching
description: Reduce latency and load via layered caches, safe invalidation, and robust consistency strategies
---

# Caching Skill

Design cache layers to improve performance while preserving correctness. Apply the right strategy per data type and access pattern.

## Cache Layers

- **Client/browser**: HTTP cache, Service Worker
- **CDN/edge**: Static assets, cache keys by path/query/header
- **Reverse proxy**: NGINX/Varnish caching of HTML/API responses
- **Application**: Redis/Memcached for hot data
- **Database**: Query result caching, materialized views

## Patterns

### Cache-Aside (Lazy Loading)

- Read: miss → fetch from source → populate cache → return
- Write: update source → invalidate cache
- Pros: Simple, flexible; Cons: First read is slow; stale risk

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

- Write: update cache and source in the same flow
- Read: always from cache (warm paths)
- Pros: Low read latency; Cons: write amplification

```ts
async function putProduct(product: Product) {
  await db.products.upsert(product);
  await redis.set(`product:${product.id}`, JSON.stringify(product));
}
```

### Write-Behind (Write-Back)

- Write: update cache; flush to source asynchronously
- Pros: Fast writes; Cons: risk of data loss; requires durable cache

### Refresh-Ahead

- Proactively refresh items nearing TTL to avoid cold misses

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

## Keys & Invalidation

- **Keys**: stable, namespaced, include version and parameters (e.g., `v2:user:123`)
- **Invalidation**:
  - On write/update/delete
  - On schema change (bump version prefix)
  - On business events (e.g., price update)
- **TTL**: pick per freshness requirement; use jitter to avoid thundering herds

```ts
function keyUser(id: string) {
  return `v2:user:${id}`;
}
function keyUserList(page: number) {
  return `v1:users:page:${page}`;
}
```

## Prevent Cache Stampede

- **Request coalescing**: single loader for concurrent misses
- **Locking**: mutex around load for hot keys
- **Jitter**: randomize TTL to spread expirations
- **Soft TTL**: serve slightly stale while recomputing

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

## Consistency & Correctness

- Choose delivery semantics: **strong** vs **eventual** consistency
- For critical balances/counters: avoid caching or use short TTL + verification
- Use **versioning** and **ETags** to validate freshness

```http
ETag: "user-123-v5"
Cache-Control: public, max-age=3600
```

## Hierarchical Caching Example

```
Client → CDN → Reverse Proxy → App Cache → DB
```

- Cache what’s safe at the highest layer
- Respect Vary headers (auth, locale, device)

## CDN & Edge

- Cache static assets aggressively (`immutable`) with content hashing
- For HTML/API, vary by cookie/header when needed; use edge compute for personalization

```http
Cache-Control: public, max-age=31536000, immutable
```

## Metrics & Monitoring

- Hit ratio, miss ratio, evictions, memory usage
- Latency P50/P95, errors
- Key-space analysis and hot key detection

## Anti-Patterns

- Caching mutable data without invalidation
- Global cache for every query → poor locality
- Zero TTL everywhere → minimal benefit

## Quick Reference

- Use cache-aside for general reads
- Write-through for frequently-read data
- Refresh-ahead to avoid expirations on hot keys
- Add jitter and locks to prevent stampede

## Resources

- High Scalability: Caching Best Practices
- Redis Docs: https://redis.io/docs/
- Varnish Caching: https://varnish-cache.org/
