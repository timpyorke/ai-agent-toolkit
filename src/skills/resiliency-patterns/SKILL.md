---
name: resiliency-patterns
description: Enable fault-tolerant systems with circuit breakers, retries with backoff + jitter, timeouts, bulkheads, rate limiting, graceful degradation, and fallbacks.
---

# 🛡️ Resiliency Patterns

## Overview

Resiliency patterns enable systems to handle failures gracefully without cascading outages. This skill covers circuit breakers, retry with exponential backoff and jitter, timeout configuration, bulkhead isolation, rate limiting (token bucket, leaky bucket, sliding window), graceful degradation, and fallback strategies—building fault-tolerant distributed systems.

## Core Principles

1. Fail fast and isolate: use circuit breakers to prevent cascades.
2. Bound retries: exponential backoff with jitter; cap attempts and total time.
3. Time-box operations: set conservative connection/read/overall timeouts per SLA.
4. Degrade gracefully: fallbacks, cached data, feature flags for non-critical paths.
5. Limit blast radius: bulkheads, rate limiting, and resource isolation.

## Why Resiliency Patterns?

**Without resiliency**:

```
Service A → Service B (down) → Timeout after 30s
                              → All threads blocked
                              → Service A crashes too
```

**With resiliency**:

```
Service A → Circuit Breaker → Fast fail (no cascade)
          → Fallback        → Degraded but functional
```

## Circuit Breaker Pattern

Prevents cascading failures by stopping requests to failing services.

### States

```
        Success count > threshold
    ┌──────────────────────────────┐
    │                              │
    ▼                              │
┌────────┐  Failure threshold  ┌────────┐
│ CLOSED │────────────────────>│  OPEN  │
└────────┘                      └────────┘
    ▲                              │
    │                              │ Timeout
    │                              ▼
    │                          ┌─────────┐
    └──────────────────────────│HALF-OPEN│
         Success threshold     └─────────┘
                 Met                │
                                    │ Failure
                                    ▼ Back to OPEN
```

**States**:

- **CLOSED**: Normal operation, requests flow through
- **OPEN**: Failing, requests fail immediately
- **HALF-OPEN**: Testing if service recovered

### Implementation (Node.js)

```typescript
class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();

  constructor(
    private failureThreshold = 5, // Open after 5 failures
    private successThreshold = 2, // Close after 2 successes in half-open
    private timeout = 60000, // Wait 60s before half-open
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState(): string {
    return this.state;
  }
}

// Usage
const breaker = new CircuitBreaker();

async function callExternalAPI() {
  return await breaker.execute(() =>
    fetch("https://api.example.com/data").then((res) => res.json()),
  );
}
```

### Using opossum (Node.js library)

```typescript
import CircuitBreaker from "opossum";

const options = {
  timeout: 3000, // If function takes > 3s, trigger failure
  errorThresholdPercentage: 50, // Open when 50% of requests fail
  resetTimeout: 30000, // After 30s, try again (half-open)
};

const breaker = new CircuitBreaker(callExternalAPI, options);

// Events
breaker.on("open", () => console.log("Circuit breaker opened"));
breaker.on("halfOpen", () => console.log("Circuit breaker half-open"));
breaker.on("close", () => console.log("Circuit breaker closed"));

// Fallback
breaker.fallback(() => ({ data: "cached-fallback" }));

// Execute
const result = await breaker.fire({ userId: 123 });
```

### Resilience4j (Java)

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;

CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                    // Open at 50% failure rate
    .waitDurationInOpenState(Duration.ofSeconds(60))
    .slidingWindowSize(10)                       // Last 10 calls
    .build();

CircuitBreaker circuitBreaker = CircuitBreaker.of("externalAPI", config);

// Decorate function
Supplier<String> decoratedSupplier = CircuitBreaker
    .decorateSupplier(circuitBreaker, () -> callExternalAPI());

// Execute
String result = decoratedSupplier.get();
```

## Retry with Exponential Backoff

Automatically retry failed requests with increasing delays.

### Exponential Backoff Formula

```
delay = base_delay * (2 ^ attempt) + jitter

Example (base_delay = 1s):
Attempt 1: 1s  * 2^0 = 1s
Attempt 2: 1s  * 2^1 = 2s
Attempt 3: 1s  * 2^2 = 4s
Attempt 4: 1s  * 2^3 = 8s
Attempt 5: 1s  * 2^4 = 16s
```

### Why Jitter?

**Without jitter (thundering herd)**:

```
100 clients retry at exactly 1s, 2s, 4s, 8s
→ Synchronized spikes overwhelm server
```

**With jitter (spread out)**:

```
Clients retry at random times around 1s, 2s, 4s, 8s
→ Smooth load distribution
```

### Implementation (TypeScript)

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 30000,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        throw error; // Give up after max retries
      }

      // Exponential backoff with jitter
      const exponentialDelay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay,
      );
      const jitter = Math.random() * 1000;
      const delay = exponentialDelay + jitter;

      console.log(`Retry attempt ${attempt} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await retryWithBackoff(() =>
  fetch("https://api.example.com/data").then((res) => res.json()),
);
```

### axios-retry (Node.js)

```typescript
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ?? 0) >= 500
    );
  },
});

