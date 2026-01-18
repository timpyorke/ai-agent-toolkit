---
name: chaos-engineering
description: Proactively inject failures to discover weaknesses and build confidence in system resilience
---

# 🔥 Chaos Engineering Skill

## Overview

This skill enables AI assistants to design and execute chaos engineering experiments that proactively inject failures into systems to discover weaknesses before they cause production outages. By systematically testing how systems behave under failure conditions, teams build confidence in resilience, uncover hidden dependencies, and improve incident response capabilities.

## Core Principles

### 1. Define Steady State as Measurable Business Metrics

- Identify key business metrics that indicate normal system health (not just technical metrics)
- Use success rates, latencies, throughput as steady-state indicators
- Establish concrete thresholds that define "acceptable" performance
- Monitor these metrics continuously before, during, and after experiments
- Example: "Order success rate > 99.5%" not "servers are running"

### 2. Hypothesize and Test, Don't Guess

- Formulate explicit hypotheses: "Given X, When Y, Then Z"
- Test assumptions about system behavior under failure
- Either confirm resilience or discover weaknesses to fix
- Document what you expect to happen before running experiments
- Learn from both successes (system resilient) and failures (found gap)

### 3. Start Small and Minimize Blast Radius

- Begin with smallest possible scope (1% traffic, staging environment)
- Gradually increase blast radius only after validating safety
- Always have abort conditions and rollback plans ready
- Limit scope with selectors, percentages, and stop conditions
- Never risk full production outage without proven safety mechanisms

### 4. Inject Real-World Failures, Not Contrived Scenarios

- Simulate actual failure modes that happen in production (AZ outage, network partition)
- Test multiple failure types: network, compute, storage, dependency
- Combine failures to test cascading effects
- Avoid testing things that never actually fail in your environment
- Learn from actual incidents to guide chaos scenarios

### 5. Automate Chaos in CI/CD for Continuous Validation

- Don't just run one-off experiments - make chaos continuous
- Integrate chaos experiments into deployment pipelines
- Run scheduled game days to maintain team readiness
- Automate verification of steady-state conditions
- Build chaos as a regular practice, not a special event

## Failure Injection Techniques

### Network Failures

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

## Tools & Techniques

### Chaos Engineering Platforms

**Chaos Monkey (Netflix)** - Original chaos engineering tool

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

### Experiment Design

- Start with staging environments before production
- Define clear steady-state metrics and thresholds
- Write explicit hypothesis before running experiment
- Document expected behavior and actual outcomes
- Include blast radius limits and stop conditions

### Execution Safety

- Notify stakeholders before production chaos experiments
- Schedule game days during low-traffic periods when possible
- Have rollback and abort procedures ready
- Monitor key metrics continuously during experiments
- Keep communication channels open during execution

### Learning and Iteration

- Document both successful and failed experiments
- Conduct post-experiment reviews with full team
- Track action items and follow up on discovered weaknesses
- Share learnings across teams and organization
- Gradually increase complexity of experiments over time

### Automation

- Integrate chaos experiments into CI/CD pipelines
- Run experiments on schedule to catch regressions
- Automate steady-state verification checks
- Use progressive rollout for increasing blast radius
- Build chaos testing as continuous practice

## Anti-Patterns to Avoid

### Don't:

- ❌ Run surprise chaos experiments without team notification or approval
- ❌ Skip defining hypothesis - just "see what breaks"
- ❌ Ignore abort conditions when metrics exceed thresholds
- ❌ Experiment in production without robust observability in place
- ❌ Run chaos during peak traffic or critical business periods
- ❌ Keep chaos findings siloed - not sharing learnings with team
- ❌ Make blast radius too large in initial experiments

### Do:

- ✅ Schedule game days with stakeholder notification and approval
- ✅ Write explicit hypothesis: "Given X, When Y, Then Z"
- ✅ Always define stop conditions and respect them immediately
- ✅ Ensure comprehensive monitoring before any chaos experiment
- ✅ Schedule experiments during low-risk time windows
- ✅ Share findings, conduct retrospectives, track improvements
- ✅ Start with 1% blast radius, increase gradually after validation

## Handling Different Scenarios

### Scenario 1: First Chaos Experiment for a Team

1. **Start in staging**: Never begin chaos journey in production
2. **Choose simple failure**: Pod termination is good first experiment
3. **Define hypothesis**: "System remains healthy when 1 pod killed"
4. **Monitor closely**: Watch all key metrics during experiment
5. **Document learnings**: Record what happened, even if successful

```yaml
# First experiment: Kill one pod in staging
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: my-first-chaos
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - staging
    labelSelectors:
      app: myapp
  duration: "30s"
```

### Scenario 2: Planning a Game Day

1. **Define objectives**: What resilience capability are we validating?
2. **Create runbook**: Document pre-checks, failure scenario, expected behavior
3. **Set success criteria**: Specific metrics that define success
4. **Notify stakeholders**: Get approval and set expectations
5. **Execute and observe**: Run experiment, monitor metrics
6. **Debrief thoroughly**: What went well, what broke, action items

