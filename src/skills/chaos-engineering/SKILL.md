# Chaos Engineering

> **Category**: Performance & Reliability  
> **Audience**: SREs, platform engineers, reliability teams  
> **Prerequisites**: Understanding of distributed systems, observability, resiliency patterns  
> **Complexity**: Advanced

## Overview

Chaos engineering proactively injects failures into systems to discover weaknesses before they cause outages. This skill covers Chaos Monkey and Gremlin, failure injection types (latency, errors, resource exhaustion), game days, blast radius limitation, steady-state hypothesis, automation, and learning from chaos experiments—building confidence in system resilience.

## Why Chaos Engineering?

**Traditional testing**: "Does the system work when everything is perfect?"

**Chaos engineering**: "Does the system work when things fail?"

**Real-world scenario**:

```
Netflix: "What if an entire AWS availability zone fails?"
→ Chaos Monkey randomly terminates EC2 instances
→ Discovered and fixed many failure modes
→ Survived actual AWS outages
```

## Principles of Chaos Engineering

### 1. Define Steady State

Measurable output that indicates normal system behavior.

**Examples**:

```
E-commerce:
  - Steady state: Order success rate > 99.5%
  - Steady state: p95 latency < 500ms

Video streaming:
  - Steady state: Stream start success rate > 99%
  - Steady state: Rebuffer rate < 0.5%
```

### 2. Hypothesize About Steady State

**Hypothesis format**:

```
Given [normal conditions]
When [failure injected]
Then [steady state maintained]

Example:
Given normal traffic (1000 req/s)
When one database replica fails
Then order success rate remains > 99.5%
```

### 3. Inject Real-World Failures

**Categories**:

- Network: latency, packet loss, partition
- Host: CPU spike, memory leak, disk full
- Service: crash, slow response, errors
- Infrastructure: AZ failure, region failure

### 4. Disprove Hypothesis

Run experiment and observe:

- ✅ Hypothesis holds → System is resilient
- ❌ Hypothesis disproved → Found weakness, fix it

### 5. Minimize Blast Radius

Start small, gradually increase scope.

```
Phase 1: 1% of traffic
Phase 2: 10% of traffic
Phase 3: 50% of traffic
Phase 4: 100% of traffic
```

## Failure Injection Types

### 1. Network Failures

#### Latency Injection

**Linux tc (traffic control)**

```bash
# Add 500ms latency to all traffic on eth0
sudo tc qdisc add dev eth0 root netem delay 500ms

# Add variable latency (100ms ± 50ms)
sudo tc qdisc add dev eth0 root netem delay 100ms 50ms

# Remove
sudo tc qdisc del dev eth0 root
```

**Docker container latency**

```bash
# Add 300ms latency to container
docker run --name myapp \
  --network testnet \
  pumba netem --duration 5m delay \
  --time 300 myapp
```

**Application-level (Node.js)**

```typescript
// Middleware to inject latency
app.use(async (req, res, next) => {
  if (process.env.CHAOS_LATENCY_MS) {
    const latency = parseInt(process.env.CHAOS_LATENCY_MS);
    await new Promise((resolve) => setTimeout(resolve, latency));
  }
  next();
});
```

#### Packet Loss

```bash
# Drop 10% of packets
sudo tc qdisc add dev eth0 root netem loss 10%

# Drop 5% with 25% correlation (bursty loss)
sudo tc qdisc add dev eth0 root netem loss 5% 25%
```

#### Network Partition

```bash
# Block traffic to specific IP
sudo iptables -A OUTPUT -d 10.0.1.100 -j DROP

# Block specific port
sudo iptables -A OUTPUT -p tcp --dport 5432 -j DROP

# Restore
sudo iptables -F
```

