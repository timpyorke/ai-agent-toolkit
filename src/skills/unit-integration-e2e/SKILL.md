# Unit, Integration & E2E Testing

> **Category**: Testing & Quality  
> **Audience**: All developers, QA engineers  
> **Prerequisites**: Basic programming knowledge, testing frameworks  
> **Complexity**: Intermediate to Advanced

## Overview

Comprehensive testing strategy covering three critical testing layers: unit tests for isolated components, integration tests for component interactions, and end-to-end tests for complete user workflows. Master the testing pyramid, understand test doubles, and implement effective automated testing across your entire application stack.

## Testing Pyramid vs Trophy

### Testing Pyramid (Traditional)

```
       /\
      /E2E\      ← Few (Slow, Expensive)
     /------\
    /Integr.\   ← Some (Medium speed/cost)
   /----------\
  /   Unit     \ ← Many (Fast, Cheap)
 /--------------\
```

### Testing Trophy (Modern)

```
      /\
     /E2E\       ← Few (Critical paths only)
    /------\
   /Integr.\    ← Most (Focus here)
  /----------\
 / Unit | Static\ ← Many + Linting/Types
/----------------\
```

**Key difference**: Trophy emphasizes integration tests over pure unit tests, reflecting real-world value.

## Unit Testing

### Core Principles

**AAA Pattern (Arrange-Act-Assert)**

```typescript
describe("CartService", () => {
  test("adds item to cart correctly", () => {
    // Arrange
    const cart = new CartService();
    const item = { id: "1", name: "Book", price: 20 };

    // Act
    cart.addItem(item);

    // Assert
    expect(cart.getTotal()).toBe(20);
    expect(cart.getItemCount()).toBe(1);
  });
});
```

**Given-When-Then (BDD Style)**

```typescript
describe("User authentication", () => {
  test("should lock account after 5 failed attempts", () => {
    // Given
    const user = new User({ email: "test@example.com" });
    const authService = new AuthService();

    // When
    for (let i = 0; i < 5; i++) {
      authService.login(user.email, "wrongpassword");
    }

    // Then
    expect(user.isLocked()).toBe(true);
    expect(user.lockReason()).toBe("FAILED_LOGIN_ATTEMPTS");
  });
});
```

### Test Doubles

**Mock**: Full replacement with behavior verification

```typescript
// Mock external API
const mockEmailService = {
  send: jest.fn().mockResolvedValue({ success: true }),
};

test("sends welcome email on signup", async () => {
  const userService = new UserService(mockEmailService);

  await userService.register("user@example.com");

  expect(mockEmailService.send).toHaveBeenCalledWith({
    to: "user@example.com",
    template: "welcome",
  });
});
```

**Stub**: Provides predefined responses

```typescript
// Stub database response
const dbStub = {
  findUser: () => Promise.resolve({ id: 1, name: "Alice" }),
};

test("retrieves user from database", async () => {
  const service = new UserService(dbStub);
  const user = await service.getUser(1);

  expect(user.name).toBe("Alice");
});
```

**Fake**: Working implementation (simpler)

```typescript
// Fake in-memory repository
class FakeUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}

test("creates and retrieves user", async () => {
  const repo = new FakeUserRepository();
  const user = new User({ id: "1", name: "Bob" });

  await repo.save(user);
  const retrieved = await repo.findById("1");

  expect(retrieved?.name).toBe("Bob");
});
```

**Spy**: Records calls without changing behavior

```typescript
test("calls logger on error", () => {
  const logger = { error: jest.fn() };
  const service = new PaymentService(logger);

  service.processPayment(-100); // Invalid amount

  expect(logger.error).toHaveBeenCalledWith(
    expect.stringContaining("Invalid amount"),
  );
});
```

### Snapshot Testing

```typescript
import renderer from 'react-test-renderer';

test('renders UserProfile correctly', () => {
  const user = { name: 'Alice', email: 'alice@example.com' };
  const tree = renderer.create(<UserProfile user={user} />).toJSON();

  expect(tree).toMatchSnapshot();
});

// Update snapshots when intentional changes occur:
// jest --updateSnapshot
```

**When to use snapshots**:

- ✅ UI component structure
- ✅ API response formats
- ✅ Configuration objects
- ❌ Timestamps or random data
- ❌ Complex business logic

## Integration Testing

### Database Integration

**Using Test Containers (Docker)**

```typescript
import { GenericContainer } from "testcontainers";

describe("UserRepository Integration", () => {
  let container: StartedTestContainer;
  let repository: UserRepository;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:15")
      .withEnvironment({ POSTGRES_PASSWORD: "test" })
      .withExposedPorts(5432)
      .start();

    const connectionString = `postgresql://postgres:test@localhost:${container.getMappedPort(5432)}/test`;
    repository = new UserRepository(connectionString);
    await repository.migrate();
  });

  afterAll(async () => {
    await container.stop();
  });

  test("creates user with relationships", async () => {
    const user = await repository.createUser({
      email: "test@example.com",
      profile: { bio: "Test user" },
    });

    expect(user.id).toBeDefined();
    expect(user.profile.bio).toBe("Test user");
  });
});
```

### API Integration

**Testing Express/Fastify endpoints**

```typescript
import request from "supertest";
import { app } from "./app";