// Automatic retry on failure
const response = await axios.get("https://api.example.com/data");
```

### Polly (.NET)

```csharp
using Polly;

var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt =>
            TimeSpan.FromSeconds(Math.Pow(2, attempt)) // Exponential backoff
    );

await retryPolicy.ExecuteAsync(async () =>
{
    var response = await httpClient.GetAsync("https://api.example.com/data");
    response.EnsureSuccessStatusCode();
});
```

## Timeout Configuration

Prevent indefinite waits by setting appropriate timeouts.

### Timeout Types

**1. Connection Timeout**

```typescript
// Time to establish TCP connection
const response = await axios.get("https://api.example.com", {
  timeout: 5000, // 5 seconds
  httpsAgent: new https.Agent({
    timeout: 5000, // Connection timeout
  }),
});
```

**2. Read Timeout**

```typescript
// Time to receive response after connection
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const response = await fetch("https://api.example.com", {
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

**3. Total Timeout**

```typescript
// Overall request timeout (connection + read)
async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
```

### Database Timeouts

**PostgreSQL**

```sql
-- Statement timeout (10 seconds)
SET statement_timeout = 10000;

-- Lock timeout
SET lock_timeout = 5000;
```

**MongoDB**

```javascript
const result = await db
  .collection("users")
  .find({
    email: "user@example.com",
  })
  .maxTimeMS(5000); // 5 second timeout
```

**Redis**

```javascript
const redis = new Redis({
  host: "localhost",
  connectTimeout: 5000, // Connection timeout
  commandTimeout: 3000, // Command timeout
});
```

## Bulkhead Pattern

Isolate resources to prevent failure in one area from affecting others.

### Thread Pool Isolation

**Without bulkhead**:

```
Shared thread pool (10 threads)
─────────────────────────────────
[Service A] [Service A] [Service A] [Service A]
[Service A] [Service A] [Service A] [Service A]
[Service A] [Service A]

↑ Service A is slow, all threads blocked
↑ Service B cannot get threads → fails too
```

**With bulkhead**:

```
Pool A (5 threads)     Pool B (5 threads)
─────────────────      ─────────────────
[Service A] ❌          [Service B] ✅
[Service A] ❌          [Service B] ✅
[Service A] ❌          [Service B] ✅
[Service A] ❌          [Service B] ✅
[Service A] ❌          [Service B] ✅

↑ Service A fails      ↑ Service B unaffected
```

### Implementation

**Node.js (p-limit)**

```typescript
import pLimit from "p-limit";

// Separate concurrency limits for different services
const serviceALimit = pLimit(5); // Max 5 concurrent requests
const serviceBLimit = pLimit(10); // Max 10 concurrent requests

// Service A requests
const resultA = await serviceALimit(() => callServiceA());

// Service B requests (not affected by Service A load)
const resultB = await serviceBLimit(() => callServiceB());
```

**Resilience4j Bulkhead**

```java
import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;

BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(10)
    .maxWaitDuration(Duration.ofMillis(500))
    .build();

Bulkhead bulkhead = Bulkhead.of("serviceA", config);

Supplier<String> decoratedSupplier = Bulkhead
    .decorateSupplier(bulkhead, () -> callServiceA());

String result = decoratedSupplier.get();
```

### Connection Pool Bulkheads

```javascript
// Separate connection pools for different use cases
const criticalPool = mysql.createPool({
  host: "db.example.com",
  connectionLimit: 20, // Critical operations
});

const analyticsPool = mysql.createPool({
  host: "db.example.com",
  connectionLimit: 5, // Analytics (can be slower)
});

// Critical path uses dedicated pool
app.get("/checkout", async (req, res) => {
  const connection = await criticalPool.getConnection();
  // ... checkout logic
});

// Analytics don't affect critical path
app.get("/analytics", async (req, res) => {
  const connection = await analyticsPool.getConnection();
  // ... analytics logic
});
```

## Rate Limiting

Control request rate to protect services from overload.

### Token Bucket Algorithm

```
Bucket capacity: 10 tokens
Refill rate: 1 token/second

Request arrives:
  If bucket has tokens → Allow (consume 1 token)
  If bucket empty → Deny (429 Too Many Requests)
```

**Implementation**:

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  consume(tokens = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true; // Request allowed
    }

    return false; // Rate limited
  }
}

