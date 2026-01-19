# Reference Material

## Core Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Circuit Breaker** | Stops requests to failing service | Prevent cascading failures |
| **Retry** | Repeats failed request | Transient network/timeout errors |
| **Bulkhead** | Isolates connection pools/threads | Containing failures to one module |
| **Rate Limiter** | Throttles incoming/outgoing traffic | Protecting resources from overload |
| **Fallback** | Returns default/cached value | Degrading gracefully when service is down |

## Stability Principles

-   **Fail Fast**: Don't make the caller wait for a timeout if you know it will fail.
-   **Shed Load**: Reject excess traffic when capacity is reached (HTTP 503).
-   **Isolate**: Dependencies should not take down the whole system.

## Trade-offs

-   **Retries**: Increase latency and load. GOOD for network blips. BAD for overload/bugs.
-   **Circuit Breakers**: Improve stability but drop requests during outages.
-   **Bulkheads**: Waste resources (idle threads) but guarantee isolation.
