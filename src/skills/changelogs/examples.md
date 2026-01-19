# Examples

## Keep a Changelog Format

### Standard Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature in development

### Changed

- Modified behavior

## [1.2.0] - 2024-03-15

### Added

- User profile customization (#234)
- Export data to CSV feature (#245)

### Changed

- Updated authentication flow for better security (#250)

### Deprecated

- `/api/v1/users` endpoint (use `/api/v2/users` instead)

### Removed

- Legacy admin panel (replaced by new dashboard)

### Fixed

- Memory leak in background sync process (#256)
- Race condition in payment processing (#259)

### Security

- Patched XSS vulnerability in search (#261)
```

### Change Categories

```markdown
## Standard Categories

### Added
- New features
- New functionality
- New APIs

### Changed
- Changes in existing functionality
- Behavior modifications
- Performance improvements

### Deprecated
- Features being phased out
- Soon-to-be removed functionality
- Deprecation warnings

### Removed
- Deleted features
- Removed APIs
- Eliminated functionality

### Fixed
- Bug fixes
- Error corrections
- Issue resolutions

### Security
- Security patches
- Vulnerability fixes
- Security improvements
```

## Conventional Commits

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, missing semicolons, etc.
refactor: Code change that neither fixes a bug nor adds a feature
perf:     Performance improvement
test:     Adding missing tests
build:    Changes to build system or dependencies
ci:       CI configuration changes
chore:    Other changes that don't modify src or test files
revert:   Revert a previous commit
```

**Examples**:

```bash
# Feature
feat(auth): add OAuth2 login support

Implements GitHub and Google OAuth2 providers.
Users can now login using their social accounts.

Closes #123

# Bug fix
fix(api): prevent race condition in payment processing

Added mutex lock around payment transaction to prevent
duplicate charges when user clicks submit multiple times.

Fixes #456

# Breaking change
feat(api)!: change authentication to require API keys

BREAKING CHANGE: All API requests now require an API key
in the Authorization header. See migration guide at
docs/migration-v2.md
```

### Conventional Commits to Changelog

**Commits**:

```
feat(auth): add two-factor authentication
feat(dashboard): add user activity chart
fix(api): fix memory leak in websocket handler
fix(ui): correct button alignment on mobile
docs: update API documentation
chore: upgrade dependencies
```

**Generated Changelog**:

```markdown
## [1.3.0] - 2024-04-01

### Features

- **auth**: add two-factor authentication
- **dashboard**: add user activity chart

### Bug Fixes

- **api**: fix memory leak in websocket handler
- **ui**: correct button alignment on mobile
```

## Automation Tools

### standard-version

```bash
# Install
npm install --save-dev standard-version

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# First release
npm run release -- --first-release

# Subsequent releases
npm run release          # Auto-determine version (patch/minor/major)
npm run release -- --release-as minor
npm run release -- --release-as major
npm run release -- --release-as 1.1.0

# Dry run (see what would happen)
npm run release -- --dry-run
```

**Configuration** (`.versionrc.json`):

```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "revert", "section": "Reverts" },
    { "type": "docs", "section": "Documentation", "hidden": false },
    { "type": "style", "section": "Styles", "hidden": true },
    { "type": "chore", "section": "Miscellaneous", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring", "hidden": true },
    { "type": "test", "section": "Tests", "hidden": true },
    { "type": "build", "section": "Build System", "hidden": true },
    { "type": "ci", "section": "CI", "hidden": true }
  ],
  "commitUrlFormat": "https://github.com/myuser/myrepo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/myuser/myrepo/compare/{{previousTag}}...{{currentTag}}",
  "issueUrlFormat": "https://github.com/myuser/myrepo/issues/{{id}}",
  "skip": {
    "bump": false,
    "changelog": false,
    "commit": false,
    "tag": false
  }
}
```

### release-please (GitHub Action)

```yaml
# .github/workflows/release-please.yml
name: Release Please

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v3
        with:
          release-type: node
          package-name: my-package
          changelog-types: |
            [
              {"type":"feat","section":"Features","hidden":false},
              {"type":"fix","section":"Bug Fixes","hidden":false},
              {"type":"perf","section":"Performance","hidden":false},
              {"type":"docs","section":"Documentation","hidden":false}
            ]
```

### semantic-release

```bash
# Install
npm install --save-dev semantic-release

# .releaserc.json
{
  "branches": ["main", "next"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}

# package.json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

**GitHub Actions**:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Semantic Versioning Alignment

### Version Bump Rules

```markdown
## Patch (0.0.X) - Bug fixes

- fix: Bug fixes
- perf: Performance improvements
- Backward compatible

Example: 1.2.3 → 1.2.4

## Minor (0.X.0) - New features

- feat: New features
- Backward compatible
- No breaking changes

Example: 1.2.4 → 1.3.0

## Major (X.0.0) - Breaking changes

- feat!: Breaking features
- BREAKING CHANGE: in commit footer
- Not backward compatible

Example: 1.3.0 → 2.0.0
```

### Changelog Example with Semver

```markdown
## [2.0.0] - 2024-04-01

### ⚠ BREAKING CHANGES

- **api**: Response format changed from XML to JSON
  - Migration: Update all API clients to parse JSON
  - Old: `<response><data>...</data></response>`
  - New: `{"data": {...}}`

### Features

- **auth**: add password reset functionality

### Bug Fixes

- **api**: correct validation error messages
- **ui**: fix button styling on Safari

---

## [1.2.0] - 2024-03-15

### Features

- **dashboard**: add export to PDF

### Bug Fixes

- **api**: handle null values in query params
```
