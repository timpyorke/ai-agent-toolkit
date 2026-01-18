# Test Strategy

> **Category**: Testing & Quality  
> **Audience**: Tech leads, QA engineers, developers  
> **Prerequisites**: Understanding of unit/integration/E2E testing  
> **Complexity**: Intermediate to Advanced

## Overview

A comprehensive test strategy defines what to test, at which layers, with what coverage goals, and how to maintain test quality over time. This skill covers meaningful coverage metrics, flaky test prevention, test data management, testing in production, and performance regression detection—enabling teams to ship confidently without over-testing or under-testing.

## What to Test at Each Layer

### The Testing Pyramid/Trophy Strategy

```
Layer          | What to Test                    | % of Tests | Speed    |
---------------|---------------------------------|------------|----------|
Static         | Types, linting, formatting      | Foundation | Instant  |
Unit           | Pure functions, algorithms      | 40-50%     | Fast     |
Integration    | API routes, DB queries, services| 30-40%     | Medium   |
E2E            | Critical user flows             | 10-20%     | Slow     |
Manual/Explor. | UX, edge cases, security        | Continuous | Slowest  |
```

### Unit Test Candidates

**✅ SHOULD test**:

- Pure functions and business logic
- Complex algorithms and calculations
- Edge cases and boundary conditions
- Input validation logic
- State transformations

```typescript
// ✅ Good unit test candidate
function calculateDiscount(price: number, loyaltyPoints: number): number {
  if (price < 0 || loyaltyPoints < 0) throw new Error("Invalid input");
  if (loyaltyPoints >= 1000) return price * 0.9;
  if (loyaltyPoints >= 500) return price * 0.95;
  return price;
}

test("applies 10% discount for 1000+ points", () => {
  expect(calculateDiscount(100, 1000)).toBe(90);
});
```

**❌ DON'T test**:

- Trivial getters/setters
- Framework internals
- External libraries
- Configuration files
- Auto-generated code

```typescript
// ❌ Bad unit test (too trivial)
class User {
  getName() {
    return this.name;
  }
}

test("getName returns name", () => {
  const user = new User("Alice");
  expect(user.getName()).toBe("Alice"); // No value
});
```

### Integration Test Candidates

**✅ SHOULD test**:

- API endpoints (request → response)
- Database queries and transactions
- Message queue handlers
- Authentication/authorization flows
- Service-to-service communication

```typescript
// ✅ Good integration test
describe("POST /api/orders", () => {
  test("creates order and reduces inventory", async () => {
    await db.products.insert({ id: "p1", stock: 10 });

    const response = await request(app)
      .post("/api/orders")
      .send({ productId: "p1", quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();

    const product = await db.products.findOne({ id: "p1" });
    expect(product.stock).toBe(8);
  });
});
```

### E2E Test Candidates

**✅ SHOULD test**:

- Critical user journeys (checkout, signup, payment)
- Cross-cutting concerns (authentication + authorization + business logic)
- Multi-page workflows
- Browser-specific behavior

**❌ DON'T test with E2E**:

- Every possible edge case (use unit tests)
- Non-critical flows
- Already covered by integration tests

```typescript
// ✅ Good E2E test: Critical user journey
test("user can purchase product end-to-end", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-test="product-1"]');
  await page.click('[data-test="add-to-cart"]');
  await page.click('[data-test="checkout"]');
  await page.fill('[data-test="email"]', "buyer@example.com");
  await page.fill('[data-test="card-number"]', "4242424242424242");
  await page.click('[data-test="place-order"]');

  await expect(page.locator('[data-test="order-confirmation"]')).toBeVisible();
});
```

## Coverage Goals

### Meaningful Coverage (Not 100%)

**Target ranges**:

- **Statement coverage**: 70-85%
- **Branch coverage**: 60-80%
- **Function coverage**: 75-90%
- **Critical paths**: 100%

**Focus on**:

```typescript
// Critical business logic: 100% coverage
function processPayment(amount: number, currency: string): PaymentResult {
  // Every branch should be tested
  if (!isValidCurrency(currency)) throw new Error("Invalid currency");
  if (amount <= 0) throw new Error("Amount must be positive");
  if (amount > MAX_TRANSACTION) throw new Error("Amount exceeds limit");

  return chargeCard(amount, currency);
}
```

**Don't obsess over**:

```typescript
// Trivial code: Coverage not critical
class Config {
  private static instance: Config;

  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config(); // Untested singleton logic is fine
    }
    return Config.instance;
  }
}
```