**Kubernetes network policy (split brain)**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: partition-services
spec:
  podSelector:
    matchLabels:
      app: service-a
  policyTypes:
    - Egress
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: NOT-service-b # Block traffic to service-b
```

### 2. Resource Exhaustion

#### CPU Stress

```bash
# stress-ng: Max out 4 CPU cores for 60 seconds
stress-ng --cpu 4 --timeout 60s

# dd: CPU stress (single core)
dd if=/dev/zero of=/dev/null
```

**Docker CPU limit**

```bash
# Limit container to 50% of 1 CPU
docker run --cpus="0.5" myapp
```

#### Memory Pressure

```bash
# Allocate and hold 2GB of memory
stress-ng --vm 1 --vm-bytes 2G --timeout 60s

# Python script
import numpy as np
memory_hog = []
for i in range(10):
    memory_hog.append(np.random.randn(1024, 1024, 100))  # ~800MB each
```

**Kubernetes memory limit**

```yaml
resources:
  limits:
    memory: "128Mi" # Low limit to trigger OOM
  requests:
    memory: "64Mi"
```

#### Disk Fill

```bash
# Fill disk with 10GB file
dd if=/dev/zero of=/tmp/10GB.file bs=1M count=10240

# Fill until 90% full
df -h / | awk 'NR==2 {print $5}' | sed 's/%//'
# Calculate size needed
```

### 3. Service Failures

#### Pod/Instance Termination

**Chaos Mesh (Kubernetes)**

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-kill
spec:
  action: pod-kill
  mode: one # Kill one pod
  selector:
    namespaces:
      - default
    labelSelectors:
      app: myapp
  scheduler:
    cron: "@every 10m"
```

**AWS FIS (Fault Injection Simulator)**

```yaml
action:
  - name: terminate-instances
    actionId: aws:ec2:terminate-instances
    parameters:
      instanceId: i-1234567890abcdef0
      percentage: 20 # Kill 20% of instances
```

#### Error Injection

**Application-level (Node.js)**

```typescript
// Inject random errors
app.use((req, res, next) => {
  if (process.env.CHAOS_ERROR_RATE) {
    const errorRate = parseFloat(process.env.CHAOS_ERROR_RATE);
    if (Math.random() < errorRate) {
      return res.status(500).json({ error: "Chaos engineering error" });
    }
  }
  next();
});
```

**Istio fault injection**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings-chaos
spec:
  hosts:
    - ratings
  http:
    - fault:
        abort:
          percentage:
            value: 10 # 10% of requests fail
          httpStatus: 503
      route:
        - destination:
            host: ratings
```

### 4. Dependency Failures

**Simulate third-party API failure**

```typescript
// Mock external API with WireMock
import { WireMock } from "wiremock";

// Configure to return errors
await WireMock.stubFor({
  request: {
    method: "GET",
    url: "/api/payment",
  },
  response: {
    status: 503,
    body: "Service Unavailable",
    fixedDelayMilliseconds: 5000,
  },
});
```

**Database failure**

```bash
# Stop database container
docker stop postgres-db

# Or introduce query latency
docker exec postgres-db pg_sleep(5)
```

## Chaos Engineering Tools

### Chaos Monkey (Netflix)

Original chaos engineering tool, terminates AWS instances randomly.

**Spinnaker Chaos Monkey**

```yaml
# chaos-monkey-config.yml
enabled: true
schedule:
  enabled: true
  frequency: 1 # Run once per day
accounts:
  - name: prod
    cloudProvider: aws
termination:
  enabled: true
  probability: 0.1 # 10% chance per hour
```

### Gremlin

Commercial chaos engineering platform with UI.

**Install Gremlin agent**

```bash
# Docker
docker run -d \
  --name gremlin \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_BOOT \
  --cap-add=SYS_TIME \
  --cap-add=KILL \
  -e GREMLIN_TEAM_ID=$TEAM_ID \
  -e GREMLIN_TEAM_SECRET=$TEAM_SECRET \
  gremlin/gremlin
