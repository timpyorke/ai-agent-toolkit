# Examples

## Circuit Breaker (Opossum - Node.js)

```javascript
const CircuitBreaker = require('opossum');

function unstableService() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.8) resolve({ status: "ok" });
    else reject(new Error("Service failure"));
  });
}

const options = {
  timeout: 3000, // Trigger failure if > 3s
  errorThresholdPercentage: 50, // Open if 50% fail
  resetTimeout: 10000 // Retry after 10s
};

const breaker = new CircuitBreaker(unstableService, options);

breaker.fallback(() => ({ status: "degraded", data: "cached" }));

breaker.fire()
  .then(console.log)
  .catch(console.error);
```

## Retry with Semantic Backoff (Custom)

```typescript
async function retryOperation<T>(
    fn: () => Promise<T>, 
    retries = 3, 
    backoff = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (retries === 0) throw e;
        const jitter = Math.random() * 200;
        await new Promise(r => setTimeout(r, backoff + jitter));
        return retryOperation(fn, retries - 1, backoff * 2);
    }
}
```

## Bulkhead (Promise Limit)

```javascript
const pLimit = require('p-limit');

// Isolate concurrency: max 5 requests to Service A
const limitA = pLimit(5);
// Max 10 requests to Service B
const limitB = pLimit(10);

const input = [1, 2, 3, 4, 5, 6, 7];

// Service A overload doesn't block Service B
Promise.all(input.map(i => limitA(() => callServiceA(i))));
Promise.all(input.map(i => limitB(() => callServiceB(i))));
```

## Rate Limiting (Token Bucket)

```typescript
class TokenBucket {
    tokens: number;
    lastFilled: number;
    
    constructor(private capacity: number, private refillRate: number) {
        this.tokens = capacity;
        this.lastFilled = Date.now();
    }

    tryConsume(amount = 1): boolean {
        this.refill();
        if (this.tokens >= amount) {
            this.tokens -= amount;
            return true;
        }
        return false;
    }

    private refill() {
        const now = Date.now();
        const seconds = (now - this.lastFilled) / 1000;
        this.tokens = Math.min(
            this.capacity, 
            this.tokens + (seconds * this.refillRate)
        );
        this.lastFilled = now;
    }
}
```
