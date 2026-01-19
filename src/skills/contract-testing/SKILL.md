---
name: contract-testing
description: Verify service compatibility with consumer-driven contracts, schema validation, and CI gates to prevent breaking changes
---

# 🤝 Contract Testing Skill

> **Category**: Testing & Quality  
> **Audience**: Backend developers, API developers, microservices teams  
> **Prerequisites**: Understanding of APIs, integration testing  
> **Complexity**: Intermediate to Advanced

## Overview

Contract testing verifies that services can communicate correctly by testing the contracts (agreements) between them. Unlike integration tests that require running both services, contract tests validate each side independently—providers ensure they meet the contract, consumers verify they can use it. This enables independent deployments while preventing breaking changes.

## Core Principles

See [Reference Material](references.md#core-principles).

## Consumer-Driven Contracts

See [Examples](examples.md#pact-consumer-tests).

## Provider Verification

See [Examples](examples.md#pact-provider-verification).

## Matchers

See [Reference Material](references.md#matchers-reference).

## OpenAPI Schema Validation

See [Examples](examples.md#openapi-schema-validation).

## Backwards Compatibility Checks

See [Reference Material](references.md#compatibility-guide).

## CI Integration

See [Examples](examples.md#cicd-workflow).

## Best Practices

See [Reference Material](references.md#best-practices).