```markdown
# Database Failover Game Day Runbook

## Objective

Validate automatic database failover with < 60s downtime

## Pre-Game Checklist

- [ ] Alert all stakeholders
- [ ] Verify monitoring dashboards operational
- [ ] Confirm rollback procedure
- [ ] Set up incident channel

## Failure Scenario

10:00 AM: Primary database terminated

## Expected Behavior

- Connection pool detects failure within 10s
- Replica promoted to primary automatically
- Traffic reroutes within 60s
- Order success rate remains > 99%

## Success Criteria

- Failover completes in < 60s
- Order success rate > 99%
- No manual intervention required

## Abort Conditions

- Order success rate < 95%
- Latency p95 > 2s
```

### Scenario 3: Progressive Production Rollout

1. **Start with 1% traffic**: Smallest meaningful production test
2. **Validate metrics**: Ensure steady state maintained
3. **Increase gradually**: 1% → 5% → 10% → 25% → 50%
4. **Stop if issues**: Abort at first sign of steady-state violation
5. **Document thresholds**: At what blast radius did system struggle?

```python
# Progressive chaos rollout
for blast_radius in [1, 5, 10, 25, 50, 100]:
    print(f"Testing {blast_radius}% blast radius")

    inject_pod_failures(percentage=blast_radius)
    time.sleep(300)  # 5 minute experiment

    success_rate = get_success_rate()
    if success_rate < 99:
        print(f"❌ Failed at {blast_radius}%")
        abort_experiment()
        break

    print(f"✅ Passed at {blast_radius}%")
```

### Scenario 4: Discovering Hidden Dependencies

1. **Hypothesis**: Service A doesn't depend on Service B
2. **Experiment**: Inject failures into Service B
3. **Observation**: Service A error rate increases unexpectedly
4. **Discovery**: Found undocumented dependency through caching layer
5. **Action**: Document dependency, add circuit breaker

```yaml
# Test hypothesis about service dependencies
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: test-service-b-dependency
spec:
  action: partition
  mode: all
  selector:
    labelSelectors:
      app: service-b
  direction: to
  target:
    selector:
      labelSelectors:
        app: service-a
  duration: "5m"
```

## Quick Reference

### Experiment Workflow

```markdown
1. Define steady state (success rate > 99%)
2. Write hypothesis (Given X, When Y, Then Z)
3. Set blast radius (start with 1%)
4. Define stop conditions (abort if metrics drop)
5. Execute experiment
6. Monitor metrics continuously
7. Document findings
8. Fix discovered issues
```

### Common Failure Types

| Type                 | Tool       | Command                                               |
| -------------------- | ---------- | ----------------------------------------------------- |
| Pod kill             | Chaos Mesh | `kubectl apply -f pod-chaos.yaml`                     |
| Network latency      | tc         | `tc qdisc add dev eth0 root netem delay 300ms`        |
| CPU stress           | stress-ng  | `stress-ng --cpu 4 --timeout 60s`                     |
| Instance termination | AWS FIS    | `aws fis start-experiment --experiment-template-id X` |
| Network partition    | iptables   | `iptables -A OUTPUT -d 10.0.1.100 -j DROP`            |

### Hypothesis Template

```yaml
hypothesis:
  given: "Normal traffic at 1000 req/s with 10 replicas"
  when: "Kill 2 random pods"
  then: "Success rate remains > 99%"
  and: "p95 latency stays < 500ms"
  and: "No manual intervention required"
```

### Chaos Mesh Quick Examples

```bash
# Pod kill
kubectl apply -f - <<EOF
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-kill
spec:
  action: pod-kill
  mode: one
  selector:
    labelSelectors:
      app: myapp
EOF

# Network delay
kubectl apply -f - <<EOF
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
EOF
```

### Progressive Blast Radius

```
Week 1: Staging, 1 pod
Week 2: Staging, multiple pods
Week 3: Production, 1% traffic
Week 4: Production, 5% traffic
Week 5: Production, 10% traffic
```

## Conclusion

Chaos engineering transforms uncertainty into confidence by systematically testing how systems behave under failure conditions. By proactively injecting failures in controlled experiments, teams discover weaknesses before they cause production incidents, validate resilience patterns actually work, and build organizational muscle memory for incident response. The key is starting small with clear hypotheses, minimizing blast radius, monitoring continuously, and learning from every experiment. Whether using Chaos Mesh in Kubernetes, AWS FIS in cloud infrastructure, or simple tools like tc and stress-ng, the practice of chaos engineering builds resilient systems through empirical validation rather than hopeful assumptions.

**Remember**: Hope is not a strategy - test your system's resilience before production tests it for you.

---

**Related Skills**: [resiliency-patterns](../resiliency-patterns/SKILL.md) | [load-testing](../load-testing/SKILL.md) | [observability](../observability/SKILL.md) | [incident-response](../incident-response/SKILL.md)
