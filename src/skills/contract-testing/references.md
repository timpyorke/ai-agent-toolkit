# Reference Material

## Core Principles

### 1. Consumer-Driven First
- Consumers define what they need; generate contracts from consumer tests.
- Publish contracts to a broker; providers verify against latest consumer expectations.
- Decouple deployments by verifying compatibility before release.

### 2. Match Structure, Not Exact Values
- Use flexible matchers (types, shapes, regex) to avoid brittle tests.
- Validate error paths (4xx/5xx) as part of the contract.

### 3. Automate Compatibility in CI
- Gate deployments with "can-i-deploy" checks against the broker.
- Run provider verification on every change to the API.

### 4. Version and Evolve Safely
- Use semantic versioning for contracts and endpoints.
- Prefer additive, backward-compatible changes; deprecate before removal.

## Matchers Reference

| Matcher | Usage |
| :--- | :--- |
| `like(value)` | Matches type and structure (ignore value). |
| `eachLike(obj)` | Matches an array where each item matches the object structure. |
| `regex(pattern, example)` | Matches string against regex. |
| `integer(example)` | Matches any integer. |
| `iso8601DateTime(example)` | Matches ISO date string. |

## Compatibility Guide

**❌ Breaking Changes:**
- Removing a field
- Renaming a field
- Changing field type
- Making optional field required
- Removing an endpoint

**✅ Non-Breaking Changes:**
- Adding a new field (optional)
- Adding a new endpoint
- Making required field optional
- Adding enum value (with default handling)
