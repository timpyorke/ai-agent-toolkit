# Reference Material

## Core Principles

1. **Test production-like environments**: Use same infrastructure, data volumes, and configurations.
2. **Ramp gradually**: Simulate realistic traffic patterns with think time.
3. **Define success criteria**: SLAs (p95 latency, error rate) as pass/fail gates.
4. **Monitor system metrics**: Watch CPU, memory, DB connections, network during tests.
5. **Automate regression detection**: Use baseline comparisons in CI/CD pipelines.

## Test Types

### 1. Load Test (Sustained Traffic)
- **Goal**: Verify system meets SLAs under expected normal traffic.
- **Pattern**: Ramp up -> Steady State -> Ramp down.

### 2. Stress Test (Breaking Point)
- **Goal**: Discover maximum capacity and failure modes.
- **Pattern**: Step interactions (increasing load) until failure.

### 3. Spike Test (Sudden Surge)
- **Goal**: Verify system handles sudden spikes (e.g., flash sales).
- **Pattern**: Normal load -> Sudden Spike -> Normal load.

### 4. Soak Test (Endurance)
- **Goal**: Detect memory leaks, resource exhaustion over time.
- **Pattern**: Sustained load for extended period (hours/days).

## Capacity Planning

### Determining Capacity
1. Run stress test to find breaking point (e.g., 4000 RPS).
2. Determine safe operating capacity (e.g., 65% of max = 2600 RPS).
3. Identify bottleneck resource (CPU, DB Connections, etc.).

### Forecasting
```python
required_instances = (peak_traffic / capacity_per_instance) * (1 + safety_margin)
```

## Best Practices
- **Warm up**: Ensure caches and JIT compilers are warm before measuring.
- **Distributed Load**: Use multiple agents if testing high throughput to avoid client-side bottlenecks.
- **Isolation**: Don't run load tests on shared environments used by other teams/customers.
- **Realistic Data**: Use randomized or production-sanitized data to avoid caching artifacts.

## Anti-Patterns
- **Testing production** without coordination (DDoS risk).
- **Instant spikes**: Unrealistic ramp-up (0 to 1000 users in 1s).
- **Ignoring p99**: Focusing only on averages hides tail latency issues.
- **No baseline**: Testing without previous results to compare against.
