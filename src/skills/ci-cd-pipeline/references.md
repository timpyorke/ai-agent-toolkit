# Reference Material

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

- **Canary**: small traffic portion, auto-increase on health
- **Blue/Green**: switch traffic after verification
- **Feature Flags**: hide incomplete features safely

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