```

**API: Inject CPU stress**

```bash
curl -X POST https://api.gremlin.com/v1/attacks/new \
  -H "Authorization: Key $API_KEY" \
  -d '{
    "target": {
      "type": "Random",
      "containers": {
        "labels": {
          "app": "myapp"
        }
      }
    },
    "command": {
      "type": "cpu",
      "args": ["-c", "4", "-l", "60"]
    }
  }'
```

### Chaos Mesh (Kubernetes)

Open-source chaos engineering for Kubernetes.

**Install**

```bash
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm install chaos-mesh chaos-mesh/chaos-mesh \
  --namespace=chaos-mesh \
  --create-namespace
```

**Network delay experiment**

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay
spec:
  action: delay
  mode: all
  selector:
    labelSelectors:
      app: myapp
  delay:
    latency: "300ms"
    correlation: "50"
    jitter: "50ms"
  duration: "5m"
```

**Pod failure experiment**

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure
spec:
  action: pod-failure
  mode: one
  selector:
    labelSelectors:
      app: myapp
  duration: "30s"
  scheduler:
    cron: "@every 5m"
```

### AWS Fault Injection Simulator (FIS)

Managed chaos engineering for AWS.

**Experiment template**

```yaml
description: Terminate 20% of EC2 instances
targets:
  myInstances:
    resourceType: aws:ec2:instance
    selectionMode: PERCENT(20)
    resourceTags:
      Environment: staging
    filters:
      - path: State.Name
        values: ["running"]
actions:
  terminateInstances:
    actionId: aws:ec2:terminate-instances
    parameters:
      instanceId: $myInstances
stopConditions:
  - source: aws:cloudwatch:alarm
    value: arn:aws:cloudwatch:us-east-1:123456789:alarm:HighErrorRate
roleArn: arn:aws:iam::123456789:role/FISRole
```

### Litmus Chaos (Kubernetes)

Cloud-native chaos engineering framework.

**Install**

```bash
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-latest.yaml
```

**Pod delete chaos**

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine
spec:
  appinfo:
    appns: default
    applabel: "app=nginx"
  chaosServiceAccount: pod-delete-sa
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: "60"
            - name: CHAOS_INTERVAL
              value: "10"
            - name: FORCE
              value: "false"
```

## Game Days

Scheduled chaos engineering exercises involving the whole team.

### Planning a Game Day

**1. Define Objectives**

```
Goal: Validate our system can handle a database failover

Success criteria:
  - Order success rate > 99%
  - p95 latency < 1s
  - No manual intervention required
  - Automatic failover completes in < 60s
```

**2. Create Runbook**

```markdown
# Database Failover Game Day

## Pre-game Checklist

- [ ] Alert all stakeholders
- [ ] Verify monitoring dashboards
- [ ] Enable verbose logging
- [ ] Prepare rollback plan

## Failure Scenario

10:00 AM: Primary database goes down (simulated)

## Expected Behavior

- Connection pool detects failure
- Traffic routes to read replica
- Replica promoted to primary
- Service resumes normal operation

## Monitoring Points

- Order success rate (target: > 99%)
- Database connection errors
- Failover time
- Manual interventions

## Rollback Plan

If order success rate < 95%:

1. Stop chaos experiment
2. Restore primary database
3. Verify metrics return to normal
```

**3. Execute**

```bash
# T+0: Start monitoring
open https://grafana.company.com/dashboard/game-day

# T+1: Inject failure
kubectl delete pod postgres-primary

# T+2 to T+30: Observe system behavior
# Watch for:
#   - Auto-failover triggered
#   - Traffic reroutes
#   - Errors logged
#   - Alerts fired

# T+30: Verify steady state
# Order success rate: 99.2% ✅
# p95 latency: 850ms ✅
# Failover time: 42s ✅
```

**4. Debrief**