### Coverage Configuration

**Jest**

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/generated/**",
  ],
  coverageThresholds: {
    global: {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75,
    },
    // Critical modules require higher coverage
    "./src/payment/**/*.ts": {
      statements: 95,
      branches: 90,
      functions: 95,
    },
  },
};
```

**Vitest**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/types/**"],
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 75,
        lines: 75,
      },
    },
  },
});
```

## Flaky Test Prevention

### Root Causes of Flakiness

1. **Race conditions**
2. **Non-deterministic data** (random values, timestamps)
3. **Shared state between tests**
4. **External dependencies** (network, filesystem)
5. **Timing issues** (setTimeout, animations)

### Solutions

**1. Avoid Race Conditions**

```typescript
// ❌ Flaky: Race condition
test("fetches user data", async () => {
  fetchUser(1);
  // Test might pass/fail depending on timing
  expect(userStore.user).toBeDefined();
});

// ✅ Stable: Wait for async operation
test("fetches user data", async () => {
  await fetchUser(1);
  expect(userStore.user).toBeDefined();
});
```

**2. Use Deterministic Data**

```typescript
// ❌ Flaky: Random data
test("generates invoice ID", () => {
  const invoice = createInvoice();
  expect(invoice.id).toBe(Math.random().toString()); // Fails every time
});

// ✅ Stable: Deterministic data
test("generates invoice ID", () => {
  const mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.5);
  const invoice = createInvoice();
  expect(invoice.id).toBe("0.5");
  mockRandom.mockRestore();
});

// ✅ Better: Inject ID generator
test("generates invoice ID", () => {
  const idGen = { generate: () => "test-id-123" };
  const invoice = createInvoice(idGen);
  expect(invoice.id).toBe("test-id-123");
});
```

**3. Isolate Test State**

```typescript
// ❌ Flaky: Shared state
let userId: string;

test("creates user", async () => {
  userId = await createUser("alice@example.com");
  expect(userId).toBeDefined();
});

test("updates user", async () => {
  await updateUser(userId, { name: "Alice" }); // Fails if previous test skipped
});

// ✅ Stable: Independent tests
describe("User operations", () => {
  let userId: string;

  beforeEach(async () => {
    userId = await createUser("alice@example.com");
  });

  test("updates user", async () => {
    await updateUser(userId, { name: "Alice" });
    const user = await getUser(userId);
    expect(user.name).toBe("Alice");
  });
});
```

**4. Mock External Dependencies**

```typescript
// ❌ Flaky: Real API call
test("fetches weather data", async () => {
  const weather = await weatherService.getCurrent("New York");
  expect(weather.temperature).toBeGreaterThan(0); // Fails if API is down
});

// ✅ Stable: Mocked
test("fetches weather data", async () => {
  jest.spyOn(weatherService, "getCurrent").mockResolvedValue({
    temperature: 72,
    condition: "sunny",
  });

  const weather = await weatherService.getCurrent("New York");
  expect(weather.temperature).toBe(72);
});
```

**5. Use Fake Timers**

```typescript
// ❌ Flaky: Real timeouts
test("debounces function", async () => {
  debouncedFn();
  await new Promise((resolve) => setTimeout(resolve, 500)); // Unreliable
  expect(mockFn).toHaveBeenCalled();
});

// ✅ Stable: Fake timers
test("debounces function", () => {
  jest.useFakeTimers();
  debouncedFn();
  jest.advanceTimersByTime(500);
  expect(mockFn).toHaveBeenCalled();
  jest.useRealTimers();
});
```

### Detecting Flaky Tests

**Run tests multiple times**

```bash
# Run test suite 100 times
for i in {1..100}; do npm test || break; done

# Jest repeat
npx jest --testNamePattern="flaky test" --repeatEach=50

# Playwright retry
npx playwright test --retries=3
```

**CI/CD Detection**

```yaml
# GitHub Actions
- name: Test with retries
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm test
```

## Test Data Management

### Strategies

**1. Database Transactions (Rollback after test)**

```typescript
describe("User repository", () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await db.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test("creates user", async () => {
    const user = await userRepo.create(
      { email: "test@example.com" },
      transaction,
    );
    expect(user.id).toBeDefined();
    // Rolled back after test
  });
});
```

**2. Test Database per Test**

