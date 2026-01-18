# Load Testing

> **Category**: Performance & Reliability  
> **Audience**: Performance engineers, SREs, backend developers  
> **Prerequisites**: Understanding of HTTP, performance metrics  
> **Complexity**: Intermediate to Advanced

## Overview

Load testing validates that your system can handle expected and peak traffic while meeting performance requirements. This skill covers load testing with k6, Artillery, and Gatling; test scenario design (ramp-up, spike, soak); capacity planning; performance regression detection; breaking point analysis; and cost optimization through load testing.

## Why Load Test?

**Without load testing**:

- "It works on my machine" → fails in production under load
- No idea of system capacity
- Discover scaling issues after launch

**With load testing**:

- Know exact capacity (e.g., "handles 10k req/s at p95 < 500ms")
- Identify bottlenecks before production
- Validate auto-scaling configuration
- Cost optimization by right-sizing infrastructure

## Test Types

### 1. Load Test (Sustained Traffic)

Validates system under expected load.

```
Requests/sec
    ^
500 |     ┌─────────────────┐
    |     │                 │
    |     │  Steady state   │
250 |    ╱                  ╲
    |   ╱                    ╲
  0 |──┴──────────────────────┴──> Time
       5min     10min      15min
```

**Goal**: Verify system meets SLAs under normal traffic

### 2. Stress Test (Breaking Point)

Gradually increase load until system fails.

```
Requests/sec
    ^
    |                    ╱│ CRASH!
    |                  ╱  │
    |                ╱    │
    |              ╱      │
    |            ╱        │
    |          ╱          │
    |        ╱            │
    |      ╱              │
  0 |────┴────────────────┴──> Time
      Find breaking point
```

**Goal**: Discover maximum capacity and failure modes

### 3. Spike Test (Sudden Traffic Surge)

Sudden increase in traffic.

```
Requests/sec
    ^
    |          ┌──┐
    |          │  │
    |          │  │
500 |────────┬─┘  └─┬────────
    |        │      │
    |        │      │
  0 |────────┴──────┴────────> Time

     Black Friday flash sale
```

**Goal**: Verify system handles sudden spikes

### 4. Soak Test (Endurance)

Sustained load over extended period (hours/days).

```
Requests/sec
    ^
500 |──────────────────────────────
    |  Sustained for 24+ hours
    |  (Memory leaks, resource
    |   exhaustion, DB connections)
  0 |──────────────────────────────> Time
        6h    12h    18h    24h
```

**Goal**: Detect memory leaks, resource exhaustion

## k6 (Recommended)

### Installation

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

### Basic Load Test

```javascript
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"], // Error rate < 1%
  },
};

export default function () {
  const response = http.get("https://api.example.com/users");

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // Think time between requests
}
```

**Run test**:

```bash
k6 run load-test.js

# Output:
#   scenarios: (100.00%) 1 scenario, 100 max VUs, 9m30s max duration
#
#   execution: local
#      script: load-test.js
#      output: -
#
#   checks.........................: 99.87% ✓ 53921  ✗ 70
#   data_received..................: 42 MB  78 kB/s
#   data_sent......................: 5.3 MB 9.8 kB/s
#   http_req_blocked...............: avg=1.23ms  min=1µs   med=3µs    max=234ms  p(95)=5ms
#   http_req_connecting............: avg=412µs   min=0s    med=0s     max=123ms  p(95)=1.2ms
#   http_req_duration..............: avg=324ms   min=201ms med=289ms  max=1.2s   p(95)=456ms ✓
#   http_req_failed................: 0.12%  ✓ 70    ✗ 53921 ✓
#   http_req_receiving.............: avg=234µs   min=12µs  med=201µs  max=5ms    p(95)=567µs
#   http_reqs......................: 53991  100.5/s
#   vus............................: 100    min=0    max=100
```

### Realistic Scenarios

**User journey with multiple endpoints**

