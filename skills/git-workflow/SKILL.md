# 🌿 Git Workflow Skill

---

name: git-workflow
description: Manage version control effectively with clear branching, rebasing, and pull request practices

---

## Overview

This skill enables AI assistants to guide teams through robust Git workflows. Focuses on simple, reliable practices that support collaboration, traceability, and clean history.

## Core Principles

### 1. Small, Atomic Changes

- Keep commits focused on one logical change
- Write clear commit messages (see commit-message skill)
- Push frequently; avoid giant PRs
- Prefer incremental PRs over long-lived branches

### 2. Clean History

- Rebase feature branches to keep linear history
- Squash commits when appropriate in PR merge
- Avoid merge commits on small PRs (team-dependent)
- Tag releases and use semantic versioning

### 3. Collaborative Reviews

- Open PRs early (draft) to get feedback
- Keep PR descriptions clear with context and screenshots
- Request reviewers with relevant domain expertise
- Link issues and reference tickets

## Branching Strategies

### GitHub Flow (Recommended for most teams)

- `main` is always deployable
- Create feature branch: `feature/xyz`
- Open PR into `main`; review + CI must pass
- Merge via squash; deploy

### Git Flow (For complex release cycles)

- Long-lived `develop` and `release/*` branches
- Feature branches merge to `develop`
- `release/*` branches stabilize for production
- Hotfixes from `main` back to `develop`

### Trunk-Based (Fast-moving teams)

- Short-lived branches; frequent small merges to `main`
- Feature flags to hide incomplete work
- Strict CI and quick reviews

## Pull Request Process

1. Sync and branch from latest `main`
2. Implement changes with small commits
3. Update docs/tests as needed
4. Run CI locally if available
5. Open PR with clear description:
   - What changed and why
   - Screenshots or logs if UI/behavior
   - Breaking changes highlighted
6. Address review comments quickly
7. Rebase on `main` before merge

## Rebase vs Merge

- Rebase keeps linear history (use on private branches)
- Merge preserves the exact history of development
- Never rebase public shared branches
- Resolve conflicts locally and test

## Release Management

- Tag releases: `v1.2.3` per SemVer
- Changelog with notable changes
- Use release branches if needed
- Hotfix patches with `fix/*` branches

## Common Commands

```bash
# Start a feature
git checkout -b feature/auth-jwt

# Keep up to date
git fetch origin
git rebase origin/main

# Resolve conflicts then continue
git add .
git rebase --continue

# Push branch
git push -u origin feature/auth-jwt

# After PR approval (squash merge in GitHub UI recommended)

# Tag a release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# Cherry-pick a fix
git checkout -b hotfix/null-check origin/main
git cherry-pick <commit-sha>
```

## Best Practices

### Do:

- ✅ Name branches clearly: `feature/`, `fix/`, `chore/`, `release/`
- ✅ Keep PRs under ~300 lines of diff when possible
- ✅ Ensure CI passes before requesting review
- ✅ Link issues in PR body (Fixes/Closes #123)
- ✅ Use code owners for auto-review routing

### Don't:

- ❌ Commit generated artifacts (unless required)
- ❌ Force-push shared branches
- ❌ Mix unrelated changes in one PR
- ❌ Skip tests and docs updates
- ❌ Merge with failing CI

## Templates

### PR Description

```
Title: feat(auth): add JWT-based authentication

Summary:
Implements token-based auth for API clients.

Changes:
- Add JwtService for token creation/validation
- Secure `/api/*` routes with middleware
- Update docs and examples

Testing:
- Unit tests for JwtService
- Integration tests for protected endpoints

References:
- Closes #456
- RFC 7519 (JWT)
```

### Branch Naming

- `feature/user-onboarding`
- `fix/payment-race-condition`
- `chore/deps-update-2026-01-17`
- `release/1.4.0`

## Quick Reference

- Use rebase for private branches; merge or squash on PR
- Keep `main` green; protect with required checks
- Automate lint/test on push and PR
- Prefer squash merges for tidy history

## Conclusion

A well-defined Git workflow reduces friction and improves traceability. Keep changes small, history clean, and reviews collaborative. Adapt the strategy to your team's release cadence and risk tolerance.