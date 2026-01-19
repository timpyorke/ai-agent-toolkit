# Reference Material

## Three Pillars

1. **Logs**: Discrete events (e.g., "Error saving user"). Debugging.
2. **Metrics**: Aggregated numbers (e.g., "RPS=100"). Trending & Aleeting.
3. **Traces**: Request lifecycle across services (e.g., "API->DB->Redis"). Latency analysis.

## Metric Types (Prometheus)

- **Counter**: Only goes up (requests, errors).
- **Gauge**: Goes up and down (memory, queue depth).
- **Histogram**: Distribution in buckets (latency p99).
- **Summary**: Client-side quantiles (rarely used now).

## Methodologies

- **RED**: Rate (traffic), Errors (correctness), Duration (latency). Best for APIs.
- **USE**: Utilization (busy %), Saturation (queue length), Errors. Best for Infrastructure (CPU, Disk).

## Quick Queries

### PromQL
| Query | Purpose |
|-------|---------|
| `rate(http_requests_total[5m])` | Request rate per second |
| `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` | p95 Latency |
| `up == 0` | Down instance alert |

### LogQL
| Query | Purpose |
|-------|---------|
| `{app="api"} |= "error"` | Grep for error |
| `{app="api"} | json | status >= 500` | Structured filter |
