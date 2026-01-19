# Examples

## GitHub Actions (Node/TS + Docker)

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

## Deploy Job (Canary)

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
