---
name: api-mocking
description: Create realistic API mocks for development, testing, and demos using contract-first approaches
---

# 🧪 API Mocking Skill

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

See [Code Examples](examples.md#openapi-driven-mocks).

### GraphQL Mocks

- Apollo Server with mock resolvers
- GraphQL Tools `addMocksToSchema`

See [Code Examples](examples.md#graphql-mocks).

## Fixtures & Scenarios

### Organize Mock Data

See [Code Examples](examples.md#fixtures--scenarios).

### Scenario Selection

- Header: `X-Mock-Scenario: rate-limit`
- Query: `?scenario=server-error`
- Env: `MOCK_SCENARIO=happy-path`

## Error & Latency Simulation

See [Code Examples](examples.md#error--latency-simulation).

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

See [Reference Material](references.md#best-practices).

## Quick Reference

See [Reference Material](references.md#quick-reference).
