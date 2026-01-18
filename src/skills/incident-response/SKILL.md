---
name: Incident Response
description: On-call procedures, incident management, runbooks, and blameless postmortems for production operations
---

# Incident Response Skill

Manage production incidents with clear procedures, effective communication, and continuous improvement.

## Incident Severity Levels

### Severity Definitions

```yaml
SEV0:
  name: Critical
  description: Complete service outage or data loss
  examples:
    - Service completely unavailable
    - Data corruption or loss
    - Security breach
  response_time: Immediate (< 5 minutes)
  escalation: Page all on-call engineers
  communication: Every 30 minutes

SEV1:
  name: High
  description: Major functionality unavailable
  examples:
    - Core feature broken for all users
    - Significant performance degradation
    - Payment processing down
  response_time: < 15 minutes
  escalation: Page primary on-call
  communication: Every hour

SEV2:
  name: Medium
  description: Partial functionality impaired
  examples:
    - Non-core feature broken
    - Performance issues affecting subset of users
    - Intermittent errors
  response_time: < 1 hour
  escalation: Alert on-call team
  communication: Every 4 hours

SEV3:
  name: Low
  description: Minor issue with workaround
  examples:
    - UI glitch
    - Non-critical API slowness
    - Monitoring alert false positive
  response_time: Next business day
  escalation: Create ticket
  communication: As needed
```

## On-Call Rotation

### PagerDuty Schedule

```yaml
# pagerduty-schedule.yaml
schedule:
  name: Engineering On-Call
  time_zone: America/New_York

  layers:
    - name: Primary
      rotation_virtual_start: "2024-01-01T00:00:00"
      rotation_turn_length_seconds: 604800 # 1 week
      users:
        - user_1
        - user_2
        - user_3

    - name: Secondary
      rotation_virtual_start: "2024-01-01T00:00:00"
      rotation_turn_length_seconds: 604800
      users:
        - user_4
        - user_5
        - user_6

  escalation_policies:
    - name: Engineering Escalation
      escalation_rules:
        - escalation_delay_in_minutes: 0
          targets:
            - type: schedule_reference
              id: primary_schedule
        - escalation_delay_in_minutes: 15
          targets:
            - type: schedule_reference
              id: secondary_schedule
        - escalation_delay_in_minutes: 30
          targets:
            - type: user_reference
              id: engineering_manager
```

### Handoff Procedure

```markdown
# On-Call Handoff Checklist

## Outgoing Engineer

- [ ] Review open incidents in last 7 days
- [ ] Document any ongoing issues
- [ ] Share context on flaky alerts
- [ ] Update runbook with recent changes
- [ ] Confirm incoming engineer is ready

## Incoming Engineer

- [ ] Review open incidents
- [ ] Check monitoring dashboards
- [ ] Verify access to systems
- [ ] Test pager notification
- [ ] Acknowledge handoff receipt

## Handoff Notes (Week of YYYY-MM-DD)

- Known issues: [describe]
- Recent changes: [list deployments]
- Watch items: [areas to monitor]
- Escalation contacts: [key people]
```

## Incident Commander Roles

### IC Responsibilities

```markdown
# Incident Commander (IC) Duties

## During Incident

1. **Declare incident** - Assess severity, create war room
2. **Assign roles** - Designate responders, scribe, comms lead
3. **Coordinate response** - Direct investigation, avoid duplicate work
4. **Make decisions** - Choose mitigation path, authorize rollbacks
5. **Manage communication** - Status updates, stakeholder notifications
6. **Track timeline** - Record key events, decisions, actions

## Roles to Assign

- **IC**: Overall coordinator
- **Scribe**: Document timeline and actions
- **Comms Lead**: External updates (status page, customers)
- **Subject Matter Experts (SMEs)**: Investigate and remediate
- **Executive Liaison**: Brief leadership (SEV0/SEV1 only)

## Decision Framework

- Prioritize mitigation over root cause
- "Stop the bleeding" first
- Rollback if in doubt
- Escalate for high-impact decisions
```

## Runbooks

### Runbook Template

````markdown
# Runbook: High API Latency

## Symptoms

- Alerts: `HighLatency` firing
- Metrics: p95 latency > 2s for 5+ minutes
- User impact: Slow page loads, timeouts

## Severity

SEV2 (SEV1 if affecting payment flows)

## Investigation Steps

