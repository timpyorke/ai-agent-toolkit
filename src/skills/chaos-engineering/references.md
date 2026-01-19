# Reference Material

## Core Principles

### 1. Define Steady State as Measurable Business Metrics
- Identify key business metrics that indicate normal system health (not just technical metrics)
- Use success rates, latencies, throughput as steady-state indicators
- Establish concrete thresholds that define "acceptable" performance
- Monitor these metrics continuously before, during, and after experiments

### 2. Hypothesize and Test, Don't Guess
- Formulate explicit hypotheses: "Given X, When Y, Then Z"
- Test assumptions about system behavior under failure
- Either confirm resilience or discover weaknesses to fix
- Document what you expect to happen before running experiments

### 3. Start Small and Minimize Blast Radius
- Begin with smallest possible scope (1% traffic, staging environment)
- Gradually increase blast radius only after validating safety
- Always have abort conditions and rollback plans ready
- Limit scope with selectors, percentages, and stop conditions

### 4. Inject Real-World Failures, Not Contrived Scenarios
- Simulate actual failure modes that happen in production (AZ outage, network partition)
- Test multiple failure types: network, compute, storage, dependency
- Combine failures to test cascading effects

### 5. Automate Chaos in CI/CD for Continuous Validation
- Don't just run one-off experiments - make chaos continuous
- Integrate chaos experiments into deployment pipelines
- Run scheduled game days to maintain team readiness

## Steady-State Hypothesis

```yaml
# chaos-experiment.yml
steadyStateHypothesis:
  title: System remains operational during pod failures
  probes:
    - name: application-is-healthy
      type: probe
      tolerance: true
      provider:
        type: http
        url: http://myapp/health
        timeout: 5

    - name: success-rate-above-99
      type: probe
      tolerance:
        type: range
        range: [99, 100]
      provider:
        type: prometheus
        query: |
          sum(rate(http_requests_total{status="200"}[1m])) /
          sum(rate(http_requests_total[1m])) * 100

    - name: latency-below-500ms
      type: probe
      tolerance:
        type: range
        range: [0, 500]
      provider:
        type: prometheus
        query: histogram_quantile(0.95, http_request_duration_seconds)
```

## Blast Radius Limitation

### 1. Scope Limiting

```yaml
# Only affect canary deployment
selector:
  labelSelectors:
    app: myapp
    version: canary # Not stable
```

### 2. Traffic Percentage

```yaml
# Only 5% of traffic
target:
  type: Random
  percentage: 5
```

### 3. Stop Conditions

```yaml
# Chaos Mesh: Stop if error rate too high
apiVersion: chaos-mesh.org/v1alpha1
kind: Workflow
metadata:
  name: safe-chaos
spec:
  entry: chaos-with-abort
  templates:
    - name: chaos-with-abort
      deadline: 5m
      abortWithStatusCheck:
        type: prometheus
        query: |
          rate(http_requests_total{status=~"5.."}[1m]) > 0.05
```

## Game Day Planning

### Objectives
Define what you want to validate, e.g., "Validate our system can handle a database failover".

### Runbook
Create a step-by-step guide including:
- Pre-game checklist
- Failure scenario details
- Expected behavior logic
- Monitoring points
- Rollback plan

### Execution
- Start monitoring
- Inject failure
- Observe system behavior
- Verify steady state at the end

### Debrief
- Document what went well
- Document issues found
- Create action items for fixes