```markdown
## What Went Well

- Auto-failover completed in 42s
- No data loss
- Order success rate remained above target

## Issues Found

- Connection pool took 12s to detect failure
- 30 orders failed during switchover
- Alert fired 15s after failure (too slow)

## Action Items

- [ ] Reduce connection pool health check interval to 5s
- [ ] Implement retry logic for failed orders
- [ ] Tune alert thresholds for faster detection
```

### Game Day Scenarios

**1. Availability Zone Failure**

```yaml
# Drain entire AZ
kubectl cordon node-az-1a-*
kubectl drain node-az-1a-* --ignore-daemonsets
```

**2. Dependency Outage**

```
Simulate: Payment provider API is down
Expected: Graceful degradation, queue orders for later
```

**3. Traffic Spike**

```bash
# Sudden 10x traffic increase
k6 run --vus 1000 load-test.js
```

**4. Cascading Failure**

```
Trigger: Database slow query
Effect: Connection pool exhausted
Effect: API timeouts
Effect: Load balancer marks instances unhealthy
Expected: Circuit breakers prevent cascade
```

## Steady-State Hypothesis

Formal definition of expected system behavior.

### Example Hypothesis

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

method:
  - type: action
    name: terminate-pod
    provider:
      type: kubernetes
      action: delete_pod
      label_selector: app=myapp
      ns: default

rollbacks:
  - name: scale-up-replicas
    provider:
      type: kubernetes
      action: scale_deployment
      name: myapp
      replicas: 5
```

## Automation and CI/CD Integration

### Automated Chaos Experiments

**GitLab CI**

```yaml
# .gitlab-ci.yml
chaos-test:
  stage: test
  script:
    - kubectl apply -f chaos-experiments/
    - sleep 300 # Wait for experiment
    - ./scripts/verify-steady-state.sh
  only:
    - schedules # Run on schedule, not every commit
  environment:
    name: staging
```

**GitHub Actions**

```yaml
name: Chaos Engineering

on:
  schedule:
    - cron: "0 2 * * 1" # Every Monday at 2 AM

jobs:
  chaos-experiment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Chaos Mesh CLI
        run: |
          curl -sSL https://mirrors.chaos-mesh.org/latest/install.sh | bash

      - name: Run pod-kill experiment
        run: |
          kubectl apply -f experiments/pod-kill.yaml

      - name: Wait for experiment
        run: sleep 300

      - name: Verify steady state
        run: |
          python scripts/check-metrics.py \
            --success-rate-min 99 \
            --latency-p95-max 500

      - name: Cleanup
        if: always()
        run: kubectl delete -f experiments/pod-kill.yaml
```

### Progressive Chaos

Start small, increase scope over time.

```python
# progressive-chaos.py
import time

def run_chaos_experiment(blast_radius_percent):
    print(f"Running experiment with {blast_radius_percent}% blast radius")

    # Inject chaos
    inject_latency(target_percent=blast_radius_percent)

    time.sleep(300)  # 5 minutes

    # Verify metrics
    success_rate = get_success_rate()

    if success_rate < 99:
        print(f"❌ Failed at {blast_radius_percent}%")
        return False

    print(f"✅ Passed at {blast_radius_percent}%")
    return True

# Progressive rollout
for blast_radius in [1, 5, 10, 25, 50, 100]:
    if not run_chaos_experiment(blast_radius):
        print("Stopping progressive chaos due to failure")
        break
```

## Blast Radius Limitation

Prevent chaos experiments from causing production outages.

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

**AWS FIS stop conditions**

```yaml
stopConditions:
  - source: aws:cloudwatch:alarm
    value: arn:aws:cloudwatch:us-east-1:123:alarm:HighErrorRate
  - source: aws:cloudwatch:alarm
    value: arn:aws:cloudwatch:us-east-1:123:alarm:HighLatency
```

### 4. Manual Abort

```bash
# Chaos Mesh: Pause experiment
kubectl annotate podchaos pod-kill chaos-mesh.org/pause=true

