---
name: tool-use
description: Safely invoke tools with clear plans, schema adherence, idempotent side-effects, robust error handling, and verification to deliver reliable outcomes.
---

# 🛠️ Tool Use

## Overview

Tool use enables an AI agent to plan, execute, and verify actions through external tools (HTTP, filesystem, shells, DBs). This skill defines safe invocation, result validation, idempotency for side effects, retries with timeouts, and clear auditability to prevent harm and ensure reliable outcomes.

## Core Principles

1. Plan→Execute→Verify: state assumptions, choose a tool, validate result, and follow up.
2. Honor schemas and contracts: strict input/output validation; fail fast on mismatch.
3. Idempotency for side effects: write operations must be repeat-safe; include keys/tokens.
4. Defensive execution: timeouts, retries with jitter, and scoped permissions.
5. Observability: log intent, parameters (sanitized), results, and errors for traceability.

## Tool Selection & Planning

- Define objective and success criteria before calling a tool.
- Choose the minimal-permission tool; prefer read-only when possible.
- Validate preconditions: connectivity, credentials, resource existence.
- Model context: what will change, how to roll back if needed.

### Example: HTTP Request Plan

1. Goal: "Fetch product by id and verify fields"
2. Preconditions: `BASE_URL` available, product exists
3. Tool: HTTP GET `/products/:id`
4. Validation: `status==200`, `schema` matches, `name` is non-empty
5. Follow-up: return normalized object; on failure, retry/backoff or surface error

```typescript
type Product = { id: string; name: string; price: number };

async function getProduct(
  id: string,
  http: (url: string) => Promise<Response>,
): Promise<Product> {
  const res = await http(`/products/${id}`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (typeof json.name !== "string" || typeof json.price !== "number") {
    throw new Error("SchemaMismatch: name/price");
  }
  return { id: String(json.id), name: json.name.trim(), price: json.price };
}
```

## Execution & Error Handling

- Always set explicit timeouts; avoid indefinite waits.
- Retry idempotent operations with exponential backoff + jitter.
- Handle expected failure modes (5xx, network, constraint violations) distinctly.
- Sanitize logs; never print secrets or PII.
- For destructive actions, require an explicit confirmation step.

```typescript
async function withBackoff<T>(
  fn: () => Promise<T>,
  max = 3,
  base = 500,
): Promise<T> {
  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === max) throw e;
      const delay =
        Math.min(base * 2 ** (attempt - 1), 5000) + Math.random() * 250;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
```

## Result Verification & Post-Processing

- Validate shape and types; enforce required fields.
- Normalize outputs (trim strings, sort lists, canonicalize IDs).
- Cross-check critical invariants (e.g., sum totals, referential integrity).
- Record outcomes; include correlation IDs for tracing.

## Best Practices

- Prefer read-first, write-second workflows; preview before commit.
- Use idempotency keys for POST/PUT that create resources.
- Scope side effects; limit blast radius (paths, tables, tenants).
- Version tool interfaces; document changes and deprecations.
- Include dry-run modes for high-risk operations.

## Anti-Patterns

- Blind tool calls without a plan or validation.
- Infinite retries; no jitter; no timeout.
- Logging credentials or sensitive payloads.
- Non-idempotent writes in retry loops.
- Ignoring error codes and swallowing exceptions.

## Scenarios

### Read-Only HTTP Fetch

1. Plan goal and schema
2. GET with timeout
3. Validate and normalize
4. Return or retry on transient failures

### File Write with Idempotency

1. Check if file exists and content hash
2. Write with atomic temp file → rename
3. Verify checksum and permissions
4. Log outcome with path + hash

### Database Update

1. Start transaction
2. Update with idempotency key or upsert
3. Commit; on error, rollback
4. Emit audit log with record id

### Long-Running Shell Command

1. Spawn with bounded resources
2. Stream logs; detect failures early
3. Timeout and terminate if needed
4. Archive artifacts; return summary

## Tools & Techniques

- HTTP: robust clients with retries/timeouts; schema validation libs (Zod/JSON Schema)
- Filesystem: atomic writes, checksums, POSIX permissions
- DB: transactions, upserts, idempotency keys, unique constraints
- Shell: process limits, structured logs, exit code checks
- Observability: correlation IDs, structured JSON logs, metrics

## Quick Reference

```bash
# Preview before commit
curl -sS "$BASE_URL/items/42" | jq .

# Safe write (atomic)
mktemp tmp && mv tmp target && sha256sum target

# Idempotent POST (example header)
-H "Idempotency-Key: <deterministic-key>"
```

## Conclusion

Plan deliberately, validate strictly, execute defensively, and verify outcomes. Favor idempotency, bounded retries, timeouts, and auditability to keep tool use safe and reliable.

---

**Related Skills**: [optimize-prompt](../optimize-prompt/SKILL.md) | [observability](../observability/SKILL.md) | [secrets-management](../secrets-management/SKILL.md)