```typescript
beforeEach(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterEach(async () => {
  await db.raw("DROP SCHEMA public CASCADE");
  await db.raw("CREATE SCHEMA public");
});
```

**3. Factory Pattern**

```typescript
class UserFactory {
  async create(overrides?: Partial<User>): Promise<User> {
    return await db.users.insert({
      email: `user-${Date.now()}@example.com`,
      name: "Test User",
      createdAt: new Date(),
      ...overrides,
    });
  }
}

const userFactory = new UserFactory();

test("admin can delete users", async () => {
  const admin = await userFactory.create({ role: "admin" });
  const user = await userFactory.create();

  await deleteUser(admin, user.id);
  expect(await getUser(user.id)).toBeNull();
});
```

**4. Fixtures with Unique IDs**

```typescript
// fixtures/seed.ts
export async function seedTestData(db: Database) {
  const timestamp = Date.now();

  await db.users.insertMany([
    { id: `user-${timestamp}-1`, email: `user1-${timestamp}@example.com` },
    { id: `user-${timestamp}-2`, email: `user2-${timestamp}@example.com` },
  ]);

  return { timestamp };
}
```

### Cleanup Strategies

**Option A: After each test**

```typescript
afterEach(async () => {
  await db.users.deleteMany({});
  await redis.flushdb();
});
```

**Option B: Before each test**

```typescript
beforeEach(async () => {
  await db.users.deleteMany({});
  // Advantage: See test data in DB after failure
});
```

**Option C: After all tests (faster, but riskier)**

```typescript
afterAll(async () => {
  await db.dropDatabase();
});
```

## Testing in Production

### Feature Flags

```typescript
// Gradual rollout with testing
if (featureFlags.isEnabled("new-checkout", { userId: user.id })) {
  return renderNewCheckout();
} else {
  return renderOldCheckout();
}

// Test both paths
test("new checkout flow", () => {
  featureFlags.enable("new-checkout");
  expect(renderCheckout()).toContain("new-checkout-button");
});

test("old checkout flow (fallback)", () => {
  featureFlags.disable("new-checkout");
  expect(renderCheckout()).toContain("old-checkout-button");
});
```

### Canary Testing

```yaml
# Kubernetes canary deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-v2-canary
spec:
  replicas: 1 # 10% of traffic
  selector:
    matchLabels:
      app: myapp
      version: v2
```

**Automated canary validation**

```typescript
// Synthetic monitoring
async function runCanaryTests() {
  const results = await Promise.all([
    testCheckoutFlow(),
    testSearchFunctionality(),
    testUserRegistration(),
  ]);

  if (results.some((r) => !r.success)) {
    await rollback();
    await alertTeam("Canary tests failed");
  }
}

setInterval(runCanaryTests, 60000); // Every minute
```

### Synthetic Monitoring

```typescript
// Datadog Synthetic Test
const syntheticTest = {
  name: "Critical User Journey",
  type: "browser",
  request: {
    url: "https://myapp.com",
    method: "GET",
  },
  assertions: [
    { type: "statusCode", operator: "is", target: 200 },
    { type: "responseTime", operator: "lessThan", target: 2000 },
  ],
  locations: ["aws:us-east-1", "aws:eu-west-1"],
  frequency: 300, // 5 minutes
};
```

### Shadow Testing

```typescript
// Send traffic to both old and new implementations
async function processPayment(payment: Payment) {
  const primaryResult = await oldPaymentService.process(payment);

  // Shadow test new implementation (don't use result)
  newPaymentService
    .process(payment)
    .then((shadowResult) => {
      if (!resultsMatch(primaryResult, shadowResult)) {
        logger.warn("Shadow test mismatch", { primaryResult, shadowResult });
      }
    })
    .catch((err) => {
      logger.error("Shadow test error", err);
    });

  return primaryResult; // Use old implementation
}
```

## Performance Regression Tests

### Benchmark Tests

```typescript
import { performance } from "perf_hooks";

describe("Performance benchmarks", () => {
  test("search completes within 100ms", async () => {
    const start = performance.now();

    await searchService.search("typescript");

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  test("handles 1000 items without performance degradation", () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

    const start = performance.now();
    const sorted = sortItems(items);
    const duration = performance.now() - start;

    expect(sorted).toHaveLength(1000);
    expect(duration).toBeLessThan(50); // Should be O(n log n)
  });
});
```

### Load Testing as Tests

