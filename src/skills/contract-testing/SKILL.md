# Contract Testing

> **Category**: Testing & Quality  
> **Audience**: Backend developers, API developers, microservices teams  
> **Prerequisites**: Understanding of APIs, integration testing  
> **Complexity**: Intermediate to Advanced

## Overview

Contract testing verifies that services can communicate correctly by testing the contracts (agreements) between them. Unlike integration tests that require running both services, contract tests validate each side independently—providers ensure they meet the contract, consumers verify they can use it. This enables independent deployments while preventing breaking changes.

## Why Contract Testing?

### The Problem

```
┌──────────┐         ┌──────────┐
│ Frontend │────────▶│ Backend  │
│  (React) │   API   │ (Node.js)│
└──────────┘         └──────────┘

Without contract tests:
1. Backend changes response format
2. Deploy backend (tests pass ✅)
3. Frontend breaks in production ❌
4. Incident! Users affected
```

### The Solution

```
┌──────────┐         ┌──────────┐
│ Consumer │         │ Provider │
│  Tests   │────┬───▶│  Tests   │
└──────────┘    │    └──────────┘
                │
           ┌────▼────┐
           │Contract │
           │ Broker  │
           └─────────┘

1. Consumer defines expected contract
2. Provider verifies it meets contract
3. Breaking changes caught before deployment ✅
```

## Consumer-Driven Contracts

### Workflow

```
1. Consumer writes test defining what they need
2. Contract generated from consumer test
3. Contract published to broker
4. Provider verifies they satisfy contract
5. Both can deploy independently
```

## Pact Framework

### Installation

```bash
# JavaScript/TypeScript
npm install --save-dev @pact-foundation/pact

# Python
pip install pact-python

# Java
// Add to build.gradle
testImplementation 'au.com.dius.pact.consumer:junit5:4.5.0'
```

### Consumer Test Example

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
        headers: {
          Accept: "application/json",
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
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

  test("get all users returns array", async () => {
    await provider
      .given("users exist")
      .uponReceiving("a request for all users")
      .withRequest({
        method: "GET",
        path: "/api/users",
      })
      .willRespondWith({
        status: 200,
        body: eachLike({
          id: "123",
          name: "Alice",
          email: "alice@example.com",
        }),
      });

    await provider.executeTest(async (mockServer) => {
      const userService = new UserService(mockServer.url);
      const users = await userService.getAllUsers();

      expect(Array.isArray(users)).toBe(true);
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("name");
      expect(users[0]).toHaveProperty("email");
    });
  });

  test("create user returns created user", async () => {
    await provider
      .uponReceiving("a request to create a user")
      .withRequest({
        method: "POST",
        path: "/api/users",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          name: "Bob",
          email: "bob@example.com",
        },
      })
      .willRespondWith({
        status: 201,
        body: like({
          id: "456",
          name: "Bob",
          email: "bob@example.com",
          createdAt: "2024-01-15T10:00:00Z",
        }),
      });

    await provider.executeTest(async (mockServer) => {
      const userService = new UserService(mockServer.url);
      const user = await userService.createUser({
        name: "Bob",
        email: "bob@example.com",
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Bob");
    });
  });
});
```

### Provider Verification

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

      // Option 1: From local file
      pactUrls: ["./pacts/frontend-app-user-service.json"],

      // Option 2: From Pact Broker
      // pactBrokerUrl: 'https://pact-broker.example.com',
      // consumerVersionSelectors: [{ latest: true }],

      // State handlers
      stateHandlers: {
        "user 123 exists": async () => {
          // Setup: Create user 123 in test database
          await db.users.create({
            id: "123",
            name: "Alice",
            email: "alice@example.com",
          });
        },
        "users exist": async () => {
          await db.users.createMany([
            { id: "1", name: "Alice", email: "alice@example.com" },
            { id: "2", name: "Bob", email: "bob@example.com" },
          ]);
        },
      },

      // Cleanup after each interaction
      afterEach: async () => {
        await db.users.deleteMany({});
      },
    });

    await verifier.verifyProvider();
  });
});
```

### Matchers

**Type matching (ignore exact values)**

```typescript
import {
  like,
  eachLike,
  regex,
  integer,
} from "@pact-foundation/pact/dsl/matchers";

// Matches any string
like("example");

// Matches any object with this structure
like({
  id: "123",
  name: "Alice",
  age: 30,
});

// Array with at least one item matching structure
eachLike(
  {
    id: "1",
    title: "Post",
  },
  { min: 1 },
);

// Regex pattern
regex("\\d{4}-\\d{2}-\\d{2}", "2024-01-15");

// Integer (any integer value)
integer(42);

// ISO 8601 timestamp
iso8601DateTime("2024-01-15T10:00:00Z");
```

