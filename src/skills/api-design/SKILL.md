---
name: api-design
description: Design clear, consistent, secure REST and GraphQL APIs with robust contracts and versioning
---

# 📐 API Design Skill

## Overview

This skill enables AI assistants to design high-quality APIs that are easy to use, consistent, and resilient. Focus areas include resource modeling, naming, versioning, error handling, pagination, filtering, security, and documentation.

## Core Principles

### 1. Consumer-Centric

- Start from client use-cases and UX flows
- Minimize round-trips and payload complexity
- Provide stable contracts with clear deprecation paths

### 2. Consistency by Convention

- Uniform naming, status codes, and response shapes
- Standardize pagination, filtering, and sorting
- Reuse error formats across endpoints

### 3. Security & Reliability

- Principle of least privilege, input validation
- Idempotency for non-safe retries
- Rate limiting, caching, and timeouts

## REST Design

### Resource Modeling

- Use nouns for resources; avoid verbs in paths
- Hierarchical nesting only when ownership is strict
- Prefer `/{resource}/{id}` over query-only patterns

See [Code Examples](examples.md#resource-modeling).

### Naming Conventions

- Lowercase, hyphen-separated paths: `user-orders`
- Consistent field names: `created_at`, `updated_at`
- Use RFC 3339 timestamps (UTC)

### HTTP Semantics

- Use proper methods: GET/POST/PATCH/DELETE
- Status codes:
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request, 401 Unauthorized, 403 Forbidden
  - 404 Not Found, 409 Conflict, 422 Unprocessable Entity
  - 429 Too Many Requests, 500 Internal Server Error

### Pagination, Filtering, Sorting

See [Code Examples](examples.md#pagination-filtering-sorting).

- Cursor-based preferred for large sets
- Use `sort` with `-field` for descending
- `filter` as simple `field:value` pairs or RQL/DSL if needed

### Error Format (Consistent)

See [Code Examples](examples.md#response-shapes--error-format).

### Idempotency for Non-Safe Operations

- Require `Idempotency-Key` header for POST that creates resources
- Store request hash → result for replay window (e.g., 24h)

## GraphQL Design

### Schema Guidelines

- Clear types, non-null where appropriate
- Pagination via connections (Relay-style)
- Avoid over-fetching with sensible field sets

See [Code Examples](examples.md#graphql-design).

### Error Handling

- Use `errors` array with meaningful codes
- Avoid exposing internals; map to domain errors

### Performance

- Dataloader for N+1 mitigation
- Persisted queries and query whitelisting

## Versioning & Deprecation

- Path versioning: `/v1/...` for breaking changes
- Semantic versioning of contracts (OpenAPI/GraphQL)
- Deprecation headers and sunset dates

## Documentation & Contract-First

### OpenAPI (Recommended for REST)

See [Code Examples](examples.md#documentation).

### GraphQL SDL

- Maintain SDL files and auto-generate docs
- Use schema registries and validation in CI

## Security

- Auth: OAuth2/OIDC, JWT with audience and expiry
- AuthZ: RBAC/ABAC, scope-based checks
- Input validation and output encoding
- TLS-only; consider cert pinning for mobile

## Monitoring & SLAs

- Track `availability`, `latency`, `error rate`, `saturation`
- SLOs per endpoint and alert thresholds

## Best Practices

## Best Practices

See [Reference Material](references.md#best-practices).

## Quick Reference

See [Reference Material](references.md#quick-reference).