```javascript
import http from "k6/http";
import { check, group, sleep } from "k6";

export default function () {
  group("User Login", () => {
    const loginRes = http.post("https://api.example.com/auth/login", {
      email: "user@example.com",
      password: "password123",
    });

    check(loginRes, { "login successful": (r) => r.status === 200 });

    const token = loginRes.json("token");
    const headers = { Authorization: `Bearer ${token}` };

    sleep(1);

    group("View Dashboard", () => {
      const dashRes = http.get("https://api.example.com/dashboard", {
        headers,
      });
      check(dashRes, { "dashboard loaded": (r) => r.status === 200 });
    });

    sleep(2);

    group("Create Post", () => {
      const postRes = http.post(
        "https://api.example.com/posts",
        JSON.stringify({ title: "Test", content: "Load test" }),
        { headers: { ...headers, "Content-Type": "application/json" } },
      );
      check(postRes, { "post created": (r) => r.status === 201 });
    });
  });

  sleep(5); // Think time
}
```

### Data-Driven Testing

```javascript
import http from "k6/http";
import { SharedArray } from "k6/data";

// Load test data (shared across VUs)
const users = new SharedArray("users", function () {
  return JSON.parse(open("./users.json"));
});

export default function () {
  const user = users[__VU % users.length]; // Round-robin user selection

  const response = http.post("https://api.example.com/login", {
    email: user.email,
    password: user.password,
  });

  check(response, { "login successful": (r) => r.status === 200 });
}
```

### Custom Metrics

```javascript
import { Counter, Trend, Rate } from 'k6/metrics';

const successfulOrders = new Counter('successful_orders');
const orderDuration = new Trend('order_duration');
const errorRate = new Rate('error_rate');

export default function () {
  const start = Date.now();

  const response = http.post('https://api.example.com/orders', {...});

  const duration = Date.now() - start;
  orderDuration.add(duration);

  if (response.status === 201) {
    successfulOrders.add(1);
    errorRate.add(0);
  } else {
    errorRate.add(1);
  }
}
```

## Artillery

### Installation & Basic Test

```bash
npm install -g artillery

# Quick test
artillery quick --count 10 --num 100 https://api.example.com
```

**Config file (config.yml)**

```yaml
config:
  target: "https://api.example.com"
  phases:
    - duration: 60
      arrivalRate: 10 # 10 new users per second
      rampTo: 50 # Ramp up to 50 users/sec
    - duration: 120
      arrivalRate: 50 # Sustain 50 users/sec
  http:
    timeout: 10
scenarios:
  - name: "Browse and purchase"
    flow:
      - get:
          url: "/products"
      - think: 2
      - post:
          url: "/cart"
          json:
            productId: "{{ $randomString() }}"
            quantity: 1
      - think: 1
      - post:
          url: "/checkout"
          json:
            paymentMethod: "credit_card"
```

**Run**:

```bash
artillery run config.yml

# With custom environment
artillery run -e production config.yml

# Generate HTML report
artillery run config.yml --output results.json
artillery report results.json
```

## Gatling (Scala/Java)

### Example Simulation

```scala
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BasicSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("https://api.example.com")
    .acceptHeader("application/json")
    .userAgentHeader("Gatling Load Test")

  val scn = scenario("User Journey")
    .exec(
      http("Get Homepage")
        .get("/")
        .check(status.is(200))
    )
    .pause(2)
    .exec(
      http("Get Products")
        .get("/products")
        .check(status.is(200))
        .check(jsonPath("$[*].id").findAll.saveAs("productIds"))
    )
    .pause(1)
    .exec(
      http("Add to Cart")
        .post("/cart")
        .body(StringBody("""{"productId":"${productIds(0)}","quantity":1}"""))
        .asJson
        .check(status.is(201))
    )

  setUp(
    scn.inject(
      rampUsers(100) during (2.minutes),
      constantUsersPerSec(50) during (5.minutes)
    )
  ).protocols(httpProtocol)
    .assertions(
      global.responseTime.percentile(95).lt(500),
      global.successfulRequests.percent.gt(99)
    )
}
```

**Run**:

```bash
mvn gatling:test
```

## Test Scenario Design

### Ramp-Up Pattern

```javascript
// k6: Gradual increase
export const options = {
  stages: [
    { duration: "5m", target: 50 },
    { duration: "10m", target: 100 },
    { duration: "5m", target: 200 },
    { duration: "10m", target: 200 },
    { duration: "5m", target: 0 },
  ],
};
```

