# Reference Material

## Core Principles

1. **Explicit Roles**: Each agent has clear capability boundaries.
2. **Structured Messaging**: Use schemas (JSON) to prevent parsing errors.
3. **Safe Handoffs**: Validate output of Agent A before feeding to Agent B.
4. **Shared Context**: Maintain minimal sufficient state; avoid global mutable dumps.
5. **Observability**: Trace execution across agent boundaries.

## Architecture Patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Coordinator (Hub-and-Spoke)** | Central brain directs traffic. | Complex dependencies, conflict resolution. |
| **Pipeline (Chain)** | Linear sequence of steps. | Deterministic workflows (Lint -> Test -> Build). |
| **Peer-to-Peer (Swarm)** | Agents broadcast/subscribe. | Emergent behavior, decentralized adaptation. |

## Handoff Checklist

- [ ] **Preconditions Met**: Are inputs valid?
- [ ] **Success Criteria**: Did the previous agent complete the *entire* task?
- [ ] **State Cleanliness**: Is the shared context polluted with irrelevant thoughts?
- [ ] **Rollback Path**: Can we revert if the next step fails?

## Anti-Patterns

- **God Agent**: One agent doing everything (monolith).
- **Infinite Loops**: Two agents replying to each other forever without a stop condition.
- **Hidden Context**: Implicit assumptions not in the message payload.
- **Brittle Parsing**: Relying on regex instead of structured output (JSON).