// Usage
const bucket = new TokenBucket(10, 1); // 10 tokens, refill 1/sec

if (bucket.consume()) {
  // Process request
} else {
  // Return 429 Too Many Requests
}
```

### Leaky Bucket Algorithm

```
Bucket capacity: 10 requests
Leak rate: 1 request/second

Requests enter bucket
Processed at constant rate
If bucket full → Reject
```

**Implementation**:

```typescript
class LeakyBucket {
  private queue: Array<() => void> = [];
  private processing = false;

  constructor(
    private capacity: number,
    private leakRate: number, // requests per second
  ) {}

  async request(fn: () => Promise<void>): Promise<void> {
    if (this.queue.length >= this.capacity) {
      throw new Error("Rate limit exceeded");
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await fn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
      await new Promise((resolve) => setTimeout(resolve, 1000 / this.leakRate));
    }

    this.processing = false;
  }
}
```

### Sliding Window Algorithm

Most accurate rate limiting.

```typescript
class SlidingWindow {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  allow(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old requests outside window
    this.requests = this.requests.filter((time) => time > windowStart);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }
}

// Usage: Max 100 requests per minute
const limiter = new SlidingWindow(100, 60000);

if (limiter.allow()) {
  // Process request
} else {
  // Return 429
}
```

### Express Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: "Too many requests, please try again later",
});

// Apply to all requests
app.use(limiter);

// Or specific routes
app.use("/api/", limiter);
```

### Redis-based Rate Limiting (Distributed)

```typescript
import Redis from "ioredis";

const redis = new Redis();

async function rateLimitRedis(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use sorted set with timestamps as scores
  const pipeline = redis.pipeline();

  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  pipeline.zcard(key);

  // Add current request
  pipeline.zadd(key, now, `${now}-${Math.random()}`);

  // Set expiry
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const count = results![1][1] as number;

  return count < maxRequests;
}

// Usage
const userId = "user-123";
const allowed = await rateLimitRedis(`rate:${userId}`, 100, 60);

if (!allowed) {
  return res.status(429).json({ error: "Rate limit exceeded" });
}
```

## Graceful Degradation

Maintain reduced functionality when dependencies fail.

### Levels of Degradation

```
Full functionality   → All services healthy
↓ Degraded Level 1   → Non-essential features disabled
↓ Degraded Level 2   → Cached/stale data
↓ Degraded Level 3   → Static fallback
↓ Complete failure   → Service unavailable
```

### Implementation

```typescript
async function getProductRecommendations(userId: string) {
  try {
    // Try ML recommendation service
    const recommendations = await mlService.getRecommendations(userId, {
      timeout: 2000,
    });
    return { recommendations, source: "ml" };
  } catch (error) {
    console.warn("ML service unavailable, using fallback");

    try {
      // Fallback 1: Rule-based recommendations
      const recommendations = await getRuleBasedRecommendations(userId);
      return { recommendations, source: "rule-based" };
    } catch (error2) {
      console.warn("Rule-based service unavailable, using cache");

      try {
        // Fallback 2: Cached recommendations
        const recommendations = await cache.get(`rec:${userId}`);
        if (recommendations) {
          return { recommendations, source: "cache", stale: true };
        }
      } catch (error3) {
        // Fallback 3: Popular products (static)
        const recommendations = await getPopularProducts();
        return { recommendations, source: "popular", stale: true };
      }
    }
  }
}
```

### Feature Flags for Degradation

```typescript
import { FeatureFlags } from "./feature-flags";

async function getUser(userId: string) {
  const user = await db.users.findOne({ id: userId });

  // Enhanced data (optional)
  if (FeatureFlags.isEnabled("user-analytics")) {
    try {
      user.analytics = await analyticsService.getUserAnalytics(userId, {
        timeout: 1000,
      });
    } catch (error) {
      // Degrade gracefully: Skip analytics if unavailable
      console.warn("Analytics unavailable, continuing without");
    }
  }

  return user;
}
```

## Fallback Strategies

### Cached Data Fallback

```typescript
async function getWeather(city: string) {
  const cacheKey = `weather:${city}`;

  try {
    const weather = await weatherAPI.getCurrent(city);
    await cache.set(cacheKey, weather, { ttl: 3600 });
    return weather;
  } catch (error) {
    // Fallback to cached data (even if stale)
    const cached = await cache.get(cacheKey);
    if (cached) {
      return { ...cached, stale: true };
    }
    throw new Error("Weather data unavailable");
  }
}
```

