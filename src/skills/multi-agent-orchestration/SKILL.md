---
name: multi-agent-orchestration
description: Coordinate multiple AI agents via clear roles, structured messaging, safe handoffs, and monitored workflows to achieve complex tasks.
---

# 🤝 Multi-Agent Orchestration

## Overview

Multi-agent orchestration designs how specialized agents collaborate. It defines roles, shared context, message protocols, handoffs, conflict resolution, and monitoring. Done well, it scales complex work through parallelism and specialization while preserving safety and accountability.

## Core Principles

1. Explicit roles: define capabilities, boundaries, and decision rights per agent.
2. Structured messages: JSON schemas with intent, inputs, outputs, and status.
3. Shared context: minimal, relevant state; versioned; avoid leakage of secrets.
4. Safe handoffs: preconditions, acceptance criteria, and rollback paths.
5. Observe and adapt: track progress, detect deadlocks, and re-route when needed.

## Architectures

### Coordinator (Hub-and-Spoke)

- A central coordinator assigns tasks, gathers results, and resolves conflicts.
- Best when tasks depend on shared sequencing and global knowledge.

### Pipeline (Assembly Line)

- Stages process artifacts in order; each agent owns a stage.
- Best for deterministic workflows (lint → test → build → deploy).

### Peer-to-Peer (Swarm)

- Agents broadcast capabilities and subscribe to work; emergent coordination.
- Requires robust protocols and conflict resolution strategies.

## Message Schema

```json
{
  "id": "uuid",
  "from": "agent-name",
  "to": "agent-name|coordinator",
  "intent": "plan|execute|verify|handoff|report|escalate",
  "context": { "correlationId": "uuid", "version": 3 },
  "input": {
    /* domain-specific */
  },
  "constraints": { "timeoutMs": 5000, "maxCost": 100 },
  "status": "queued|in_progress|completed|failed",
  "output": {
    /* domain-specific */
  },
  "errors": [{ "code": "...", "message": "..." }]
}
```

## Handoffs & Acceptance

- Preconditions: required files, credentials, or upstream artifacts available.
- Acceptance: objective criteria (tests pass, schema validated, coverage met).
- Rollback: clearly defined previous stable state and revert steps.

## Concurrency & Scheduling

- Limit parallel work per agent; avoid resource contention.
- Use work queues with priorities; support retries and dead-letter queues.
- Detect livelocks: heartbeat and progress signals; timeouts to auto-escalate.

## Best Practices

- Keep roles small and composable; avoid monolithic "do-everything" agents.
- Encode protocols as schemas; validate at every hop.
- Track lineage: who produced what, when, and with which inputs.
- Log structured events; emit metrics for throughput, errors, and wait times.
- Simulate workflows with mocks before production use.

## Anti-Patterns

- Unstructured free-form messages; brittle parsing and hidden assumptions.
- Shared global mutable state; race conditions and leakage.
- Handoffs without acceptance criteria; blame shifting and rework.
- Infinite retries without backoff; queue storms and cost spikes.
- No coordinator in dependency-heavy tasks; deadlocks and confusion.

## Scenarios

### Code Review Pipeline

1. Authoring agent prepares PR and self-checks.
2. Lint/test agent validates; security agent scans.
3. Coordinator aggregates results; blocker agent requests changes.
4. Merge agent executes on green; release agent publishes.

### Incident Response

1. Detection agent creates an incident with context.
2. Triage agent classifies severity and routes tasks.
3. Mitigation agent applies runbook steps.
4. Postmortem agent collects data and drafts a report.

### Research→Execute Loop

1. Research agent gathers sources and summarizes.
2. Planning agent proposes steps and dependencies.
3. Execution agent runs tasks with tool use.
4. Verification agent checks outputs and acceptance.

## Tools & Techniques

- Queues: SQS/RabbitMQ/Kafka for task dispatch
- Schemas: JSON Schema/Zod for message validation
- Stores: Redis/Postgres for state and lineage
- Orchestration: Temporal/Airflow/Dagster for long-running workflows
- Observability: OpenTelemetry traces; Prometheus metrics

## Quick Reference

```bash
# Example message envelope
cat <<'JSON' | jq '.intent, .status'
{
  "id": "123",
  "from": "planner",
  "to": "executor",
  "intent": "execute",
  "context": {"correlationId": "abc"},
  "input": {"task": "build"},
  "status": "queued"
}
JSON
```

## Conclusion

Clear roles, structured protocols, safe handoffs, and observability unlock multi-agent productivity. Start simple, validate messages, monitor progress, and evolve coordination patterns as workflows mature.

---

**Related Skills**: [tool-use](../tool-use/SKILL.md) | [observability](../observability/SKILL.md) | [incident-response](../incident-response/SKILL.md)