### 1. Check Recent Deployments

```bash
kubectl rollout history deployment/api -n production
```
````

If deployed in last hour, consider rollback.

### 2. Check Database Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

### 3. Check External Dependencies

```bash
# Redis latency
redis-cli --latency

# External API health
curl -w "@curl-format.txt" https://api.external.com/health
```

### 4. Check Resource Utilization

```bash
# Pod CPU/memory
kubectl top pods -n production

# Node resources
kubectl top nodes
```

## Mitigation Options

### Option 1: Scale Up (Quick win)

```bash
kubectl scale deployment/api --replicas=10 -n production
```

**Risk**: Low
**ETA**: 2-3 minutes

### Option 2: Rollback Deployment

```bash
kubectl rollout undo deployment/api -n production
```

**Risk**: Medium (may introduce previous bugs)
**ETA**: 5 minutes

### Option 3: Restart Pods

```bash
kubectl rollout restart deployment/api -n production
```

**Risk**: Medium (brief connection interruptions)
**ETA**: 3-4 minutes

### Option 4: Enable Rate Limiting

```bash
# Apply rate limit config
kubectl apply -f rate-limit-strict.yaml
```

**Risk**: Low (may impact legitimate users)
**ETA**: 1 minute

## Escalation

If not resolved in 30 minutes:

- Escalate to: @backend-team-lead
- Conference bridge: zoom.us/j/incident-room
- Slack channel: #incident-response

## Post-Incident

- [ ] Write postmortem
- [ ] Update this runbook
- [ ] Create follow-up tasks

````

### Service Health Check Runbook

```bash
#!/bin/bash
# healthcheck-api.sh

echo "=== API Health Check ==="

# 1. Service status
echo -e "\n[1/5] Service Status"
kubectl get deployment api -n production
kubectl get pods -l app=api -n production

# 2. Endpoint health
echo -e "\n[2/5] Endpoint Health"
curl -sf http://api.example.com/health || echo "FAILED"

# 3. Error rate
echo -e "\n[3/5] Error Rate (last 5min)"
curl -s "http://prometheus:9090/api/v1/query" \
  --data-urlencode 'query=sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))' \
  | jq '.data.result[0].value[1]'

# 4. Latency
echo -e "\n[4/5] P95 Latency"
curl -s "http://prometheus:9090/api/v1/query" \
  --data-urlencode 'query=histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))' \
  | jq '.data.result[0].value[1]'

# 5. Dependencies
echo -e "\n[5/5] Dependencies"
echo -n "Database: "
pg_isready -h db.example.com && echo "OK" || echo "FAILED"
echo -n "Redis: "
redis-cli -h redis.example.com ping

echo -e "\n=== End Health Check ==="
````

## Communication Templates

### Initial Alert (Slack/Status Page)

```markdown
🚨 **INCIDENT DECLARED - SEV1**

**What**: API service experiencing high latency
**Impact**: Users seeing 5-10s page load times
**Affected**: All users (100%)
**Started**: 2024-01-15 14:32 UTC
**IC**: @alice

**Current Status**: Investigating root cause. Scaled up instances as interim mitigation.

**Next Update**: 15:00 UTC (30 minutes)

**War Room**: #incident-2024-01-15-api-latency
```

### Update Template

```markdown
📊 **INCIDENT UPDATE - SEV1** (15:00 UTC)

**Status**: Mitigated

**Actions Taken**:

- ✅ Scaled API deployment from 5 to 15 replicas
- ✅ Identified slow database query on orders table
- ✅ Added missing index on orders.user_id

**Current Metrics**:

- Latency p95: 250ms (was 8s)
- Error rate: 0.1% (was 5%)
- Affected users: ~0 (was 100%)

**Next Steps**:

- Monitor for 30 minutes before declaring resolved
- Postmortem scheduled for tomorrow 10am

**Next Update**: 15:30 UTC or when resolved
```

### Resolution Template

```markdown
✅ **INCIDENT RESOLVED - SEV1**

**Duration**: 1h 23m (14:32 - 15:55 UTC)
**Root Cause**: Missing database index causing full table scans
**Resolution**: Index added, latency returned to normal

**Impact**:

- Users affected: ~10,000 (100%)
- Revenue impact: Estimated $2,000 in lost transactions
- Support tickets: 47 filed

**Follow-up**:

