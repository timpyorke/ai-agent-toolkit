# 🧪 API Mocking Skill

---

name: api-mocking
description: Create realistic API mocks for development, testing, and demos using contract-first approaches

---

## Overview

This skill enables AI assistants to set up reliable API mocks that accelerate development, unblock frontend work, test edge cases, and demonstrate features without full backend availability.

## Core Principles

### 1. Contract-First

- Use OpenAPI/GraphQL schemas to drive mocks
- Keep mock responses aligned with the contract
- Validate requests against schema in CI

### 2. Realism & Variability

- Representative data with ranges and distributions
- Simulate latency, throttling, and errors
- Support dynamic behavior and stateful flows

### 3. Separation & Control

- Mock only what’s needed; avoid full system emulation
- Toggle scenarios via headers, query params, or env vars
- Maintain fixtures under version control

## Tools & Approaches

### Quick Local Mocks

- `json-server` for REST from a JSON file
- `Mock Service Worker (MSW)` for browser/intercept-based mocks
- `WireMock`/`Prism` for contract-driven mocking

### OpenAPI-Driven

```bash
# Prism: Mock OpenAPI locally
npm install -g @stoplight/prism-cli
prism mock openapi.yaml --port 4010
```

### GraphQL Mocks

- Apollo Server with mock resolvers
- GraphQL Tools `addMocksToSchema`

```js
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';

const sdl = `
  type User { id: ID!, name: String!, email: String! }
  type Query { users: [User!]! }
`;

const schema = makeExecutableSchema({ typeDefs: sdl });
const mockedSchema = addMocksToSchema({ schema });
```

## Fixtures & Scenarios

### Organize Mock Data

```
mocks/
├── users.json
├── orders.json
└── scenarios/
    ├── happy-path.json
    ├── rate-limit.json
    └── server-error.json
```

### Scenario Selection

- Header: `X-Mock-Scenario: rate-limit`
- Query: `?scenario=server-error`
- Env: `MOCK_SCENARIO=happy-path`

## Error & Latency Simulation

```js
app.get('/users', (req, res) => {
  const scenario = req.headers['x-mock-scenario'];
  if (scenario === 'rate-limit') {
    return res.status(429).json({ error: { code: 'RATE_LIMIT' } });
  }
  setTimeout(() => {
    res.json(usersFixture);
  }, 300 + Math.random() * 700); // 300-1000ms
});
```

## Stateful Mocks

- Track session/user state in memory
- Use idempotency keys for POST replay
- Reset state between tests

## Integration With Frontend

- Intercept fetch/XHR with MSW for deterministic tests
- Toggle between real API and mock via config

## CI Integration

- Validate mock contract against OpenAPI/SDL
- Run mock server in CI for integration tests
- Record/replay with tools like Polly.js

## Best Practices

### Do:

- ✅ Put mock data in repo with code owners
- ✅ Use contract-first validation in CI
- ✅ Document scenarios and how to toggle
- ✅ Simulate realistic latency and errors

### Don't:

- ❌ Hardcode mocks inside app logic
- ❌ Drift mock contract from real API
- ❌ Skip error scenarios (5xx/4xx, timeouts)
- ❌ Leave mocks enabled in production

## Quick Reference

- Prism/WireMock/JSON Server for REST
- MSW for browser/interception
- GraphQL Tools for schema-based mocks
- Scenario toggles via header/query/env
