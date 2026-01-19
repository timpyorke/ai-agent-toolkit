# Examples and Templates

## Discovery Framework

### Context Brief (One-Pager)

```
Problem: [What pain are we solving]
Users: [Who is affected]
Goal: [Business objective]
Scope: [In/Out]
Constraints: [Time, budget, compliance]
Risks: [Top uncertainties]
Metrics: [How success is measured]
Timeline: [Key milestones]
```

## Decision Records (ADR)

```
Title: Choose authentication method (OIDC vs custom)
Status: Accepted
Context: Need SSO for enterprise clients
Decision: Use OIDC with provider X
Consequences: Faster integration, dependency on provider uptime
Alternatives: Custom JWT, SAML
```

## Communication Artifacts

### Executive Summary

- Problem, solution, impact, timeline
- Key risks and mitigation
- Budget and resource needs

### Release Notes

- Feature summary in user language
- Expected changes to workflows
- Support and documentation links

## Example: Translating Business Goal to Tech Plan

**Goal:** Reduce checkout abandonment by 15% in Q1

**Tech Plan:**

- Implement Apple Pay/Google Pay (Reach + Impact)
- Add retry on payment failures (Resilience)
- Optimize load time on checkout page (<1.5s)
- A/B test new checkout flow; measure conversion
