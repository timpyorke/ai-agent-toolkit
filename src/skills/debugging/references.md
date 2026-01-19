# Reference Material

## Core Principles

### 1. Reproducibility First
- Reproduce reliably before changing code
- Document environment, inputs, and steps
- Capture logs, stack traces, and screenshots
- Build minimal repro cases when possible

### 2. Root Cause, Not Symptoms
- Identify the underlying invariant violation
- Trace data and control flows
- Use instrumentation and assertions
- Avoid band-aid fixes that mask problems

### 3. Scientific Method
- Form hypotheses based on evidence
- Design small, controlled experiments
- Measure outcomes; confirm or refute
- Iterate until root cause is proven

## Debugging Workflow

### 1. Collect Context
- Error messages and stack traces
- Logs with timestamps and correlation IDs
- Recent changes: commits, deployments, config
- Environment: OS, versions, dependencies

### 2. Reproduce
- Exact steps or API inputs
- Use fixtures/sample data
- Disable external variability (cache, network)
- Create a minimal failing test if possible

### 3. Isolate
- Narrow scope: component, module, function
- Bisect changes (git bisect) to find offending commit
- Toggle feature flags/config to pinpoint behavior
- Replace dependencies with mocks/stubs

### 4. Inspect
- Add logging with structured context
- Use debugger breakpoints and watches
- Dump variables and state snapshots
- Profile performance hotspots if relevant

### 5. Fix & Verify
- Implement the minimal correct fix
- Add tests to prevent regression
- Verify across environments and edge cases
- Clean up instrumentation/logging added

## Tools & Techniques

### Logging
- Use structured logs (JSON) with levels (debug/info/warn/error)
- Include request IDs, user IDs, and key parameters
- Log at boundaries: input, transform, output

### Debuggers
- IDE debuggers (VS Code, IntelliJ, PyCharm)
- Remote debugging for services
- Inspect threads, call stacks, and variables

### Observability
- Metrics: latency, error rate, saturation
- Tracing: distributed traces across services
- Alerts: configure thresholds and alerts

### Version Control
- `git bisect` to locate breaking change
- `git revert` to unblock production
- Annotate commits with context in PRs

## Common Issues and Strategies

### Null/Undefined Errors
- Add guards and defaults
- Validate API responses and inputs
- Use non-nullable types where possible

### Race Conditions
- Review async flows and shared state
- Add locking or atomic operations
- Use idempotency for retries

### Performance Problems
- Profile before optimizing
- Cache expensive computations
- Batch operations; avoid N+1 queries

### State Management Bugs
- Centralize state updates
- Avoid mutating shared state across threads
- Use immutable data structures where feasible

## Anti-Patterns (Avoid)

- ❌ Changing code before reproducing
- ❌ Over-reliance on print debugging without structure
- ❌ Guessing fixes without evidence
- ❌ Ignoring tests and regression prevention
- ❌ Blaming external systems prematurely

## Best Practices

### Do
- ✅ Keep a log of attempts and findings
- ✅ Share repro steps with the team
- ✅ Write tests for found bugs
- ✅ Use feature flags to mitigate safely
- ✅ Document root cause and fix in PR

### Don't
- ❌ Ship speculative fixes
- ❌ Disable monitoring/alerts during incidents
- ❌ Hide noisy logs instead of structuring them
- ❌ Let one-off scripts become untested production code