describe("POST /api/users", () => {
  test("creates user and returns 201", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "new@example.com", name: "New User" })
      .expect(201);

    expect(response.body).toMatchObject({
      email: "new@example.com",
      name: "New User",
    });
    expect(response.body.id).toBeDefined();
  });

  test("returns 400 for invalid email", async () => {
    await request(app)
      .post("/api/users")
      .send({ email: "invalid", name: "Test" })
      .expect(400);
  });
});
```

### Testing Event Handlers

```typescript
describe("OrderPlaced event handler", () => {
  test("sends confirmation email and updates inventory", async () => {
    const emailService = new FakeEmailService();
    const inventoryService = new FakeInventoryService();
    const handler = new OrderPlacedHandler(emailService, inventoryService);

    const event = {
      orderId: "123",
      userId: "user-1",
      items: [{ productId: "prod-1", quantity: 2 }],
    };

    await handler.handle(event);

    expect(emailService.sentEmails).toHaveLength(1);
    expect(emailService.sentEmails[0].template).toBe("order-confirmation");
    expect(inventoryService.getStock("prod-1")).toBe(8); // Was 10
  });
});
```

## End-to-End Testing

### Playwright Example

**Page Object Model**

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }
}

// tests/auth.spec.ts
test.describe("Authentication", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("failed login shows error", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("user@example.com", "wrongpassword");

    const error = await loginPage.getErrorMessage();
    expect(error).toContain("Invalid credentials");
  });
});
```

### Cypress Example

**Custom Commands**

```typescript
// cypress/support/commands.ts
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit("/login");
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="submit"]').click();
    cy.url().should("include", "/dashboard");
  });
});

// cypress/e2e/checkout.cy.ts
describe("Checkout Flow", () => {
  beforeEach(() => {
    cy.login("test@example.com", "password");
  });

  it("completes purchase successfully", () => {
    cy.visit("/products");
    cy.get('[data-cy="product-1"]').click();
    cy.get('[data-cy="add-to-cart"]').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="checkout"]').click();

    // Fill shipping info
    cy.get('[data-cy="address"]').type("123 Main St");
    cy.get('[data-cy="city"]').type("New York");
    cy.get('[data-cy="zip"]').type("10001");

    // Fill payment (using test card)
    cy.get('[data-cy="card-number"]').type("4242424242424242");
    cy.get('[data-cy="expiry"]').type("12/25");
    cy.get('[data-cy="cvc"]').type("123");

    cy.get('[data-cy="place-order"]').click();

    cy.url().should("include", "/order-confirmation");
    cy.get('[data-cy="order-number"]').should("exist");
  });
});
```

### Visual Regression Testing

**Percy (Playwright)**

```typescript
import { test } from "@playwright/test";
import percySnapshot from "@percy/playwright";

test("homepage looks correct", async ({ page }) => {
  await page.goto("/");
  await percySnapshot(page, "Homepage");
});

test("mobile responsive design", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await percySnapshot(page, "Homepage - Mobile");
});
```

## Parallel Test Execution

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  maxWorkers: "50%", // Use 50% of CPU cores
  testTimeout: 10000,
  projects: [
    {
      displayName: "unit",
      testMatch: ["**/*.test.ts"],
      testPathIgnorePatterns: ["/integration/", "/e2e/"],
    },
    {
      displayName: "integration",
      testMatch: ["**/integration/**/*.test.ts"],
      maxWorkers: 1, // Sequential for DB tests
    },
  ],
};
```

### Playwright Sharding

```bash
# Split tests across 4 machines
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

## Test Data Management

### Fixtures

**TypeScript**

```typescript
// fixtures/users.ts
export const testUsers = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN",
  },
  regularUser: {
    email: "user@example.com",
    password: "user123",
    role: "USER",
  },
};

// Usage
import { testUsers } from "./fixtures/users";

test("admin can delete users", async () => {
  await loginAs(testUsers.admin);
  await deleteUser(testUsers.regularUser.email);
  // ...
});
```

### Factory Pattern

**Factory Bot (inspired by Ruby)**

```typescript
class UserFactory {
  private sequence = 0;

  build(overrides: Partial<User> = {}): User {
    return {
      id: `user-${++this.sequence}`,
      email: `user${this.sequence}@example.com`,
      name: `User ${this.sequence}`,
      createdAt: new Date(),
      ...overrides,
    };
  }

  buildMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}

// Usage
const userFactory = new UserFactory();
const users = userFactory.buildMany(5);
const admin = userFactory.build({ role: "ADMIN" });
```

