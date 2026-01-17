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

```
GET    /users
GET    /users/{id}
POST   /users
PATCH  /users/{id}
DELETE /users/{id}

GET    /users/{id}/orders    # Ownership relation
```

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

```
GET /users?limit=50&cursor=abc&sort=-created_at&filter=status:active

Response:
{
  "data": [ ... ],
  "page": {
    "next_cursor": "def",
    "limit": 50
  }
}
```

- Cursor-based preferred for large sets
- Use `sort` with `-field` for descending
- `filter` as simple `field:value` pairs or RQL/DSL if needed

### Error Format (Consistent)

```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is invalid",
    "details": [{ "field": "email", "issue": "invalid_format" }],
    "request_id": "rq_123",
    "timestamp": "2026-01-17T03:21:00Z"
  }
}
```

### Idempotency for Non-Safe Operations

- Require `Idempotency-Key` header for POST that creates resources
- Store request hash → result for replay window (e.g., 24h)

## GraphQL Design

### Schema Guidelines

- Clear types, non-null where appropriate
- Pagination via connections (Relay-style)
- Avoid over-fetching with sensible field sets

```
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}
```

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

```
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id: { type: string }
        name: { type: string }
        email: { type: string, format: email }
        created_at: { type: string, format: date-time }
```

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

### Do:

- ✅ Design from user journeys
- ✅ Standardize responses and errors
- ✅ Provide clear versioning/deprecation
- ✅ Use contract-first with OpenAPI/SDL
- ✅ Include idempotency for creates

### Don't:

- ❌ Overload endpoints with mixed responsibilities
- ❌ Break contracts without deprecation
- ❌ Expose internal error details
- ❌ Use inconsistent naming/status codes

## Quick Reference

- REST: nouns, proper methods, consistent errors
- GraphQL: clear types, dataloader, persisted queries
- Versioning: `/v1` paths, deprecation headers
- Docs: OpenAPI/SDL in repo, CI validation