# Resume
kubectl annotate podchaos pod-kill chaos-mesh.org/pause-
```

## Observability During Chaos

### Key Metrics to Monitor

```yaml
# Grafana dashboard
panels:
  - title: Request Success Rate
    targets:
      - expr: |
          sum(rate(http_requests_total{status=~"2.."}[1m])) /
          sum(rate(http_requests_total[1m])) * 100

  - title: p95 Latency
    targets:
      - expr: histogram_quantile(0.95, http_request_duration_seconds)

  - title: Error Rate
    targets:
      - expr: sum(rate(http_requests_total{status=~"5.."}[1m]))

  - title: Active Pods
    targets:
      - expr: count(kube_pod_status_phase{phase="Running"})

  - title: CPU Usage
    targets:
      - expr: sum(rate(container_cpu_usage_seconds_total[1m]))
```

### Distributed Tracing

```typescript
// Trace requests during chaos
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("chaos-experiment");

app.use(async (req, res, next) => {
  const span = tracer.startSpan("http-request", {
    attributes: {
      "chaos.active": process.env.CHAOS_ACTIVE === "true",
      "chaos.type": process.env.CHAOS_TYPE || "none",
    },
  });

  try {
    await next();
  } finally {
    span.end();
  }
});
```

## Best Practices

### ✅ DO

1. **Start small**

```
Week 1: Kill one pod in staging
Week 2: Kill multiple pods in staging
Week 3: Kill one pod in production (1% traffic)
Week 4: Kill multiple pods in production (10% traffic)
```

2. **Always have a hypothesis**

```yaml
hypothesis:
  Given: 10 replicas of myapp
  When: Kill 2 replicas
  Then: Traffic automatically reroutes to healthy pods
  And: Success rate remains > 99%
```

3. **Monitor during experiments**

```bash
# Watch key metrics
watch -n 5 'curl -s http://prometheus/api/v1/query?query=...'
```

4. **Learn from failures**

```markdown
## Experiment Failed ❌

Success rate dropped to 95%

Root cause: No connection pool retry logic

Fix: Implement retry with exponential backoff
```

### ❌ DON'T

1. **Don't run chaos in production without approval**

```
❌ Surprise chaos test
✅ Scheduled game day with stakeholders notified
```

2. **Don't ignore stop conditions**

```yaml
# ✅ Always define abort conditions
stopConditions:
  - errorRate > 5%
  - latencyP95 > 1000ms
```

3. **Don't experiment without observability**

```
❌ Inject failure, hope for the best
✅ Monitor metrics, logs, traces during experiment
```

## Quick Reference

```bash
# Chaos Mesh: Pod kill
kubectl apply -f pod-chaos.yaml

# Chaos Mesh: Network latency
kubectl apply -f network-chaos.yaml

# AWS FIS: Terminate instances
aws fis start-experiment --experiment-template-id <template-id>

# Linux tc: Add latency
sudo tc qdisc add dev eth0 root netem delay 300ms

# stress-ng: CPU stress
stress-ng --cpu 4 --timeout 60s

# Gremlin API: CPU attack
curl -X POST https://api.gremlin.com/v1/attacks/new \
  -H "Authorization: Key $API_KEY" \
  -d '{"command": {"type": "cpu", "args": ["-c", "4"]}}'
```

## Additional Resources

- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Chaos Monkey by Netflix](https://netflix.github.io/chaosmonkey/)
- [Chaos Mesh Documentation](https://chaos-mesh.org/docs/)
- [AWS Fault Injection Simulator](https://aws.amazon.com/fis/)
- [Gremlin Free Chaos Engineering Guide](https://www.gremlin.com/chaos-engineering/)
- [Site Reliability Engineering Book (Google)](https://sre.google/books/)

---

**Related Skills**: [resiliency-patterns](../resiliency-patterns/SKILL.md) | [load-testing](../load-testing/SKILL.md) | [observability](../observability/SKILL.md) | [incident-response](../incident-response/SKILL.md)