## OpenAPI Schema Validation

### Using OpenAPI Spec as Contract

**OpenAPI Definition (openapi.yaml)**

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users/{userId}:
    get:
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          description: User not found

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
```

### Consumer Validation (TypeScript)

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
    if (!valid) {
      console.error(validate.errors);
    }
  });
});
```

### Provider Validation with Schemathesis

```python
# Python provider validation
import schemathesis

schema = schemathesis.from_uri("http://localhost:3000/openapi.json")

@schema.parametrize()
def test_api_contract(case):
    response = case.call()
    case.validate_response(response)
```

**Run with CLI**

```bash
# Test all endpoints against OpenAPI spec
schemathesis run http://localhost:3000/openapi.json \
  --checks all \
  --hypothesis-max-examples=100
```

## GraphQL Schema Testing

### Schema Definition (schema.graphql)

```graphql
type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}

type User {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTime!
}

input CreateUserInput {
  name: String!
  email: String!
}

scalar DateTime
```

### Consumer Test (Apollo Client)

```typescript
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { buildClientSchema, validateSchema } from "graphql";

describe("GraphQL Contract", () => {
  let client: ApolloClient<any>;
  let schema: GraphQLSchema;

  beforeAll(() => {
    client = new ApolloClient({
      uri: "http://localhost:4000/graphql",
      cache: new InMemoryCache(),
    });

    // Fetch schema from server
    schema = buildClientSchema(introspectionResult);
  });

  test("schema is valid", () => {
    const errors = validateSchema(schema);
    expect(errors).toHaveLength(0);
  });

  test("user query returns expected shape", async () => {
    const { data } = await client.query({
      query: gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            email
            createdAt
          }
        }
      `,
      variables: { id: "123" },
    });

    expect(data.user).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.stringMatching(/^.+@.+\..+$/),
      createdAt: expect.any(String),
    });
  });
});
```

### Provider Validation

```typescript
import { makeExecutableSchema } from "@graphql-tools/schema";
import { validateSchema } from "graphql";
import { readFileSync } from "fs";

describe("GraphQL Schema Validation", () => {
  test("schema is valid and matches definition", () => {
    const typeDefs = readFileSync("./schema.graphql", "utf-8");

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const errors = validateSchema(schema);
    expect(errors).toHaveLength(0);
  });

  test("resolvers implement all required fields", () => {
    const typeMap = schema.getTypeMap();
    const userType = typeMap["User"] as GraphQLObjectType;

    const fields = userType.getFields();
    expect(fields).toHaveProperty("id");
    expect(fields).toHaveProperty("name");
    expect(fields).toHaveProperty("email");
    expect(fields).toHaveProperty("createdAt");
  });
});
```

## Backwards Compatibility Checks

### Breaking vs Non-Breaking Changes

**❌ Breaking Changes**:

- Removing a field
- Renaming a field
- Changing field type
- Making optional field required
- Removing an endpoint

**✅ Non-Breaking Changes**:

- Adding a new field (optional)
- Adding a new endpoint
- Making required field optional
- Adding enum value (with default handling)

### Automated Compatibility Check

```typescript
import { compare } from "openapi-diff";

describe("API Backwards Compatibility", () => {
  test("new spec is backwards compatible", async () => {
    const result = await compare(
      "./openapi-v1.yaml", // Old version
      "./openapi-v2.yaml", // New version
    );

    // Check for breaking changes
    expect(result.breakingChanges).toHaveLength(0);

    // Log non-breaking changes
    console.log("Non-breaking changes:", result.nonBreakingChanges);
  });
});
```

### Contract Versioning

**URL versioning**

```typescript
// v1: /api/v1/users
app.get("/api/v1/users", (req, res) => {
  res.json(users.map((u) => ({ id: u.id, name: u.name })));
});

// v2: Added email field (non-breaking)
app.get("/api/v2/users", (req, res) => {
  res.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
  );
});
```

**Header versioning**

```typescript
app.get("/api/users", (req, res) => {
  const version = req.headers["api-version"] || "1";

  if (version === "2") {
    res.json(users); // Full data
  } else {
    res.json(users.map((u) => ({ id: u.id, name: u.name }))); // Limited
  }
});
```

## CI Integration

### GitHub Actions Workflow

```yaml
name: Contract Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  consumer-tests:
    name: Consumer Contract Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run consumer contract tests
        run: npm run test:contract:consumer

      - name: Publish contracts to Pact Broker
        if: github.ref == 'refs/heads/main'
        run: |
          npm run pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  provider-verification:
    name: Provider Contract Verification
    runs-on: ubuntu-latest
    needs: consumer-tests
    steps:
      - uses: actions/checkout@v4

      - name: Start provider service
        run: npm run start:test &

      - name: Wait for service
        run: npx wait-on http://localhost:3000/health

      - name: Verify provider against contracts
        run: npm run test:contract:provider
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
```

### Can-I-Deploy Check

```bash
# Check if consumer can deploy safely
npx pact-broker can-i-deploy \
  --pacticipant frontend-app \
  --version $GIT_SHA \
  --to production

