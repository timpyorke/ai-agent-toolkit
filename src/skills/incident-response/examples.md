# Examples

## Incident Runbooks

### Runbook Template (Markdown)
```markdown
# [SERVICE] High Latency Runbook

**Severity**: SEV-2
**Trigger**: P99 Latency > 500ms for 5 minutes

## Prerequisite Checks
1. [ ] Check Datadog Dashboard: [Link]
2. [ ] Check Status Page: [Link]

## Investigation Steps
1. **Identify the Component**
   - Is it the Database? Check CPU/Connections.
   - Is it the Upstream API? Check dependency graphs.

2. **Check Recent Changes**
   - Was there a deployment in the last hour?
   - Command: `kubectl get deployments`

3. **Analyze Logs**
   - Filter for errors: `env:prod service:api status:error`

## Mitigation Actions
- **Rollback Deployment**:
  ```bash
  kubectl rollout undo deployment/api-service
  ```
- **Scale Up**:
  ```bash
  kubectl scale deployment/api-service --replicas=10
  ```
- **Enable Circuit Breaker**:
  toggle feature flag `enable_circuit_breaker` to `true`

## Escalation Policy
- If not resolved in 15 mins -> Page Engineering Manager
- If not resolved in 30 mins -> Page CTO
```

### Communication Templates

#### Internal Status Update (Slack)
```markdown
**[Ack] SEV-2: API High Latency**
**Incident Commander**: @alice
**Status**: Investigating
**Impact**: Login requests are timing out for ~5% of users.
**Actions**: Rolling back the latest deployment (v1.2.3).
**Next Update**: 15 mins
```

#### Public Status Update
```markdown
**Investigating**: We are currently experiencing degraded performance on our API. Users may perceive slow loading times. Our team is investigating the issue.
```

## Post-Mortem

### Post-Mortem Template
```markdown
# Incident Post-Mortem: [Incident Name]

**Date**: 2023-10-27
**Authors**: @alice, @bob
**Status**: Draft / Review / Completed
**Severity**: SEV-1
**Time to Detect (TTD)**: 5m
**Time to Resolve (TTR)**: 25m

## Summary
Brief description of what happened, the impact, and the root cause.

## Impact
- 15% of API requests set 500 errors.
- 200 Customers affected.

## Timeline
- **10:00 UTC**: Alert fired for high error rate.
- **10:05 UTC**: @alice acknowledged page.
- **10:10 UTC**: Rolling back deployment.
- **10:25 UTC**: Rollback complete, error rate normal.

## Root Cause Analysis (5 Whys)
1. Why did the API fail? -> Database connection pool exhaustion.
2. Why was the pool exhausted? -> New code leaked connections.
3. Why did code leak connections? -> Missing `finally { conn.close() }` block.
4. Why wasn't this caught in review? -> Reviewer missed it, no lint rule.
5. Why no lint rule? -> Custom DB wrapper not covered by standard rules.

## Corrective Actions
- [ ] Fix connection leak (Immediate)
- [ ] Add lint rule for DB connections (Preventative)
- [ ] Add alert for connection pool usage > 80% (Detection)
```

## Automation Scripts

### Slack Alerting (Python)
```python
import requests
import json

def send_incident_alert(channel, message, severity="SEV-2"):
    webhook_url = "https://hooks.slack.com/services/..."
    
    color = "#ff0000" if severity == "SEV-1" else "#ffa500"
    
    payload = {
        "channel": channel,
        "attachments": [
            {
                "color": color,
                "title": f"[{severity}] Incident Alert",
                "text": message,
                "fields": [
                    {"title": "Status", "value": "Triggered", "short": True},
                    {"title": "Engineer", "value": "<!here>", "short": True}
                ]
            }
        ]
    }
    
    requests.post(webhook_url, data=json.dumps(payload))
```
