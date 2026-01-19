# Examples

## Pact Consumer Tests

**TypeScript (Frontend calling backend API)**

```typescript
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { UserService } from "./UserService";

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  consumer: "frontend-app",
  provider: "user-service",
  dir: "./pacts",
});

describe("User Service Contract", () => {
  test("get user by ID", async () => {
    await provider
      .given("user 123 exists")
      .uponReceiving("a request for user 123")
      .withRequest({
        method: "GET",
        path: "/api/users/123",
        headers: { Accept: "application/json" },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: like({
          id: "123",
          name: "Alice",
          email: "alice@example.com",
          createdAt: "2024-01-15T10:00:00Z",
        }),
      });

    await provider.executeTest(async (mockServer) => {
      const userService = new UserService(mockServer.url);
      const user = await userService.getUser("123");
      expect(user.id).toBe("123");
      expect(user.name).toBe("Alice");
    });
  });
});
```

## Pact Provider Verification

**TypeScript (Backend verifying it satisfies contracts)**

```typescript
import { Verifier } from "@pact-foundation/pact";
import { app } from "./app";
import { setupTestDatabase, teardownTestDatabase } from "./test-utils";

describe("Pact Verification", () => {
  let server: Server;
  const port = 3001;

  beforeAll(async () => {
    await setupTestDatabase();
    server = app.listen(port);
  });

  afterAll(async () => {
    server.close();
    await teardownTestDatabase();
  });

  test("validates the expectations of frontend-app", async () => {
    const verifier = new Verifier({
      provider: "user-service",
      providerBaseUrl: `http://localhost:${port}`,
      pactUrls: ["./pacts/frontend-app-user-service.json"],
      stateHandlers: {
        "user 123 exists": async () => {
          await db.users.create({ id: "123", name: "Alice", email: "alice@example.com" });
        },
      },
    });

    await verifier.verifyProvider();
  });
});
```

## OpenAPI Schema Validation

### Using OpenAPI Spec as Contract

**Consumer Validation**

```typescript
import SwaggerParser from "@apidevtools/swagger-parser";
import Ajv from "ajv";
import addFormats from "ajv-formats";

describe("API Contract Validation", () => {
  let api: any;
  let ajv: Ajv;

  beforeAll(async () => {
    api = await SwaggerParser.dereference("./openapi.yaml");
    ajv = new Ajv();
    addFormats(ajv);
  });

  test("GET /api/users/:id returns valid User schema", async () => {
    const response = await fetch("http://localhost:3000/api/users/123");
    const data = await response.json();

    const schema = api.components.schemas.User;
    const validate = ajv.compile(schema);
    const valid = validate(data);

    expect(valid).toBe(true);
  });
});
```

### Automated Backwards Compatibility Check

```typescript
import { compare } from "openapi-diff";

describe("API Backwards Compatibility", () => {
  test("new spec is backwards compatible", async () => {
    const result = await compare(
      "./openapi-v1.yaml", // Old version
      "./openapi-v2.yaml", // New version
    );
    expect(result.breakingChanges).toHaveLength(0);
  });
});
```

## CI/CD Workflow

```yaml
name: Contract Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  consumer-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run test:contract:consumer
      - name: Publish to Broker
        if: github.ref == 'refs/heads/main'
        run: npm run pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  can-i-deploy:
    runs-on: ubuntu-latest
    needs: consumer-tests
    steps:
      - name: Check if safe to deploy
        run: |
          npx pact-broker can-i-deploy \
            --pacticipant frontend-app \
            --version ${{ github.sha }} \
            --to production
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
```
