# Examples

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

### Resource Exhaustion

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

### Service Failures

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

### Dependency Failures

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

## Tools Configuration

### Chaos Engineering Platforms

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

**Gremlin (Install)**

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

**Chaos Mesh (Network Delay)**

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

**AWS FIS Experiment Template**

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

## Game Day Examples

### Runbook Example

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

### Game Day Execution Commands

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

## Automation

### GitHub Actions Workflow

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

### Progressive Chaos Script

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
