# Reference Material

## Core Principles

1.  **Plan First**: State assumptions and success criteria.
2.  **Validate Inputs**: Stick to the schema; reject ambiguity.
3.  **Idempotency**: Retries should not duplicate side effects.
4.  **Least Privilege**: Use read-only tools where possible.

## Execution Checklist

-   [ ] **Pre-flight**: Check connectivity/auth.
-   [ ] **Timeout**: Set explicit timeout (default 30s).
-   [ ] **Retry**: Add backoff for transient errors (network).
-   [ ] **Sanitize**: Audit logs for secrets/PII.

## Anti-Patterns

-   Blindly executing without validation.
-   Infinite retry loops.
-   Swallowing errors (ignoring exit codes).
-   Hardcoding secrets in tool calls.