- Postmortem: [link to doc]
- Action items tracked in JIRA-1234
- Next steps: Review all database queries for indexing

**Thanks to**: @alice (IC), @bob (DB SME), @carol (Comms)
```

## Blameless Postmortem

### Postmortem Template

````markdown
# Postmortem: API Latency Incident (2024-01-15)

## Metadata

- **Date**: 2024-01-15
- **Severity**: SEV1
- **Duration**: 1h 23m (14:32 - 15:55 UTC)
- **Authors**: Alice (IC), Bob (SME)
- **Status**: Complete

## Executive Summary

API service experienced severe latency (p95 >8s) for 83 minutes affecting all users. Root cause was missing database index on orders table after schema migration. Mitigated by adding index and scaling up instances.

## Impact

- **Users Affected**: ~10,000 (100% of active users)
- **Duration**: 83 minutes
- **Revenue Impact**: ~$2,000 estimated lost transactions
- **Error Budget**: Consumed 12% of monthly budget

## Timeline (all times UTC)

| Time  | Event                                             |
| ----- | ------------------------------------------------- |
| 14:20 | Deploy v1.2.3 with new orders query               |
| 14:32 | Alert: HighLatency firing                         |
| 14:33 | IC declares SEV1, creates war room                |
| 14:35 | Scale up from 5 to 10 replicas (no improvement)   |
| 14:42 | Check recent deploys - v1.2.3 suspicious          |
| 14:45 | Analyze query performance - orders table scan     |
| 14:50 | Identify missing index on orders.user_id          |
| 14:52 | Begin index creation (takes time on large table)  |
| 15:10 | Index creation complete                           |
| 15:12 | Latency drops to normal levels                    |
| 15:25 | Monitor confirms stable, scale back to 8 replicas |
| 15:55 | Declare incident resolved                         |

## Root Cause Analysis

### The Problem

New feature query in v1.2.3:

```sql
SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;
```
````

Schema migration script added `created_at` column but **forgot index on user_id**.

### Why It Happened (5 Whys)

1. **Why did latency spike?** Database doing full table scans
2. **Why full table scans?** Missing index on orders.user_id
3. **Why was index missing?** Migration script incomplete
4. **Why was migration incomplete?** No checklist for index review
5. **Why no checklist?** Migration process undocumented

## What Went Well

- ✅ Alert fired within 2 minutes
- ✅ IC declared incident quickly, good coordination
- ✅ Scaling provided temporary relief
- ✅ SME identified root cause efficiently
- ✅ Communication clear and timely

## What Went Wrong

- ❌ Migration didn't include required index
- ❌ No automated query performance testing
- ❌ No staging environment load test
- ❌ Rollback considered but took too long (large table)

## Action Items

| ID  | Action                                               | Owner   | Due Date   | Priority |
| --- | ---------------------------------------------------- | ------- | ---------- | -------- |
| 1   | Add index review checklist to migration template     | @bob    | 2024-01-20 | P0       |
| 2   | Implement query performance tests in CI              | @alice  | 2024-01-25 | P0       |
| 3   | Set up staging environment with production-like data | @devops | 2024-02-01 | P1       |
| 4   | Document fast rollback procedure for DB changes      | @bob    | 2024-01-22 | P1       |
| 5   | Add database query slow log monitoring               | @alice  | 2024-01-30 | P2       |

## Lessons Learned

- Database schema changes need explicit index review
- Load testing staging environment would have caught this
- Query performance should be part of CI pipeline
- Need faster rollback strategy for DB migrations

````

## Quick Reference

**Incident declaration:**
```bash
# Create incident channel
/incident create "High API latency affecting all users"

# Page on-call
pagerduty trigger SEV1 "High API latency"

# Start status page incident
statuspage create "Investigating API performance issues"
````

**Common commands:**

```bash
# Check deployment history
kubectl rollout history deployment/api

# Rollback
kubectl rollout undo deployment/api

# Scale up
kubectl scale deployment/api --replicas=10

# Check logs
kubectl logs -l app=api --tail=100 -f

# Check resource usage
kubectl top pods -l app=api
```

## Resources

- PagerDuty Docs — https://support.pagerduty.com/
- Incident Response (Atlassian) — https://www.atlassian.com/incident-management
- SRE Book (Google) — https://sre.google/sre-book/
- Blameless Postmortems — https://sre.google/sre-book/postmortem-culture/
