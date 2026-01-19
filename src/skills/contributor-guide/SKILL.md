---
name: contributor-guide
description: Clear, welcoming contributor workflow with conventions, PR process, and onboarding.
---

# 🎯 Contributor Guide

## Overview

This skill provides a clear, friendly path for contributors: environment setup, workflow conventions, commit and PR standards, issue triage, community norms, and onboarding checklists. Apply progressive disclosure (quick start → deeper docs) to keep things simple while enabling high-quality contributions.

## Core Principles

See [Reference Material](references.md#core-principles).

## Development Workflow

### Branch Naming & Commits

See [Reference Material](references.md#development-workflow) and [Examples](examples.md#git-workflow).

### Git Workflow

See [Examples](examples.md#git-workflow).

## Coding Standards

### Code Style & Testing

See [Examples](examples.md#coding-standards-examples) and [Reference Material](references.md#coding-standards).

## Submitting Changes

### Checklists & Templates

See [Examples](examples.md#templates) and [Reference Material](references.md#submitting-changes-process).

## Issue Guidelines

See [Reference Material](references.md#issue-guidelines) and [Examples](examples.md#templates).

## Community & Support

See [Reference Material](references.md#community).

## Onboarding Checklists

See [Examples](examples.md#onboarding-checklists).

## Best Practices & Anti-Patterns

See [Reference Material](references.md#best-practices).

## Scenarios

See [Reference Material](references.md#scenarios).

## Command Reference

See [Examples](examples.md#development-cli-commands).

---

Related Skills: [code-review](../code-review/SKILL.md) | [git-workflow](../git-workflow/SKILL.md) | [changelogs](../changelogs/SKILL.md) | [adrs](../adrs/SKILL.md)
- [ ] Read architecture documentation
- [ ] Explore codebase (start with src/README.md)
- [ ] Attend community meeting (monthly)
- [ ] Help review other PRs
- [ ] Answer questions in Discussions
````

### New Maintainer Onboarding

```markdown
# Maintainer Onboarding

## Access & Permissions

- [ ] GitHub write access granted
- [ ] npm publish access granted
- [ ] Deploy access granted (staging/production)
- [ ] Monitoring access (Sentry, DataDog)
- [ ] Added to maintainers@project.com email
- [ ] Added to private maintainer Discord channel

## Required Reading

- [ ] [GOVERNANCE.md](GOVERNANCE.md) - Decision-making process
- [ ] [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [ ] [RELEASING.md](RELEASING.md) - Release process
- [ ] Recent ADRs (Architecture Decision Records)

## Responsibilities

- [ ] Review PRs within 48 hours
- [ ] Triage new issues weekly
- [ ] Participate in maintainer meetings
- [ ] Rotate on-call duty (monthly)
- [ ] Help with releases (quarterly)
- [ ] Mentor new contributors

## Tools & Processes

- [ ] Set up PR review notifications
- [ ] Install GitHub CLI: `gh`
- [ ] Configure GPG commit signing
- [ ] Set up automated changelog tools
- [ ] Learn release process
- [ ] Practice rollback procedure
```

## Issue Triaging Process

### Triage Labels Workflow

```markdown
## Incoming Issue Triage

### 1. Initial Triage (Within 24 hours)

- **Check if valid**
  - Duplicate? Close and link to original
  - Spam? Delete
  - Incomplete? Ask for more info with `needs-info` label

- **Categorize**
  - `bug`: Something is broken
  - `enhancement`: Feature request
  - `documentation`: Docs improvement
  - `question`: Needs clarification

- **Assess priority**
  - `priority: critical`: Security, data loss, complete breakage
  - `priority: high`: Significant impact, many users affected
  - `priority: medium`: Moderate impact
  - `priority: low`: Nice to have, minor issue

### 2. Technical Assessment

- **Reproducible?**
  - Add `confirmed` if reproduced
  - Add `cannot-reproduce` if not

- **Scope**
  - `scope: frontend`
  - `scope: backend`
  - `scope: infrastructure`
  - `scope: api`

- **Effort Estimate**
  - `effort: small` (< 4 hours)
  - `effort: medium` (1-3 days)
  - `effort: large` (> 3 days)

### 3. Assignment

- **Good for newcomers?**
  - Add `good first issue`
  - Add `help wanted`
  - Provide mentoring note

- **Needs expertise?**
  - Add `needs: security-review`
  - Add `needs: architecture-decision`
  - Tag relevant team

### 4. Tracking

- Add to project board
- Link to milestone
- Update roadmap if needed
```

## Code of Conduct (Example)

```markdown
# Code of Conduct

## Our Pledge

We pledge to make participation in our community a harassment-free experience for
everyone, regardless of age, body size, disability, ethnicity, gender identity and
expression, level of experience, education, socio-economic status, nationality,
personal appearance, race, religion, or sexual identity and orientation.

## Our Standards

### Positive Behavior

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported
to the project team at [conduct@project.com]. All complaints will be reviewed and
investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct.html).
```

## Best Practices

### ✅ DO

1. **Make setup easy**

```bash
# ✅ One command to start
npm run setup

# Script automates:
# - Dependency installation
# - Environment configuration
# - Database setup
# - Initial seed data
```

2. **Provide examples**

```markdown
# ✅ Show, don't just tell

## Adding a new API endpoint

1. Create handler in `src/api/handlers/`
2. Add route in `src/api/routes.ts`
3. Write tests in `src/api/__tests__/`

Example:
\`\`\`typescript
// src/api/handlers/getUser.ts
export async function getUser(req: Request): Promise<Response> {
const { id } = req.params;
const user = await db.users.findById(id);
return { status: 200, data: user };
}
\`\`\`
```

3. **Keep it current**

```markdown
# ✅ Update guide when process changes

# Add to PR template:

- [ ] Updated CONTRIBUTING.md if workflow changed
```

4. **Welcome newcomers**

```markdown
# ✅ Friendly tone

"Welcome! We're excited to have you contribute."

# ❌ Intimidating

"Read all documentation before submitting anything or your PR will be rejected."
```

### ❌ DON'T

1. **Don't assume knowledge**

```markdown
# ❌ Assumes familiarity

"Just use the standard workflow"

# ✅ Explicit

"Follow these steps: 1. Fork repo, 2. Create branch, 3. Make changes..."
```

2. **Don't hide information**

```markdown
# ❌ Vague

"Contact maintainers"

# ✅ Specific

"Contact maintainers at maintainers@project.com or in #help Discord channel"
```

3. **Don't overload**

```markdown
# ❌ 50-page guide

[Everything about everything]

# ✅ Progressive disclosure

CONTRIBUTING.md (quick start) → DEVELOPING.md (deep dive) → ARCHITECTURE.md (design)
```

## Quick Reference

```bash
# Fork and clone
gh repo fork owner/repo --clone

# Setup
npm install
cp .env.example .env
npm run dev

# Create branch
git checkout -b feature/my-feature

# Commit
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
gh pr create --fill

# Sync fork
git fetch upstream
git rebase upstream/main
```

## Additional Resources

- [GitHub's Open Source Guide](https://opensource.guide/)
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [First Timers Only](https://www.firsttimersonly.com/)
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)

---

**Related Skills**: [code-review](../code-review/SKILL.md) | [git-workflow](../git-workflow/SKILL.md) | [changelogs](../changelogs/SKILL.md) | [adrs](../adrs/SKILL.md)
