# Examples

## Structured Logging

### JSON Logger (Winston)
```typescript
import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "api" },
  transports: [new winston.transports.Console()]
});

// Implementation
logger.info("Order processed", {
  orderId: "123",
  amount: 49.99,
  userId: "u-456"
});
```

### Correlation IDs
```typescript
import { randomUUID } from "crypto";

function middleware(req, res, next) {
  const id = req.headers["x-trace-id"] || randomUUID();
  req.logger = logger.child({ traceId: id });
  res.setHeader("x-trace-id", id);
  next();
}
```

## Metrics (Prometheus)

### RED Method Instrumentation
```typescript
import { Counter, Histogram } from "prom-client";

const reqCount = new Counter({
  name: "http_requests_total",
  labelNames: ["method", "status"]
});

const reqDuration = new Histogram({
  name: "http_request_duration_seconds",
  buckets: [0.1, 0.5, 1, 2]
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    reqCount.inc({ method: req.method, status: res.statusCode });
    reqDuration.observe(duration);
  });
  next();
});
```

## Distributed Tracing

### OpenTelemetry Setup
```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter(),
  serviceName: "my-service"
});
sdk.start();
```

## SLOs & Error Budgets

### Error Budget Calculation
```typescript
function checkBudget(totalRequests, errorCount, targetSLO=0.999) {
  const allowedErrors = totalRequests * (1 - targetSLO);
  const remaining = allowedErrors - errorCount;
  return {
    remainingErrors: remaining,
    isBreached: remaining < 0
  };
}
```

## Dashboard & Alerts

### Grafana Panel (JSON)
```json
{
  "title": "Error Rate",
  "type": "graph",
  "targets": [{
    "expr": "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m]))"
  }]
}
```

### Prometheus Alert Rule
```yaml
groups:
- name: availability
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
```
