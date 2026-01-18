---
name: changelogs
description: Document notable changes in chronological order with Keep a Changelog format and Conventional Commits automation
---

# 📋 Changelogs Skill

## Overview

This skill enables AI assistants to create and maintain comprehensive changelogs that document all notable changes to a project in chronological order. Changelogs help users and contributors understand what has changed between releases, using the Keep a Changelog format, Conventional Commits automation, and semantic versioning alignment for transparent project evolution.

## Core Principles

### 1. Curate, Don't Dump

- Write human-readable summaries, not raw git commit logs
- Group related changes logically by category (Added, Changed, Fixed, etc.)
- Filter out internal changes (refactors, chores) unless relevant to users
- Provide context and migration guidance for breaking changes

### 2. Write for Your Audience

- User-facing changelogs focus on features and fixes they'll experience
- Developer changelogs include API changes, deprecations, and technical details
- Internal changelogs track sprint progress, technical debt, and metrics
- Adjust language and detail level based on who will read it

### 3. Automate When Possible, Manual When Necessary

- Use Conventional Commits to automate changelog generation
- Leverage tools like standard-version, release-please, or semantic-release
- Manually edit generated changelogs to improve clarity and add context
- Balance automation efficiency with human communication quality

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

## [1.1.0] - 2024-02-01

### Added

