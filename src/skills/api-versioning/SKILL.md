---
name: API Versioning
description: Evolve APIs gracefully while maintaining backward compatibility and managing deprecation lifecycles
---

# API Versioning Skill

Master strategies for versioning REST APIs, GraphQL schemas, and gRPC services to support multiple client versions simultaneously while enabling continuous evolution.

## Core Principles

### 1. API Contract Stability

- **Contract**: The interface between API provider and consumer
- **Breaking Changes**: Modifications that break existing clients
- **Backward Compatibility**: New versions work with old clients
- **Deprecation**: Phasing out old versions gracefully

See [Reference Material](references.md#core-concepts).

## Versioning Strategies

### 1. URI Path Versioning

**Format:** `/v{version}/resource`

**Format:** `/v{version}/resource`

See [Code Examples](examples.md#uri-path-versioning-expressjs).

See [Reference Material](references.md#uri-path-versioning) for Pros/Cons.

### 2. Header Versioning

**Format:** `Accept: application/vnd.myapi.v2+json`

**Format:** `Accept: application/vnd.myapi.v2+json`

See [Code Examples](examples.md#header-versioning-middleware).

See [Reference Material](references.md#header-versioning) for Pros/Cons.

### 3. Query Parameter Versioning

**Format:** `/users?version=2`

**Format:** `/users?version=2`

See [Code Examples](examples.md#query-parameter-versioning).

See [Reference Material](references.md#query-parameter-versioning) for Pros/Cons.

### 4. Custom Header Versioning

**Format:** `X-API-Version: 2`

**Format:** `X-API-Version: 2`

See [Code Examples](examples.md#custom-header-versioning).

See [Reference Material](references.md#custom-header-versioning) for Pros/Cons.

## Breaking vs Non-Breaking Changes

### Breaking vs Non-Breaking Changes

See [Code Examples](examples.md#breaking-vs-non-breaking-changes).

## Implementation Patterns

### 1. Version Adapter Pattern

See [Code Examples](examples.md#version-adapter-pattern).

### 2. OpenAPI Specification Versioning

See [Code Examples](examples.md#openapi-specification).

### 3. GraphQL Versioning

See [Code Examples](examples.md#graphql-versioning).

## Deprecation Strategy

See [Code Examples](examples.md#deprecation--testing).

See [Reference Material](references.md#deprecation-timeline) for Timeline.

## Testing Across Versions

### Contract Testing

See [Code Examples](examples.md#contract-testing).

### Version Compatibility Tests

See [Code Examples](examples.md#version-compatibility-tests).

## Client SDK Versioning

See [Code Examples](examples.md#client-sdk-versioning).

### Best Practices

See [Reference Material](references.md#best-practices).

### Anti-Patterns

See [Reference Material](references.md#anti-patterns).

See [Reference Material](references.md#quick-reference).

## Resources

See [Reference Material](references.md#resources).

---

_API versioning enables continuous evolution while maintaining stability and trust with clients through clear contracts and graceful deprecation._