```typescript
// k6 load test
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% under 500ms
    http_req_failed: ["rate<0.01"], // Error rate < 1%
  },
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 100 },
    { duration: "1m", target: 0 },
  ],
};

export default function () {
  const res = http.get("https://api.example.com/products");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### CI/CD Performance Checks

```yaml
# GitHub Actions
- name: Performance Tests
  run: npm run test:performance

- name: Compare with baseline
  run: |
    node scripts/compare-performance.js \
      --baseline=performance-baseline.json \
      --current=performance-results.json \
      --threshold=10  # Fail if 10% slower
```

**Baseline comparison script**

```javascript
const baseline = require("./performance-baseline.json");
const current = require("./performance-results.json");

const threshold = parseFloat(process.argv[3]);

for (const [testName, baselineDuration] of Object.entries(baseline)) {
  const currentDuration = current[testName];
  const percentChange =
    ((currentDuration - baselineDuration) / baselineDuration) * 100;

  if (percentChange > threshold) {
    console.error(`❌ ${testName}: ${percentChange.toFixed(2)}% slower`);
    process.exit(1);
  }
}

console.log("✅ All performance tests within threshold");
```

## Test Maintenance

### Refactoring Tests

**Extract test helpers**

```typescript
// Before: Duplicated setup
test("user can post comment", async () => {
  const user = await db.users.create({ email: "test@example.com" });
  await login(user);
  const post = await db.posts.create({ authorId: user.id });
  // ... test logic
});

test("user can edit comment", async () => {
  const user = await db.users.create({ email: "test@example.com" });
  await login(user);
  const post = await db.posts.create({ authorId: user.id });
  // ... test logic
});

// After: Shared helper
async function setupUserAndPost() {
  const user = await db.users.create({ email: "test@example.com" });
  await login(user);
  const post = await db.posts.create({ authorId: user.id });
  return { user, post };
}

test("user can post comment", async () => {
  const { user, post } = await setupUserAndPost();
  // ... test logic
});
```

### Removing Redundant Tests

```typescript
// ❌ Redundant: Already tested in unit tests
test("calculateTotal adds prices", () => {
  expect(calculateTotal([10, 20])).toBe(30);
});

// ✅ Integration test (more valuable)
test("checkout calculates correct total with tax and shipping", async () => {
  const response = await request(app)
    .post("/api/checkout")
    .send({ items: [{ price: 10 }, { price: 20 }], zip: "10001" });

  expect(response.body.subtotal).toBe(30);
  expect(response.body.tax).toBeCloseTo(2.63);
  expect(response.body.shipping).toBe(5);
  expect(response.body.total).toBeCloseTo(37.63);
});
```

## Test Documentation

**Documenting test intent**

```typescript
/**
 * Regression test for bug #1234
 * Issue: Cart total was incorrect when applying multiple discount codes
 * Root cause: Discounts were applied multiplicatively instead of additively
 */
test("applies multiple discount codes correctly", () => {
  const cart = new Cart();
  cart.addItem({ price: 100 });
  cart.applyDiscount("SAVE10"); // 10% off
  cart.applyDiscount("EXTRA5"); // 5% off

  // Should be $100 - $10 - $5 = $85
  // NOT $100 * 0.9 * 0.95 = $85.50
  expect(cart.getTotal()).toBe(85);
});
```

## Best Practices Summary

| Practice                            | Benefit                             |
| ----------------------------------- | ----------------------------------- |
| Test behavior, not implementation   | Tests survive refactoring           |
| Maintain 70-85% coverage            | Balance confidence with maintenance |
| Eliminate flaky tests immediately   | Build trust in test suite           |
| Use transactions for DB tests       | Fast, isolated test data            |
| Test critical paths in production   | Catch issues before users do        |
| Benchmark performance-critical code | Prevent performance regressions     |
| Document non-obvious test intent    | Preserve knowledge for future devs  |

## Quick Reference

```bash
# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- UserService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="payment"

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- --updateSnapshot

# Detect flaky tests
npx jest --testNamePattern="suspicious" --repeatEach=100
```

## Additional Resources

- [Google Testing Blog](https://testing.googleblog.com/)
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Martin Fowler - Testing Strategies](https://martinfowler.com/testing/)
- [Flaky Tests at Google](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html)

---

**Related Skills**: [unit-integration-e2e](../unit-integration-e2e/SKILL.md) | [contract-testing](../contract-testing/SKILL.md) | [ci-cd-pipeline](../ci-cd-pipeline/SKILL.md)
