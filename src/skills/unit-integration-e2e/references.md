# Reference Material

## Testing Pyramid vs Trophy

| Layer | Focus | Speed | Volume (Pyramid) | Volume (Trophy) |
|-------|-------|-------|------------------|-----------------|
| **E2E** | Critical Flows | Slow | 10% | 10% |
| **Integration** | Service Handoffs | Medium | 20% | **50%** |
| **Unit** | Business Logic | Fast | 70% | 40% |

## Test Doubles

-   **Mock**: Expectation specific (verifies behavior).
-   **Stub**: Canned answer (verifies state).
-   **Spy**: Watcher (verifies usage).
-   **Fake**: Simplified implementation (in-memory DB).

## Best Practices

-   **Test Behavior, Not Implementation**: Don't test private methods.
-   **Isolation**: No shared state between tests.
-   **Determinism**: Mock `Date.now()` and `Math.random()`.
