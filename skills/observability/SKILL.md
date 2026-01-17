---
name: Observability
description: Structured logging, metrics, distributed tracing, and SLOs for production systems monitoring
---

# Observability Skill

Monitor and understand system behavior through logs, metrics, and traces.

## Three Pillars

- **Logs**: Discrete events with context
- **Metrics**: Aggregated measurements over time
- **Traces**: Request flow across services

## Structured Logging

### JSON Logs

```typescript
// logger.ts
import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "api" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Structured output
logger.info("User logged in", {
  userId: "123",
  email: "user@example.com",
  ip: "192.168.1.1",
});

// Output:
// {
//   "level": "info",
//   "message": "User logged in",
//   "userId": "123",
//   "email": "user@example.com",
//   "ip": "192.168.1.1",
//   "timestamp": "2024-01-15T10:30:00.000Z",
//   "service": "api"
// }
```

### Correlation IDs

```typescript
import { randomUUID } from "crypto";

// Middleware to add correlation ID
function correlationMiddleware(req, res, next) {
  const correlationId = req.headers["x-correlation-id"] || randomUUID();
  req.correlationId = correlationId;
  res.setHeader("X-Correlation-Id", correlationId);

  // Add to logger context
  req.logger = logger.child({ correlationId });
  next();
}

// Usage in handlers
app.get("/api/users/:id", async (req, res) => {
  req.logger.info("Fetching user", { userId: req.params.id });

  try {
    const user = await getUser(req.params.id, req.correlationId);
    req.logger.info("User fetched successfully", { userId: user.id });
    res.json(user);
  } catch (error) {
    req.logger.error("Failed to fetch user", {
      userId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Log Levels

```typescript
// Log level hierarchy (least to most verbose)
logger.error("Critical failure", { error }); // Always logged
logger.warn("Deprecated API used", { endpoint }); // Warning
logger.info("Request processed", { duration }); // General info
logger.debug("Cache hit", { key }); // Debugging
logger.trace("Function entered", { params }); // Very detailed

// Context-aware logging
logger.info("Order created", {
  orderId: order.id,
  userId: order.userId,
  amount: order.total,
  items: order.items.length,
  paymentMethod: order.paymentMethod,
  timestamp: new Date().toISOString(),
});
```

## Prometheus Metrics

### Metric Types

```typescript
import { Registry, Counter, Gauge, Histogram, Summary } from "prom-client";

const register = new Registry();

// Counter: Monotonically increasing
const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"],
  registers: [register],
});

// Gauge: Value that can go up or down
const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
  registers: [register],
});

// Histogram: Distribution of values (with buckets)
const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Summary: Similar to histogram, calculates quantiles
const httpRequestSize = new Summary({
  name: "http_request_size_bytes",
  help: "HTTP request size in bytes",
  labelNames: ["method", "path"],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  registers: [register],
});
```

### RED Method

Rate, Errors, Duration

```typescript
// Middleware to track RED metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    };

    // Rate: Count of requests
    httpRequestsTotal.inc(labels);

    // Duration: Latency distribution
    httpRequestDuration.observe(labels, duration);

    // Errors: Status code >= 500
    if (res.statusCode >= 500) {
      httpErrorsTotal.inc(labels);
    }
  });

  next();
}

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

### USE Method

Utilization, Saturation, Errors (for resources)

```typescript
// CPU utilization
const cpuUtilization = new Gauge({
  name: "process_cpu_utilization",
  help: "CPU utilization percentage",
  collect() {
    const usage = process.cpuUsage();
    this.set(usage.user / 1000000); // Convert to seconds
  },
});

// Memory usage
const memoryUsage = new Gauge({
  name: "process_memory_bytes",
  help: "Process memory usage in bytes",
  labelNames: ["type"],
  collect() {
    const mem = process.memoryUsage();
    this.set({ type: "heap_used" }, mem.heapUsed);
    this.set({ type: "heap_total" }, mem.heapTotal);
    this.set({ type: "rss" }, mem.rss);
  },
});

// Event loop lag (saturation)
const eventLoopLag = new Gauge({
  name: "event_loop_lag_seconds",
  help: "Event loop lag in seconds",
});

setInterval(() => {
  const start = Date.now();
  setImmediate(() => {
    const lag = (Date.now() - start) / 1000;
    eventLoopLag.set(lag);
  });
}, 5000);
```

## Distributed Tracing

### OpenTelemetry

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: "http://localhost:14268/api/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Manual span creation
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("api-service");

