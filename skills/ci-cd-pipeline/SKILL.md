---
name: ci-cd-pipeline
description: Design and operate fast, reliable CI/CD pipelines with quality gates, secure secrets, and safe deployments
---

# 🚀 CI/CD Pipeline Skill

## Overview

This skill enables AI assistants to implement robust CI/CD pipelines that balance speed and safety. It covers build/test automation, caching, artifacts, environments, secrets, deployment strategies, and rollback.

## Core Principles

### 1. Fast Feedback

- Run unit tests, lints, and type checks on every PR
- Cache dependencies and build outputs
- Fail fast on quality gates; keep pipelines under ~10 minutes

### 2. Repeatable & Isolated

- Use pinned tool versions and reproducible environments
- Build artifacts once; promote the same artifact across stages
- Avoid environment-specific builds

### 3. Security by Default

- Store secrets in a secure vault (no plaintext in repo)
- Use OIDC/GitHub Actions Workload Identity over long-lived keys
- Least-privilege for deploy credentials

### 4. Safe Deployments

- Progressive rollout (canary/blue-green)
- Health checks and automatic rollback
- Feature flags for risk mitigation

## Pipeline Stages

1. Checkout & Setup
2. Build & Lint
3. Unit & Integration Tests
4. Package & Publish Artifacts
5. Security Scans (SAST/Dependency)
6. Deploy (staging → production)
7. Post-deploy verification

## Example: GitHub Actions (Node/TS + Docker)

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --ci

  docker-image:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
          cache-from: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache
          cache-to: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache,mode=max
```

### Deploy Job (Canary)

```yaml
name: Deploy
on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy canary (10%)
        run: |
          ./scripts/deploy.sh \
            --image ghcr.io/$REPO:sha-$SHA \
            --env staging \
            --traffic 10
      - name: Health check
        run: ./scripts/health_check.sh --env staging

  promote-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: success()
    steps:
      - name: Gradually shift traffic
        run: ./scripts/shift_traffic.sh --env prod --from 10 --to 100 --step 10
      - name: Post-deploy checks
        run: ./scripts/verify.sh --env prod
      - name: Rollback on failure
        if: failure()
        run: ./scripts/rollback.sh --env prod
```

## Caching & Artifacts

- Node: `actions/setup-node@v4` cache for npm
- Python: `actions/setup-python@v5` + pip cache
- Share build outputs between jobs via `actions/upload-artifact`
- Promote the same artifact across environments

## Secrets Management

- Use platform secrets (GitHub, GitLab, Azure)
- Prefer short-lived tokens via OIDC
- Rotate credentials; audit access

## Quality Gates

- Lint + typecheck must pass
- Test coverage threshold enforced
- Security scan (Snyk/Trivy/Bandit) gated
- License compliance checks for dependencies

## Multi-Env Strategy

- Environments: dev → staging → prod
- Use environment-protected branches and approvals
- Config via environment variables/parameters; no code changes

## Rollout Strategies

- Canary: small traffic portion, auto-increase on health
- Blue/Green: switch traffic after verification
- Feature Flags: hide incomplete features safely

## Observability & Rollback

- Health endpoints and synthetic checks
- Error rate/latency alerts (SLOs)
- Automatic rollback on SLA breach

## Monorepo Considerations

- Detect changed packages and run targeted pipelines
- Use matrix builds for platforms/languages
- Cache per-package dependencies

## Best Practices

### Do:

- ✅ Keep pipelines fast and deterministic
- ✅ Promote artifacts; avoid environment-specific builds
- ✅ Gate on tests, security, and coverage
- ✅ Use OIDC and least-privilege credentials
- ✅ Implement progressive rollouts and rollback

### Don't:

- ❌ Commit secrets to repo
- ❌ Build separately for each environment
- ❌ Skip health checks and post-deploy verification
- ❌ Use long-lived admin tokens for CI

## Quick Reference

- Actions: build → test → package → scan → deploy
- Cache: dependencies + build outputs
- Secrets: platform-managed + OIDC
- Rollout: canary/blue-green + feature flags