### Default/Static Fallback

```typescript
async function getUserPreferences(userId: string) {
  try {
    return await db.preferences.findOne({ userId });
  } catch (error) {
    // Return sensible defaults
    return {
      theme: "light",
      language: "en",
      notifications: true,
    };
  }
}
```

### Alternative Service Fallback

```typescript
async function sendEmail(to: string, subject: string, body: string) {
  try {
    await primaryEmailService.send({ to, subject, body });
  } catch (error) {
    console.warn("Primary email service failed, using backup");
    try {
      await backupEmailService.send({ to, subject, body });
    } catch (error2) {
      // Queue for later retry
      await emailQueue.add({ to, subject, body });
    }
  }
}
```

## Combining Patterns

**Full resilience stack**:

```typescript
import CircuitBreaker from "opossum";
import pLimit from "p-limit";

// 1. Bulkhead: Limit concurrent requests
const limit = pLimit(10);

// 2. Circuit breaker with fallback
const breaker = new CircuitBreaker(callExternalAPI, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

breaker.fallback(() => getCachedData());

// 3. Retry with backoff
async function resilientAPICall() {
  return await limit(() => retryWithBackoff(() => breaker.fire()));
}
```

## Best Practices

- Set explicit timeouts aligned to SLAs; avoid indefinite waits
- Use exponential backoff with jitter; cap retries and total time
- Apply circuit breakers around unstable dependencies; monitor states
- Isolate resources with bulkheads; separate pools for critical vs. non-critical paths
- Enforce rate limits; use distributed limiting for multi-node deployments
- Implement layered fallbacks; prefer cached, defaults, and alternative services
- Instrument and observe: emit metrics, logs, and alerts for resilience events

## Anti-Patterns

- Infinite retries or retrying non-idempotent operations without safeguards
- Global shared pools causing cross-service starvation (no bulkheads)
- Missing or overly large timeouts leading to thread exhaustion
- Synchronised retries without jitter (thundering herd)
- Silent failures with no metrics on breaker open/half-open/close events
- Single-point rate limiting on one node in a distributed system

## Scenarios

### External API Resilience

1. Wrap calls with a circuit breaker and fallback to cached data
2. Configure timeouts (connection/read/overall) conservatively
3. Use bounded retries with exponential backoff + jitter
4. Emit metrics on breaker events; alert on prolonged OPEN state

### Database Overload Protection

1. Separate critical and analytics workloads via connection pool bulkheads
2. Apply query timeouts and lock timeouts (e.g., PostgreSQL `statement_timeout`)
3. Rate limit high-cost endpoints; shed load under pressure
4. Monitor queue depths and saturation; trigger autoscaling if applicable

### Graceful Degradation for Recommendations

1. Primary: ML service → timeout-limited call
2. Fallback 1: Rule-based recommendations
3. Fallback 2: Cached/stale data
4. Fallback 3: Static popular items + feature flags to disable optional features

### Distributed Rate Limiting

1. Use Redis sorted-set sliding window for multi-instance accuracy
2. Return `429` with retry-after; log and metric increments
3. Combine with token bucket for burst absorption; tune capacity/refill
4. Apply per-user and per-IP keys to reduce abuse

## Tools & Techniques

- Java: Resilience4j (circuit breaker, bulkhead, rate limiter)
- Node.js: `opossum` (CB), `axios-retry` (retry), `p-limit` (bulkhead), `express-rate-limit`
- .NET: Polly (retry, CB, timeout)
- Infra: Redis for distributed rate limiting; service mesh (Istio) for timeouts/retries
- Observability: Prometheus/Grafana metrics, structured logs, alerts on breaker states

## Quick Reference

```typescript
// Circuit breaker
const breaker = new CircuitBreaker(fn, { timeout: 3000 });
await breaker.fire();

// Retry with backoff + jitter
await retryWithBackoff(fn, 3, 1000, 30000);

// Rate limiting
const limiter = rateLimit({ windowMs: 60000, max: 100 });
app.use(limiter);

// Bulkhead
const limit = pLimit(10);
await limit(() => fn());

// Timeout (fetch)
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
await fetch(url, { signal: controller.signal });
```

## Conclusion

Resilient systems fail fast, retry responsibly, time-box operations, degrade gracefully, and limit blast radius. Combine circuit breakers, backoff with jitter, timeouts, bulkheads, and rate limiting—instrumented with clear metrics—to prevent cascades and keep services dependable under failure.

---

**Related Skills**: [load-testing](../load-testing/SKILL.md) | [chaos-engineering](../chaos-engineering/SKILL.md) | [observability](../observability/SKILL.md)