# Check if provider can deploy safely
npx pact-broker can-i-deploy \
  --pacticipant user-service \
  --version $GIT_SHA \
  --to production
```

**Integrate into deployment pipeline**

```yaml
- name: Check if safe to deploy
  run: |
    npx pact-broker can-i-deploy \
      --pacticipant user-service \
      --version ${{ github.sha }} \
      --to production
  env:
    PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
    PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

- name: Deploy
  if: success()
  run: npm run deploy
```

## Pact Broker Setup

### Docker Compose

```yaml
version: "3"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: pact
      POSTGRES_PASSWORD: pact
      POSTGRES_DB: pact_broker
    volumes:
      - postgres-data:/var/lib/postgresql/data

  pact-broker:
    image: pactfoundation/pact-broker:latest
    ports:
      - "9292:9292"
    environment:
      PACT_BROKER_DATABASE_URL: postgres://pact:pact@postgres:5432/pact_broker
      PACT_BROKER_BASIC_AUTH_USERNAME: admin
      PACT_BROKER_BASIC_AUTH_PASSWORD: password
      PACT_BROKER_PUBLIC_HEARTBEAT: "true"
    depends_on:
      - postgres

volumes:
  postgres-data:
```

**Start Pact Broker**

```bash
docker-compose up -d
```

**Publish contracts**

```bash
npx pact-broker publish ./pacts \
  --consumer-app-version=$GIT_SHA \
  --broker-base-url=http://localhost:9292 \
  --broker-username=admin \
  --broker-password=password
```

## Best Practices

### ✅ DO

1. **Test contracts, not implementation**

```typescript
// ✅ Good: Focuses on contract
expect(response).toMatchObject({
  id: expect.any(String),
  name: expect.any(String),
});

// ❌ Bad: Too specific
expect(response.id).toBe("123");
```

2. **Use flexible matchers**

```typescript
// ✅ Good: Accepts any valid structure
body: like({
  id: '123',
  createdAt: iso8601DateTime()
})

// ❌ Bad: Brittle exact match
body: {
  id: '123',
  createdAt: '2024-01-15T10:00:00.000Z'
}
```

3. **Test both happy and error paths**

```typescript
test("returns 404 when user not found", async () => {
  await provider
    .given("user 999 does not exist")
    .uponReceiving("request for non-existent user")
    .withRequest({
      method: "GET",
      path: "/api/users/999",
    })
    .willRespondWith({
      status: 404,
      body: { error: "User not found" },
    });
});
```

### ❌ DON'T

1. **Don't test provider internals**
2. **Don't use real databases in consumer tests**
3. **Don't include authentication tokens in contracts** (use state handlers)
4. **Don't make contracts too specific** (use matchers)

## Common Pitfalls

| Pitfall                        | Impact              | Solution                     |
| ------------------------------ | ------------------- | ---------------------------- |
| Overly specific contracts      | Brittle tests       | Use type matchers            |
| Testing implementation details | Coupling            | Focus on interface only      |
| Not versioning contracts       | Breaking changes    | Use semantic versioning      |
| Skipping error scenarios       | Incomplete coverage | Test 4xx, 5xx responses      |
| Manual contract updates        | Out of sync         | Generate from consumer tests |

## Quick Reference

```bash
# Run consumer tests (generates contracts)
npm run test:contract:consumer

# Verify provider against contracts
npm run test:contract:provider

# Publish contracts to broker
npx pact-broker publish ./pacts \
  --consumer-app-version=$GIT_SHA \
  --broker-base-url=$PACT_BROKER_URL

# Check if safe to deploy
npx pact-broker can-i-deploy \
  --pacticipant myapp \
  --version $GIT_SHA \
  --to production
```

## Additional Resources

- [Pact Documentation](https://docs.pact.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL Contract Testing](https://www.apollographql.com/docs/apollo-server/testing/testing/)
- [Contract Testing Best Practices](https://martinfowler.com/bliki/ContractTest.html)
- [Pact Broker](https://github.com/pact-foundation/pact_broker)

---

**Related Skills**: [unit-integration-e2e](../unit-integration-e2e/SKILL.md) | [test-strategy](../test-strategy/SKILL.md) | [api-design](../api-design/SKILL.md) | [ci-cd-pipeline](../ci-cd-pipeline/SKILL.md)