async function processOrder(orderId: string) {
  const span = tracer.startSpan("processOrder");
  span.setAttribute("order.id", orderId);

  try {
    // Nested span
    const validateSpan = tracer.startSpan("validateOrder", {
      parent: span,
    });
    await validateOrder(orderId);
    validateSpan.end();

    // Another nested span
    const paymentSpan = tracer.startSpan("processPayment", {
      parent: span,
    });
    await processPayment(orderId);
    paymentSpan.end();

    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### Trace Context Propagation

```typescript
import { propagation, context } from "@opentelemetry/api";

// Extract context from incoming request
const extractedContext = propagation.extract(context.active(), req.headers);

// Make outbound request with context
await context.with(extractedContext, async () => {
  const headers = {};
  propagation.inject(context.active(), headers);

  await fetch("http://downstream-service/api", {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
});
```

## SLIs, SLOs, SLAs

### Service Level Indicators (SLIs)

```yaml
# Example SLIs
availability:
  definition: "Percentage of successful requests"
  query: |
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    /
    sum(rate(http_requests_total[5m]))

latency:
  definition: "95th percentile response time"
  query: |
    histogram_quantile(0.95,
      sum(rate(http_request_duration_seconds_bucket[5m]))
      by (le)
    )

error_rate:
  definition: "Percentage of failed requests"
  query: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    /
    sum(rate(http_requests_total[5m]))
```

### Service Level Objectives (SLOs)

```yaml
# SLO definitions
slos:
  - name: availability
    target: 99.9% # "three nines"
    window: 30d
    sli: availability

  - name: latency_p95
    target: 200ms
    window: 30d
    sli: latency

  - name: error_rate
    target: 0.1% # Max 0.1% errors
    window: 7d
    sli: error_rate
```

### Error Budget

```typescript
// Calculate error budget
interface SLO {
  target: number; // e.g., 0.999 for 99.9%
  window: number; // days
}

function calculateErrorBudget(slo: SLO, actualAvailability: number) {
  // Total requests in window
  const totalRequests = 1000000; // example

  // Allowed failures based on SLO
  const allowedFailures = totalRequests * (1 - slo.target);

  // Actual failures
  const actualFailures = totalRequests * (1 - actualAvailability);

  // Remaining budget
  const remainingBudget = allowedFailures - actualFailures;
  const budgetPercentage = (remainingBudget / allowedFailures) * 100;

  return {
    allowedFailures,
    actualFailures,
    remainingBudget,
    budgetPercentage,
    exhausted: remainingBudget <= 0,
  };
}

// Example: 99.9% SLO with 99.8% actual
const budget = calculateErrorBudget({ target: 0.999, window: 30 }, 0.998);
// Remaining budget: 50% (can tolerate 500 more failures)
```

## Alerting

### Prometheus Alert Rules

```yaml
# prometheus-alerts.yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total[5m]))
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m]))
            by (le)
          ) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"

      - alert: ErrorBudgetExhausted
        expr: |
          (1 - (sum(rate(http_requests_total{status!~"5.."}[30d]))
               /
               sum(rate(http_requests_total[30d]))))
          > 0.001  # 99.9% SLO
        labels:
          severity: critical
        annotations:
          summary: "Error budget exhausted"
          description: "SLO breach - stop feature deployments"
```

### Alertmanager Configuration

```yaml
# alertmanager.yaml
global:
  slack_api_url: "https://hooks.slack.com/services/xxx"

route:
  receiver: "default"
  group_by: ["alertname", "cluster"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: "pagerduty"
      continue: true
    - match:
        severity: warning
      receiver: "slack"

receivers:
  - name: "default"
    slack_configs:
      - channel: "#alerts"
        title: "{{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "pagerduty"
    pagerduty_configs:
      - service_key: "xxx"
```

## Grafana Dashboards

### Dashboard JSON

```json
{
  "dashboard": {
    "title": "API Service",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (method)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Latency (p50, p95, p99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p99"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

## Quick Reference

**PromQL queries:**

```promql
# Rate of requests
rate(http_requests_total[5m])

# Latency percentiles
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Aggregations
sum by (method) (rate(http_requests_total[5m]))
```

**Log queries (Loki):**

```logql
{service="api"} |= "error"
{service="api"} | json | level="error"
rate({service="api"}[5m])
```

## Resources

- Prometheus — https://prometheus.io/docs/
- OpenTelemetry — https://opentelemetry.io/docs/
- Grafana — https://grafana.com/docs/
- SRE Book (Google) — https://sre.google/books/
