# Examples

## k6 (Recommended)

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

### Breaking Point Analysis (Stress Test)
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

## Artillery

### Config File
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

## Gatling (Scala)

### Example Simulation
```scala
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BasicSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("https://api.example.com")
    .acceptHeader("application/json")

  val scn = scenario("User Journey")
    .exec(http("Get Homepage").get("/").check(status.is(200)))
    .pause(2)
    .exec(http("Get Products").get("/products").check(status.is(200)))

  setUp(
    scn.inject(
      rampUsers(100) during (2.minutes),
      constantUsersPerSec(50) during (5.minutes)
    )
  ).protocols(httpProtocol)
}
```

## CI/CD Integration (GitHub Actions)
```yaml
name: Performance Tests
on: [pull_request]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
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
```
