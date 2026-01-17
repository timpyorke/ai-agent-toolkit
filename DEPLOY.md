# Release & Publish Guide

Publish the Node.js CLI to npm and attach the tarball to a GitHub Release using Actions.

## Prerequisites

- npm auth: Create an npm access token with publish permissions and add it as a GitHub repository secret named `NPM_TOKEN`.
- Versioning: Use semantic versioning for releases (`patch`, `minor`, `major`).
- Workflow: Ensure the publish workflow exists in [.github/workflows/publish.yml](.github/workflows/publish.yml).

## Local Dry Run

```bash
# Install clean dependencies
npm ci

# Pack npm tarball and inspect contents
PKG=$(npm pack)

echo "Tarball: $PKG"
# List files inside the tarball
tar -tzf "$PKG"
```

## Publish via GitHub Actions

```bash
# Bump version and create tag (choose one: patch|minor|major)
npm version patch

# Push tag to trigger the workflow
git push origin main --tags
```

The workflow will:

- Build and pack the npm tarball
- Publish to npm using `NPM_TOKEN`
- Create a GitHub Release and attach the tarball artifact

## Manual Publish (optional)

```bash
# Requires npm login locally
npm publish
```

## Install from npm (after publish)

```bash
# Install the published package
npm install -g ai-agent-toolkit

# Verify the CLI works
aat list
aat info react
aat copy
```

## Troubleshooting

- "Authentication failed" during publish:
  - Ensure `NPM_TOKEN` is set in GitHub repository secrets
  - Token must have `publish` permission for the package scope
- Tarball missing files:
  - Check `files` field in [package.json](package.json)
  - Run `npm pack` locally and inspect contents
- Workflow not triggered:
  - Tag must match `v*.*.*` pattern (e.g., `v0.1.1`)
  - Ensure tags are pushed (`git push --tags`)