**Use case**: Normal traffic growth, validate auto-scaling

### Spike Pattern

```javascript
// k6: Sudden spike
export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Normal
    { duration: "30s", target: 500 }, // Sudden spike!
    { duration: "3m", target: 500 }, // Sustain
    { duration: "1m", target: 50 }, // Back to normal
    { duration: "1m", target: 0 },
  ],
};
```

**Use case**: Marketing campaign, viral content, DDoS simulation

### Soak Pattern

```javascript
// k6: Extended duration
export const options = {
  stages: [
    { duration: "5m", target: 100 },
    { duration: "24h", target: 100 }, // Run for 24 hours
    { duration: "5m", target: 0 },
  ],
};
```

**Use case**: Memory leak detection, connection pool exhaustion

## Capacity Planning

### Determining Capacity

**1. Run load test with increasing load**

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 400 },
    { duration: "2m", target: 800 }, // Until system degrades
  ],
};
```

**2. Analyze results**

```
Load (VUs) | RPS  | p95 Latency | Error Rate
-----------|------|-------------|------------
50         | 500  | 150ms       | 0%
100        | 1000 | 200ms       | 0%
200        | 2000 | 350ms       | 0.1%
400        | 3800 | 650ms       | 2%    ← Degradation starts
800        | 4200 | 1500ms      | 15%   ← Breaking point
```

**3. Determine safe capacity**

```
Maximum capacity: 3800 req/s (at 400 VUs)
Safe operating capacity: 2500 req/s (65% of max, leaves headroom)
```

### Forecasting Infrastructure Needs

```python
# Calculate required instances

current_traffic = 1000  # req/s
peak_traffic = 5000     # req/s (expected)
capacity_per_instance = 500  # req/s
safety_margin = 0.3  # 30% headroom

required_instances = (peak_traffic / capacity_per_instance) * (1 + safety_margin)
# = (5000 / 500) * 1.3 = 13 instances
```

## Performance Regression Detection

### Baseline Comparison

**1. Establish baseline**

```bash
# Version 1.0
k6 run load-test.js --out json=baseline.json

# Extract p95 latency
jq '.metrics.http_req_duration.values["p(95)"]' baseline.json
# Output: 350
```

**2. Test new version**

```bash
# Version 1.1
k6 run load-test.js --out json=current.json

jq '.metrics.http_req_duration.values["p(95)"]' current.json
# Output: 520 (48% slower!)
```

**3. Automated regression check**

```bash
#!/bin/bash

BASELINE_P95=$(jq '.metrics.http_req_duration.values["p(95)"]' baseline.json)
CURRENT_P95=$(jq '.metrics.http_req_duration.values["p(95)"]' current.json)

THRESHOLD=1.1  # Allow 10% regression

if (( $(echo "$CURRENT_P95 > $BASELINE_P95 * $THRESHOLD" | bc -l) )); then
  echo "❌ Performance regression detected!"
  echo "Baseline: ${BASELINE_P95}ms, Current: ${CURRENT_P95}ms"
  exit 1
else
  echo "✅ Performance acceptable"
fi
```

### CI/CD Integration

**GitHub Actions**

```yaml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start application
        run: |
          docker-compose up -d
          sleep 30  # Wait for app to be ready

      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run load test
        run: k6 run tests/load-test.js --out json=results.json

      - name: Check for regression
        run: node scripts/check-regression.js results.json

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results.json
```

## Breaking Point Analysis

### Finding the Breaking Point

```javascript
// k6: Stress test until failure
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 400 },
    { duration: "2m", target: 800 },
    { duration: "2m", target: 1600 },
    { duration: "2m", target: 3200 }, // Keep doubling until crash
  ],
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.05", abortOnFail: true }], // Stop if error rate > 5%
  },
};

export default function () {
  const res = http.get("https://api.example.com/health");
  check(res, { "status is 200": (r) => r.status === 200 });
}
```

**Analyze failure mode**:

```
Breaking point: 2400 VUs (12,000 req/s)

Symptoms:
- Database connection pool exhausted
- CPU at 100%
- Response times > 5s
- Error rate 30%