- Dark mode support (#210)
- Email notifications (#215)

### Fixed

- Pagination bug on user list (#220)

## [1.0.0] - 2024-01-15

### Added

- Initial release
- User authentication
- Dashboard with analytics
- RESTful API
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

### Version Comparison Links

```markdown
# Changelog

## [Unreleased]

## [1.2.0] - 2024-03-15

## [1.1.0] - 2024-02-01

## [1.0.0] - 2024-01-15

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
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

# Multiple paragraphs
feat(dashboard): add real-time analytics

Added WebSocket connection for live data updates.
Dashboard now refreshes automatically without page reload.

Performance impact: +50KB bundle size
Related: #789, #801
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

**What it does**:

1. Analyzes commits since last release
2. Determines next version (semver)
3. Generates/updates CHANGELOG.md
4. Creates release PR
5. On merge, creates GitHub release with tag

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

### Commit to Version Mapping

```bash
# Commits since v1.2.0:
fix(api): correct validation error       # → Patch
fix(ui): fix button styling              # → Patch
feat(auth): add password reset           # → Minor
feat(api)!: change response format       # → Major

# Result: v1.2.0 → v2.0.0 (breaking change takes precedence)
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

## Audience-Specific Changelogs

### User-Facing Changelog

```markdown
# What's New

## Version 2.0 - March 2024

### ✨ New Features

- **Two-Factor Authentication**: Secure your account with 2FA
  Enable in Settings → Security
- **Dark Mode**: Easy on the eyes with our new dark theme
  Toggle in Settings → Appearance

- **Export Data**: Download your data as CSV or PDF
  Available in Dashboard → Export

### 🔧 Improvements

- Faster page load times (50% faster!)
- Better mobile experience
- Smoother animations

### 🐛 Bug Fixes

- Fixed issue where notifications weren't showing
- Resolved login problems on Safari
- Corrected timezone display issues

### ⚠️ Important Changes

Starting April 1st, all API requests require an API key.
Get your key in Settings → API Keys
```

### Developer Changelog

````markdown
# Changelog

## [2.0.0] - 2024-03-15

### BREAKING CHANGES

- **API**: All endpoints now require `X-API-Key` header
  ```diff
  - curl https://api.example.com/users
  + curl https://api.example.com/users -H "X-API-Key: YOUR_KEY"
  ```
````

Migration guide: docs/migration-v2.md

### Added

- `POST /api/v2/auth/2fa/enable` - Enable 2FA (#234)
- `GET /api/v2/export` - Export data endpoint (#245)
- New `theme` parameter in user preferences API (#250)

### Changed

- Rate limits increased to 1000 req/min (was 500) (#251)
- Response pagination format updated:
  ```diff
  - {"page": 1, "items": [...]}
  + {"pagination": {"page": 1, "perPage": 20}, "data": [...]}
  ```

### Deprecated

- `GET /api/v1/users` - Use `/api/v2/users` (v1 removed in v3.0)

### Removed

- Legacy XML response format (use JSON)

### Fixed

- Race condition in payment webhook handler (#256)
- Memory leak in WebSocket connections (#259)

### Security

- CVE-2024-1234: XSS in search (CVSS 7.5) (#261)

## Dependencies

- Upgraded Express 4.17 → 4.18
- Upgraded Postgres client 8.7 → 8.11

````

### Internal/Team Changelog

```markdown
# Internal Changelog

## Sprint 24 (2024-03-15 to 2024-03-29)

### Shipped
- ✅ Two-factor authentication (auth team)
- ✅ Dark mode (frontend team)
- ✅ Export to CSV (backend team)

### In Progress
- 🚧 Real-time notifications (backend team, 60% done)
- 🚧 Mobile app redesign (mobile team, 80% done)

### Technical Debt
- Refactored authentication module (reduced complexity by 30%)
- Upgraded database to PostgreSQL 15
- Migrated CI from Jenkins to GitHub Actions

### Metrics
- Deploy frequency: 12 deploys this sprint
- Mean time to recovery: 15 minutes
- Test coverage: 85% (+3% from last sprint)

### Incidents
- 2024-03-18: 10-minute downtime due to database failover
  - Root cause: Primary DB ran out of disk
  - Fix: Increased disk size and added monitoring
  - Postmortem: docs/postmortems/2024-03-18.md
````

## Best Practices

### Content Quality

- Write clear, descriptive entries that explain what changed and why
- Group related changes under meaningful subheadings
- Link to issues, pull requests, and documentation for full context
- Highlight breaking changes prominently with migration guidance
- Include version comparison links for easy navigation

### Organization

- Maintain chronological order with newest releases at the top
- Use consistent categorization (Added, Changed, Fixed, etc.)
- Never skip versions - document all releases for complete history
- Keep an [Unreleased] section for changes not yet released
- Tag each entry with version number and release date

### Audience Awareness

- Match language and technical depth to your audience
- User-facing changelogs focus on benefits and user experience
- Developer changelogs include API changes and technical details
- Provide different changelog views for different audiences when needed
- Include migration guides for breaking changes

## Anti-Patterns to Avoid

### Don't:

- ❌ Dump raw git commit history without curation or context
- ❌ Use vague descriptions like "various bug fixes" or "improvements"
- ❌ Skip versions or leave gaps in the release history
- ❌ Bury breaking changes in the middle of other changes
- ❌ Write overly technical jargon for user-facing changelogs
- ❌ Forget to link version numbers to git comparisons or releases
- ❌ Include every minor commit (refactors, typo fixes, WIP commits)

### Do:

- ✅ Curate and summarize changes into clear, meaningful entries
- ✅ Be specific: "Fixed race condition in payment processing (#256)"
- ✅ Document all releases chronologically for complete history
- ✅ Prominently highlight breaking changes with migration guidance
- ✅ Write for your audience: users vs developers vs internal team
- ✅ Include version comparison links: `[1.2.0]: github.com/...compare/v1.1.0...v1.2.0`
- ✅ Focus on notable changes that matter to your audience

## Handling Different Scenarios

### Scenario 1: Creating a User-Facing Changelog

1. **Focus on user impact**: Describe features and fixes in terms users understand
2. **Skip technical details**: No API endpoints, internal refactors, or dependency updates
3. **Use friendly language**: "You can now export your data" vs "Implemented export endpoint"
4. **Highlight benefits**: Explain why the change matters to users

```markdown
# What's New in Version 2.0

## ✨ New Features

- **Two-Factor Authentication**: Secure your account with 2FA (enable in Settings → Security)
- **Dark Mode**: Easy on the eyes with our new dark theme
- **Export Data**: Download your data as CSV or PDF

## 🔧 Improvements

- Faster page load times (50% improvement!)
- Better mobile experience
- Smoother animations

## 🐛 Bug Fixes

- Fixed issue where notifications weren't showing
- Resolved login problems on Safari
```

### Scenario 2: Creating a Developer Changelog

1. **Include technical details**: API changes, new endpoints, deprecated features
2. **Document breaking changes**: With code examples and migration guides
3. **Link to documentation**: Issues, PRs, migration guides, and API docs
4. **Show before/after**: Use code diffs for API changes

````markdown
## [2.0.0] - 2024-03-15

### BREAKING CHANGES

- **API**: All endpoints now require `X-API-Key` header
  ```diff
  - curl https://api.example.com/users
  + curl https://api.example.com/users -H "X-API-Key: YOUR_KEY"
  ```
````

Migration guide: docs/migration-v2.md

### Added

- `POST /api/v2/auth/2fa/enable` - Enable 2FA (#234)
- `GET /api/v2/export` - Export data endpoint (#245)

### Deprecated

- `GET /api/v1/users` - Use `/api/v2/users` (v1 removed in v3.0)

### Fixed

- Race condition in payment webhook handler (#256)

````

### Scenario 3: Automating Changelog Generation

1. **Use Conventional Commits**: Structure commit messages for automation
2. **Configure changelog tool**: standard-version, release-please, or semantic-release
3. **Review generated output**: Edit for clarity and add context
4. **Automate in CI/CD**: Generate changelog on release

```bash
# Install standard-version
npm install --save-dev standard-version

# Configure package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Run release (auto-determines version from commits)
npm run release

# Result: Updates CHANGELOG.md, bumps version, creates git tag
````

### Scenario 4: Handling Breaking Changes

1. **Make it prominent**: Use ⚠️ emoji and BREAKING CHANGES heading
2. **Explain the change**: What broke and why it was necessary
3. **Provide migration path**: Step-by-step guide to upgrade
4. **Link to documentation**: Detailed migration guide in docs

```markdown
## [2.0.0] - 2024-03-15

### ⚠️ BREAKING CHANGES

- **Authentication**: API now requires authentication tokens in all requests

  **Why**: Improved security and rate limiting

  **Migration**:
  1. Generate API key in Settings → API Keys
  2. Add `Authorization: Bearer YOUR_KEY` header to all requests
  3. Update client libraries to version 2.x

  See full guide: docs/migration-v2.md
```

## Tools & Techniques

### Automation Tools

**standard-version** - Automated changelog and version management

```bash
npm install --save-dev standard-version
npm run release                    # Auto-determine version
npm run release -- --release-as minor
npm run release -- --dry-run       # Preview changes
```

**release-please** - GitHub Action for release automation

- Analyzes commits since last release
- Creates release PR with updated CHANGELOG.md
- On merge, creates GitHub release with tag

**semantic-release** - Fully automated release workflow

- Determines version from commits
- Generates changelog
- Publishes to npm and GitHub

### GitHub Actions Integration

```yaml
# .github/workflows/changelog.yml
name: Update Changelog

on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for changelog

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Generate changelog
        run: |
          npm install -g conventional-changelog-cli
          conventional-changelog -p angular -i CHANGELOG.md -s

      - name: Commit changelog
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog [skip ci]" || echo "No changes"
          git push
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/commit-msg

# Validate commit message format
commit_msg=$(cat "$1")

# Conventional Commits pattern
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}'

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format"
  echo ""
  echo "Format: <type>[optional scope]: <description>"
  echo ""
  echo "Examples:"
  echo "  feat(auth): add OAuth2 support"
  echo "  fix(api): correct validation error"
  echo ""
  exit 1
fi

echo "✅ Commit message format valid"
```

## Quick Reference

### Changelog Categories

```markdown
### Added - New features

### Changed - Changes to existing functionality

### Deprecated - Soon-to-be removed features

### Removed - Deleted features

### Fixed - Bug fixes

### Security - Security patches
```

### Conventional Commit Types

```bash
feat:     New feature          → Minor version bump
fix:      Bug fix              → Patch version bump
feat!:    Breaking feature     → Major version bump
docs:     Documentation only   → No version bump
chore:    Internal changes     → No version bump
```

### Quick Commands

```bash
# Manual entry template
## [1.2.0] - 2024-03-15
### Added
- Feature description (#123)
### Fixed
- Bug fix (#456)

# Conventional commits
git commit -m "feat(scope): add user export"
git commit -m "fix: correct validation error"
git commit -m "feat!: change API response format"

# Automated release
npm run release                    # standard-version
npm run release -- --release-as minor
npm run release -- --dry-run

# Version links
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

### Version Bump Rules

| Commit Type | Version Change | Example       |
| ----------- | -------------- | ------------- |
| fix:        | Patch (0.0.X)  | 1.2.3 → 1.2.4 |
| feat:       | Minor (0.X.0)  | 1.2.4 → 1.3.0 |
| feat!:      | Major (X.0.0)  | 1.3.0 → 2.0.0 |

## Conclusion

Changelogs are essential for communicating project evolution to users, developers, and team members. By following the Keep a Changelog format, leveraging Conventional Commits for automation, and writing for your specific audience, you create clear, maintainable release documentation that helps everyone understand what changed and why. Whether manually curated or automatically generated, a good changelog balances automation efficiency with human communication quality, providing context, migration paths, and clear organization that makes releases transparent and user-friendly.

**Remember**: A changelog is not a git log dump - it's a curated story of your project's evolution for humans to understand.

---

**Related Skills**: [commit-message](../commit-message/SKILL.md) | [release-notes](../release-notes/SKILL.md) | [git-workflow](../git-workflow/SKILL.md) | [ci-cd-pipeline](../ci-cd-pipeline/SKILL.md)
