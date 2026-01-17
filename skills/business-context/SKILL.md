# 🧭 Business Context Skill

---

name: business-context
description: Incorporate business goals, constraints, and stakeholder needs to guide technical decisions effectively

---

## Overview

This skill enables AI assistants to understand and integrate business context—goals, constraints, users, metrics—into technical recommendations, ensuring solutions solve the right problem with acceptable trade-offs.

## Core Principles

### 1. Outcomes over Outputs

- Optimize for business impact, not lines of code
- Define success metrics (leading and lagging)
- Tie features to measurable goals

### 2. Constraints & Trade-offs

- Identify time, budget, compliance, and risk boundaries
- Make trade-offs explicit (speed vs quality, scope vs timeline)
- Document decisions and rationale (ADR)

### 3. Stakeholder Alignment

- Map stakeholders and their success criteria
- Surface assumptions and clarify requirements early
- Communicate progress in business terms

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

### Stakeholder Map

- Primary users: [roles]
- Business owners: [roles]
- Supporting teams: [ops, security, legal]
- External: [vendors, regulators]

### Requirements

- Functional: capabilities, workflows, edge cases
- Non-functional: performance, reliability, security, usability
- Compliance: GDPR, HIPAA, PCI-DSS, SOC2

## Decision Records (ADR)

```
Title: Choose authentication method (OIDC vs custom)
Status: Accepted
Context: Need SSO for enterprise clients
Decision: Use OIDC with provider X
Consequences: Faster integration, dependency on provider uptime
Alternatives: Custom JWT, SAML
```

## Prioritization & Roadmapping

- Use RICE (Reach, Impact, Confidence, Effort)
- Define MVP → v1.1 → v1.2 increments
- Maintain a backlog of risks and follow-ups

## Metrics & KPIs

- Activation: signup completion, onboarding time
- Engagement: DAU/MAU, feature usage
- Performance: latency, error rate, uptime
- Financial: conversion rate, cost per acquisition

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

Goal: Reduce checkout abandonment by 15% in Q1

Tech Plan:

- Implement Apple Pay/Google Pay (Reach + Impact)
- Add retry on payment failures (Resilience)
- Optimize load time on checkout page (<1.5s)
- A/B test new checkout flow; measure conversion

## Best Practices

### Do:

- ✅ Write a one-page context brief per project
- ✅ Maintain ADRs for significant decisions
- ✅ Define measurable success metrics upfront
- ✅ Engage stakeholders regularly with demos
- ✅ Explicitly state assumptions and constraints

### Don't:

- ❌ Assume the problem without user evidence
- ❌ Commit to timelines without risk assessment
- ❌ Ignore non-functional requirements
- ❌ Let scope creep without prioritization

## Quick Reference

- Context Brief → Stakeholder Map → Requirements → ADRs → Roadmap
- Metrics connect features to business outcomes
- Communicate trade-offs transparently and early