Bottleneck: Database (max_connections=100)
```

**Fix and re-test**:

```sql
-- Increase connection pool
ALTER SYSTEM SET max_connections = 500;

-- Add read replicas
-- Scale database vertically
```

## Cost Optimization

### Right-Sizing Infrastructure

**Scenario**: Over-provisioned application

```
Current setup:
- 10 instances (c5.2xlarge) @ $0.34/hr = $3.40/hr
- Monthly cost: $2,448

Load test results:
- Peak traffic: 2000 req/s
- Capacity per instance: 500 req/s
- Required: 4 instances (with 2x headroom)

Optimized setup:
- 4 instances (c5.2xlarge) @ $0.34/hr = $1.36/hr
- Monthly savings: $1,469 (60% reduction)
```

### Auto-Scaling Validation

```javascript
// k6: Validate auto-scaling triggers
export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Below threshold
    { duration: "1m", target: 200 }, // Trigger scale-up
    { duration: "5m", target: 200 }, // Verify new instances online
    { duration: "1m", target: 50 }, // Trigger scale-down
    { duration: "5m", target: 50 }, // Verify instances terminated
  ],
};
```

**Monitor during test**:

```bash
# Watch instance count
watch -n 5 'kubectl get pods | grep myapp | wc -l'

# Expected:
# Time 0m: 2 pods
# Time 3m: 5 pods (scaled up)
# Time 9m: 2 pods (scaled down)
```

## Distributed Load Generation

### Multiple Load Zones

**k6 Cloud**

```javascript
export const options = {
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 50 },
        "amazon:eu:dublin": { loadZone: "amazon:eu:dublin", percent: 30 },
        "amazon:ap:tokyo": { loadZone: "amazon:ap:tokyo", percent: 20 },
      },
    },
  },
};
```

**Self-Hosted (Docker Swarm)**

```bash
# Deploy k6 workers across multiple nodes
docker service create \
  --name k6-worker \
  --replicas 10 \
  --constraint 'node.labels.region==us-east' \
  grafana/k6 run - < load-test.js
```

## Best Practices

### ✅ DO

1. **Test in production-like environment**

```yaml
# Same infrastructure, same data volume, same configuration
staging:
  instances: 5
  database: production-clone
  redis: production-config
```

2. **Ramp up gradually**

```javascript
// ✅ Good: Gradual ramp
{ duration: '5m', target: 1000 }

// ❌ Bad: Instant spike (unrealistic)
{ duration: '1s', target: 1000 }
```

3. **Include think time**

```javascript
// Realistic user behavior
http.get('/products');
sleep(2);  // User reads page
http.get('/products/123');
sleep(5);  // User reviews product
http.post('/cart', {...});
```

4. **Monitor system metrics during tests**

```bash
# CPU, memory, disk I/O, network, database connections
kubectl top pods
watch 'psql -c "SELECT count(*) FROM pg_stat_activity"'
```

### ❌ DON'T

1. **Don't test production without permission**

```
❌ Surprise load test on production
✅ Scheduled test with stakeholder approval
```

2. **Don't ignore outliers**

```
Median: 200ms  ← Looks good
p95: 500ms
p99: 5000ms    ← Real user experience!
```

3. **Don't test with empty caches**

```
❌ Cold start: No caches, no connections
✅ Warm-up: Prime caches, establish connections
```

## Quick Reference

```bash
# k6: Basic load test
k6 run load-test.js

# k6: Cloud execution
k6 cloud load-test.js

# Artillery: Quick test
artillery quick --count 10 --num 100 https://api.example.com

# Artillery: With config
artillery run config.yml --output results.json
artillery report results.json

# Gatling: Maven
mvn gatling:test

# Check results
jq '.metrics.http_req_duration.values' results.json
```

## Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Gatling Documentation](https://gatling.io/docs/)
- [Performance Testing Guidance](https://martinfowler.com/articles/practical-test-pyramid.html#PerformanceTests)
- [Google SRE Book - Load Testing](https://sre.google/workbook/non-abstract-large-system-design/)

---

**Related Skills**: [profiling](../profiling/SKILL.md) | [resiliency-patterns](../resiliency-patterns/SKILL.md) | [observability](../observability/SKILL.md)
