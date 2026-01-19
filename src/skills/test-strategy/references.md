# Reference Material

## Testing Layers (The Pyramid)

| Layer | Focus | Speed | Cost | Target Coverage |
|-------|-------|-------|------|----------------|
| **Unit** | Individual functions/classes | Fast (ms) | Low | 70-90% |
| **Integration** | DB queries, API endpoints | Medium | Med | 50-70% |
| **E2E** | Critical User Journeys | Slow (min) | High | Critical paths only |

## ROI Analysis

-   **High ROI**: Domain logic, payment flows, security controls.
-   **Low ROI**: Getters/setters, configuration files, 3rd party library wrappers.

## Flakiness Prevention Checklist

-   [ ] No race conditions (always `await`).
-   [ ] No shared state (fresh DB per test or transaction rollback).
-   [ ] Mock external APIs (Stripe, Twilio).
-   [ ] Use fake timers for `setTimeout`/`Date`.
