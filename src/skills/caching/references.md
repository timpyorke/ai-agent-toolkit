# Reference Material

## Cache Layers

- **Client/browser**: HTTP cache, Service Worker
- **CDN/edge**: Static assets, cache keys by path/query/header
- **Reverse proxy**: NGINX/Varnish caching of HTML/API responses
- **Application**: Redis/Memcached for hot data
- **Database**: Query result caching, materialized views

## Patterns Comparison

### Cache-Aside (Lazy Loading)
- Read: miss → fetch from source → populate cache → return
- Write: update source → invalidate cache
- Pros: Simple, flexible; Cons: First read is slow; stale risk

### Write-Through
- Write: update cache and source in the same flow
- Read: always from cache (warm paths)
- Pros: Low read latency; Cons: write amplification

### Write-Behind (Write-Back)
- Write: update cache; flush to source asynchronously
- Pros: Fast writes; Cons: risk of data loss; requires durable cache

### Refresh-Ahead
- Proactively refresh items nearing TTL to avoid cold misses

## Keys & Invalidation

- **Keys**: stable, namespaced, include version and parameters (e.g., `v2:user:123`)
- **Invalidation**:
  - On write/update/delete
  - On schema change (bump version prefix)
  - On business events (e.g., price update)
- **TTL**: pick per freshness requirement; use jitter to avoid thundering herds

## Prevent Cache Stampede Strategies

- **Request coalescing**: single loader for concurrent misses
- **Locking**: mutex around load for hot keys
- **Jitter**: randomize TTL to spread expirations
- **Soft TTL**: serve slightly stale while recomputing

## Consistency & Correctness

- Choose delivery semantics: **strong** vs **eventual** consistency
- For critical balances/counters: avoid caching or use short TTL + verification
- Use **versioning** and **ETags** to validate freshness

```http
ETag: "user-123-v5"
Cache-Control: public, max-age=3600
```

## Hierarchical Caching

```
Client → CDN → Reverse Proxy → App Cache → DB
```

- Cache what’s safe at the highest layer
- Respect Vary headers (auth, locale, device)

## CDN & Edge Usage

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
