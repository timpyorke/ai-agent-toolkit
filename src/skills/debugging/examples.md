# Examples

## Bug Report Template

```markdown
Title: [Concise summary]

Environment:
- OS: [version]
- App version: [version]
- Dependencies: [key versions]

Steps to Reproduce:
1. [...]
2. [...]

Expected:
[Describe expected behavior]

Actual:
[Describe observed behavior]

Artifacts:
- Logs: [...]
- Screenshot: [...]
- Trace ID: [...]
```

## Investigation Plan Template

```markdown
Hypothesis: [What you think is wrong]

Plan:
- Add logs at [locations]
- Write a failing test for [case]
- Use debugger to inspect [variables]
- Compare behavior in [envs]

Success Criteria:
- [Measurable outcome proving/ disproving]
```

## Debugging Commands (CLI)

### Git Bisect
```bash
# Start bisect
git bisect start

# Mark current HEAD as bad
git bisect bad HEAD

# Mark known good commit
git bisect good <commit-hash>
```

### Pytest
```bash
# Run tests repeatedly to catch flakiness
pytest -k failing_test -q --maxfail=1 -x
```

### Log Analysis
```bash
# Tail logs and filter with jq (JSON logs)
tail -f logs/app.log | jq '. | {level, msg, userId, requestId}'
```

### Node.js Debugging
```bash
# Inspect with Chrome DevTools
node --inspect app.js
```

### Curl (API Debugging)
```bash
# Verbose output to see headers
curl -v https://api.example.com/endpoint
```