## Best Practices

### ✅ DO

1. **Test behavior, not implementation**

```typescript
// ✅ Good: Tests behavior
test("shopping cart total updates when item added", () => {
  cart.addItem({ price: 20 });
  expect(cart.getTotal()).toBe(20);
});

// ❌ Bad: Tests implementation detail
test("addItem pushes to items array", () => {
  cart.addItem({ price: 20 });
  expect(cart["items"]).toHaveLength(1); // Private detail
});
```

2. **Use descriptive test names**

```typescript
// ✅ Good
test("rejects orders over $10,000 without manager approval", () => {});

// ❌ Bad
test("test order validation", () => {});
```

3. **One assertion concept per test**

```typescript
// ✅ Good: Focused on one concept
test("creates user with hashed password", async () => {
  const user = await userService.create({ password: "plain123" });
  expect(user.password).not.toBe("plain123");
  expect(await bcrypt.compare("plain123", user.password)).toBe(true);
});

// ❌ Bad: Testing multiple unrelated things
test("user creation", async () => {
  const user = await userService.create({ password: "plain123" });
  expect(user.password).toBeDefined();
  expect(user.email).toContain("@");
  expect(userService.getAll()).toHaveLength(1);
  expect(emailService.send).toHaveBeenCalled();
});
```

4. **Isolate tests (no shared state)**

```typescript
// ✅ Good: Each test is independent
beforeEach(() => {
  database.clear();
  cache.flush();
});

// ❌ Bad: Tests depend on execution order
let userId: string;

test("creates user", () => {
  userId = createUser();
});

test("updates user", () => {
  updateUser(userId); // Breaks if first test fails
});
```

### ❌ DON'T

1. **Don't test external libraries**

```typescript
// ❌ Bad: Testing lodash
test("lodash chunk works", () => {
  expect(_.chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
});
```

2. **Don't use timeouts as assertions**

```typescript
// ❌ Bad: Flaky
test("debounce works", async () => {
  debouncedFunction();
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(spy).not.toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(spy).toHaveBeenCalled();
});

// ✅ Good: Use fake timers
test("debounce works", () => {
  jest.useFakeTimers();
  debouncedFunction();
  jest.advanceTimersByTime(100);
  expect(spy).not.toHaveBeenCalled();
  jest.advanceTimersByTime(400);
  expect(spy).toHaveBeenCalled();
});
```

3. **Don't make tests too DRY**

```typescript
// ❌ Bad: Hard to understand
beforeEach(() => setupComplexScenario());

test("scenario 1", () => {
  expect(thing).toBe(value);
});

// ✅ Good: Explicit setup
test("logged-in user can view dashboard", () => {
  const user = createUser();
  login(user);
  expect(canViewDashboard()).toBe(true);
});
```

## Testing Frameworks

| Framework      | Language   | Best For                            |
| -------------- | ---------- | ----------------------------------- |
| **Jest**       | JS/TS      | Unit + Integration (React default)  |
| **Vitest**     | JS/TS      | Vite projects (faster Jest)         |
| **PyTest**     | Python     | Python unit/integration             |
| **RSpec**      | Ruby       | Rails BDD testing                   |
| **JUnit 5**    | Java       | Java unit/integration               |
| **Playwright** | Multi-lang | Cross-browser E2E                   |
| **Cypress**    | JS         | Web E2E (simpler, browser-only)     |
| **Selenium**   | Multi-lang | Legacy E2E (avoid for new projects) |

## CI/CD Integration

**GitHub Actions Example**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Common Pitfalls

| Pitfall                  | Impact           | Solution                                    |
| ------------------------ | ---------------- | ------------------------------------------- |
| Flaky tests              | CI unreliable    | Avoid timeouts, use deterministic data      |
| Slow test suite          | Dev velocity     | Parallelize, optimize setup/teardown        |
| Testing implementation   | Brittle          | Test behavior/contracts, not internals      |
| No test data cleanup     | Test pollution   | Use transactions, afterEach hooks           |
| Over-mocking             | False confidence | Prefer integration tests for critical paths |
| E2E tests for everything | Maintenance hell | Follow testing pyramid/trophy               |

## Quick Reference

```bash
# Unit tests (fast)
npm run test:unit -- --watch

# Integration tests (medium)
npm run test:integration

# E2E tests (slow)
npm run test:e2e

# All tests with coverage
npm run test:all -- --coverage

# Run specific test file
npm test -- UserService.test.ts

# Update snapshots
npm test -- --updateSnapshot

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library](https://testing-library.com/)
- [TestContainers](https://www.testcontainers.org/)
- [Kent C. Dodds - Testing](https://kentcdodds.com/blog?q=testing)

---

**Related Skills**: [test-strategy](../test-strategy/SKILL.md) | [contract-testing](../contract-testing/SKILL.md) | [property-based-testing](../property-based-testing/SKILL.md)
