# Examples

## Message Protocols

### Standard JSON Envelope
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "from": "planning-agent",
  "to": "execution-agent",
  "intent": "execute_task",
  "context": {
    "correlationId": "abc-123",
    "workflowId": "workflow-xyz",
    "version": 1
  },
  "content": {
    "task_type": "code_generation",
    "parameters": {
      "language": "python",
      "prompt": "Create a fibonacci function"
    }
  },
  "constraints": {
    "timeout_ms": 5000,
    "max_retries": 3
  },
  "status": "queued",
  "metadata": {
    "priority": "high",
    "trace_id": "trace-789"
  }
}
```

## Orchestration Patterns

### Central Coordinator (Python)
```python
class Coordinator:
    def __init__(self, agents):
        self.agents = agents
        self.history = []

    async def run_workflow(self, task):
        # 1. Plan
        plan = await self.agents['planner'].process(task)
        self.history.append(('plan', plan))

        # 2. Execute
        results = []
        for step in plan['steps']:
            agent_name = step['assigned_to']
            result = await self.agents[agent_name].process(step)
            results.append(result)
            self.history.append(('execute', result))

        # 3. Verify
        verification = await self.agents['verifier'].process(results)
        return verification
```

### Pipeline Handoff (shared state)
```python
def pipeline(state):
    # Stage 1: Researcher
    state = run_agent("researcher", state)
    if not state["research_data"]:
        raise Error("No data found")
        
    # Stage 2: Writer
    state = run_agent("writer", state)
    
    # Stage 3: Reviewer
    state = run_agent("reviewer", state)
    
    return state
```

### Peer-to-Peer (Event Bus)
```python
# Event-driven pattern
async def on_message(message):
    if message.intent == "code_review_requested":
        # Reviewer agent picks this up
        review = await generate_review(message.content)
        await bus.publish({
            "to": message.from,
            "intent": "review_completed",
            "content": review
        })
```

## Scenarios

### Incident Response Swarm
1. **Detection Agent**: Posts "Severity: High" alert to bus.
2. **Triage Agent**: Subscribes to alerts, creates Ticket #123.
3. **Mitigation Agent**: Sees Ticket #123, runs "restart_service" runbook.
4. **Comms Agent**: Sees mitigation start, posts update to Slack status channel.
