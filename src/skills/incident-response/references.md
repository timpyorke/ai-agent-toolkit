# Reference Material

## Core Principles

### 1. Stay Calm
- Panic leads to mistakes.
- Follow the process (Runbooks).
- Rely on your team.

### 2. Communicate Clearly
- Over-communicate status, not speculation.
- Keep stakeholders informed.
- Use a dedicated channel.

### 3. Focus on Mitigation
- Default to fixing the symptom (restore service) before finding the root cause.
- Rollback first, debug later.

### 4. Blameless Culture
- Post-mortems are for learning, not punishment.
- Focus on process failure, not human error.

## Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **SEV-1** | Critical Service Down. Data Loss. | Immediate (24/7) | Main DB down, Security breach |
| **SEV-2** | Major Feature Broken. High Latency. | < 15 mins (24/7) | Checkout broken, API slow |
| **SEV-3** | Minor Issue. Workaround exists. | Business Hours | CSS glitch, Report export slow |
| **SEV-4** | Cosmetic / Low Priority | Next Sprint | Typo, deprecated warning |

## Roles & Responsibilities

### Incident Commander (IC)
- **Primary Goal**: Coordinate the response.
- **Tasks**: Assign roles, manage communication, make high-level decisions.
- **Does NOT**: Debug code (usually).

### Tech Lead / Operations
- **Primary Goal**: Fix the issue.
- **Tasks**: Investigate, deploy fixes, rollback.

### Communications Lead
- **Primary Goal**: Inform stakeholders.
- **Tasks**: Update status page, update support team, write internal updates.

## Incident Lifecycle

1. **Detection**: Monitoring alerts, user reports.
2. **Triage**: Determine severity, paging the right people.
3. **Investigation**: Identify the cause (logs, metrics).
4. **Mitigation**: Restore service (rollback, scale, toggle).
5. **Resolution**: Root cause fixed permanently.
6. **Post-Mortem**: Analysis and preventative tasks.

## Best Practices
- **Runbooks**: Documentation for known issues.
- **War Room**: Dedicated Zoom/Slack channel.
- **Handover**: Clean handoff if incident spans shifts.
- **Practice**: Run "Game Days" (Chaos Engineering) to practice response.
