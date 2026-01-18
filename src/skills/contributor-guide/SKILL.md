---
name: contributor-guide
description: Clear, welcoming contributor workflow with conventions, PR process, and onboarding.
---

# 🎯 Contributor Guide

## Overview

This skill provides a clear, friendly path for contributors: environment setup, workflow conventions, commit and PR standards, issue triage, community norms, and onboarding checklists. Apply progressive disclosure (quick start → deeper docs) to keep things simple while enabling high-quality contributions.

## Core Principles

1. Clarity first: favor concise, actionable steps over exhaustive prose.
2. Fast onboarding: one-command setup and copy-paste basics that work.
3. Consistent workflow: branches, Conventional Commits, PR templates, and CI checks.
4. Quality gates: tests, lint, and docs updates required for changes.
5. Respectful collaboration: Code of Conduct and timely, constructive reviews.

## Development Workflow

### Branch Naming

- Features: `feature/add-user-auth`
- Bug fixes: `fix/login-validation`
- Docs: `docs/update-readme`
- Refactor: `refactor/extract-user-service`

### Commit Messages (Conventional Commits)

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```bash
feat(auth): add OAuth2 Google login
fix(api): prevent duplicate user registration
docs: update API examples in README
test(auth): add tests for password reset
```

### Git Workflow

1. Keep fork synced
   ```bash
   git remote add upstream https://github.com/original/repo.git
   git fetch upstream
   git rebase upstream/main
   ```
2. Create feature branch from `main`
   ```bash
   git checkout main && git pull upstream main
   git checkout -b feature/your-feature
   ```
3. Make atomic commits explaining why.
4. Rebase before PR:
   ```bash
   git fetch upstream && git rebase upstream/main
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

## Coding Standards

### Code Style

- Use ESLint and Prettier
- Run `npm run lint` and `npm run format` before committing

### TypeScript

```typescript
// ✅ Explicit types, clear names
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// ❌ Any types, unclear names
function get(x: any): Promise<any> {
  // Implementation
}
```

### Testing

- Write tests for all new features
- Aim for 80%+ coverage
- Name tests `*.test.ts` or `*.spec.ts`

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("creates user with valid data", async () => {
      const userData = { email: "test@example.com" };
      const user = await userService.createUser(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
  });
});
```

## Submitting Changes

### Pre-PR Checklist

- [ ] Tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] New features include tests and docs
- [ ] Conventional Commits used
- [ ] Branch rebased on latest `main`

### Pull Request Template (Summary)

- Description and linked issues
- Type of change
- Testing performed and reproduction steps
- Self-review and docs updates checklist

### Review & Merge

1. CI checks must pass (tests, lint, build)
2. Minimum approvals met; respond within 48 hours
3. Resolve conversations, rebase on `main`, and merge without conflicts

## Issue Guidelines

### Creating Issues

- Bug reports: steps to reproduce, expected vs actual, environment
- Feature requests: problem statement, desired solution, alternatives, context

### Labels & Claiming

- Common labels: `bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`, `question`, `duplicate`, `wontfix`
- To claim: comment "I'd like to work on this"; wait for assignment; begin within 7 days

### Triage Workflow

1. Initial triage (≤24h): validate, categorize, prioritize
2. Technical assessment: reproducibility (`confirmed`), scope (`frontend`/`backend`/`infra`/`api`), effort estimate
3. Assignment: newcomer-friendly vs specialty needs; add mentoring notes
4. Tracking: add to project board, link milestones, update roadmap if needed

## Community

### Channels

- GitHub Issues: bugs and feature requests
- GitHub Discussions: Q&A and general topics
- Discord: real-time chat (invite link)
- Twitter: project updates

### Getting Help

- Read docs; search issues; ask in Discussions; join Discord

### Recognition

- Add to CONTRIBUTORS.md; highlight in release notes; feature top contributors

## Onboarding Checklists

### First-Time Contributor

```markdown
# New Contributor Onboarding

## Before You Start

- [ ] Read CODE_OF_CONDUCT.md and CONTRIBUTING.md
- [ ] Join Discord and introduce yourself

## Environment Setup

- [ ] Fork and clone
- [ ] npm install; copy .env; start Docker services
- [ ] Run migrations; start dev server; verify http://localhost:3000
- [ ] Run tests and ensure all pass

## First Contribution

- [ ] Claim a good first issue; create branch
- [ ] Make changes; write tests; lint and test
- [ ] Conventional commit; push; open PR; respond to reviews
```

### New Maintainer

```markdown
# Maintainer Onboarding

## Access & Permissions

- [ ] GitHub write, npm publish, deploy access
- [ ] Monitoring access; added to maintainers email and Discord

## Required Reading

- [ ] GOVERNANCE.md, ARCHITECTURE.md, RELEASING.md, recent ADRs

## Responsibilities

- [ ] Review PRs within 48h; triage weekly; participate in meetings
- [ ] Release quarterly; mentor contributors; rotate on-call

## Tools & Processes

- [ ] PR notifications; install `gh`; GPG signing; changelog automation; rollback practice
```

## Code of Conduct (Excerpt)

We pledge a harassment-free experience for everyone. Be welcoming, respectful, and empathetic; avoid trolling, harassment, or doxxing. Report issues to the conduct contact. Adapted from the Contributor Covenant.

## Best Practices

- Make setup easy: provide `npm run setup` for dependency install, env config, DB init
- Provide examples: show real paths and test locations; prefer “show, don’t tell”
- Keep guides current: update when processes change; include a PR checkbox
- Welcome newcomers: friendly tone and clear steps; avoid gatekeeping

## Anti-Patterns

- Vague instructions like “use the standard workflow”
- Assuming prior knowledge of tooling or processes
- Stale documentation and missing automation
- Intimidating tone or discouraging language

## Scenarios

### Fix a Bug

1. Reproduce and write a failing test
2. Implement fix; run `npm test` and `npm run lint`
3. Commit `fix(scope): concise description`; open PR and link issue

### Add a Feature

1. Discuss in issue; refine acceptance criteria
2. Branch `feature/...`; implement + tests + docs
3. Commit `feat(scope): ...`; ensure CI green; request review

### Docs-Only Change

1. Branch `docs/...`; update README or guides
2. Commit `docs: clarify setup`; open PR

## Tools & Techniques

- GitHub CLI (`gh`), ESLint, Prettier, TypeScript
- Conventional Commits; changelog automation
- Docker Compose for local services
- CI gates: tests, lint, build

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

## Conclusion

Follow the core workflow, keep changes small and well-tested, and communicate clearly. We’re excited to collaborate—thank you for contributing!

---

Related Skills: [code-review](../code-review/SKILL.md) | [git-workflow](../git-workflow/SKILL.md) | [changelogs](../changelogs/SKILL.md) | [adrs](../adrs/SKILL.md)

## CONTRIBUTING.md Template

### Complete Example

````markdown
# Contributing to [Project Name]

Thank you for your interest in contributing! We welcome contributions from everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to [conduct@project.com](mailto:conduct@project.com).

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Docker (for local database)

### Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/project.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Submit a pull request

## Development Setup

### 1. Install Dependencies

```bash
npm install
```
````

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Database

```bash
docker-compose up -d postgres redis
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

### 6. Run Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### Troubleshooting

- **Port 3000 already in use**: Change `PORT` in `.env`
- **Database connection error**: Ensure Docker containers are running
- **Tests failing**: Run `npm run db:reset` to reset test database

## Development Workflow

### Branch Naming

- Features: `feature/add-user-auth`
- Bug fixes: `fix/login-validation`
- Documentation: `docs/update-readme`
- Refactoring: `refactor/extract-user-service`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add OAuth2 Google login
fix(api): prevent duplicate user registration
docs: update API examples in README
test(auth): add tests for password reset
```

### Git Workflow

1. **Keep your fork synced**

   ```bash
   git remote add upstream https://github.com/original/repo.git
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create feature branch from main**

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature
   ```

3. **Make atomic commits**
   - Each commit should be a logical unit
   - Commit messages should explain _why_, not _what_

4. **Rebase before submitting PR**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

## Coding Standards

### Code Style

- We use ESLint and Prettier
- Run `npm run lint` before committing
- Run `npm run format` to auto-format code

### TypeScript

```typescript
// ✅ Good: Explicit types, clear names
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// ❌ Bad: Any types, unclear names
function get(x: any): Promise<any> {
  // Implementation
}
```

### Testing

- Write tests for all new features
- Aim for 80%+ code coverage
- Test file naming: `*.test.ts` or `*.spec.ts`

```typescript
// Example test structure
describe("UserService", () => {
  describe("createUser", () => {
    it("should create user with valid data", async () => {
      // Arrange
      const userData = { email: "test@example.com" };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it("should throw error for duplicate email", async () => {
      // Test error case
    });
  });
});
```

### Documentation

- Add JSDoc comments for public APIs
- Update README if changing user-facing behavior
- Add examples for new features

````typescript
/**
 * Authenticates a user with email and password
 *
 * @param email - User's email address
 * @param password - User's password (plain text)
 * @returns JWT token for authenticated user
 * @throws {AuthenticationError} If credentials are invalid
 *
 * @example
 * ```typescript
 * const token = await authenticateUser('user@example.com', 'password123');
 * ```
 */
async function authenticateUser(
  email: string,
  password: string,
): Promise<string> {
  // Implementation
}
````

## Submitting Changes

### Before Submitting

- [ ] Code passes all tests: `npm test`
- [ ] Code passes linting: `npm run lint`
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is rebased on latest main

### Pull Request Template

When creating a PR, fill out the template:

```markdown
## Description

Brief description of changes

Fixes #123

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe the tests you ran and how to reproduce them.

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### PR Review Process

1. **Automated checks must pass**
   - Tests
   - Linting
   - Build

2. **At least 2 approvals required**
   - Reviewers will comment within 48 hours
   - Address feedback and push updates

3. **Merge requirements**
   - All conversations resolved
   - Up to date with main branch
   - No merge conflicts

## Issue Guidelines

### Creating Issues

**Bug Reports**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**

- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.2.3]

**Additional context**
Any other context about the problem.
```

**Feature Requests**

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested
- `wontfix`: This will not be worked on
- `duplicate`: This issue already exists

### Claiming Issues

- Comment "I'd like to work on this" before starting
- Wait for maintainer assignment
- If assigned, start within 7 days or issue will be reopened

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord**: Real-time chat ([invite link](https://discord.gg/project))
- **Twitter**: [@projectname](https://twitter.com/projectname)

### Getting Help

- Check [documentation](https://docs.project.com)
- Search existing issues
- Ask in GitHub Discussions
- Join Discord for real-time help

### Recognition

- All contributors are added to [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Significant contributions highlighted in release notes
- Top contributors featured on project website

## Development Tips

### Debugging

```bash
# Debug mode
npm run dev:debug

# VS Code launch configuration available in .vscode/launch.json
```

### Database

```bash
# Reset database
npm run db:reset

# Create migration
npm run db:migration:create add_user_table

# Seed database
npm run db:seed
```

### Testing

```bash
# Run specific test file
npm test -- user.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Debug tests
npm run test:debug
```

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Questions?

Feel free to ask in [GitHub Discussions](https://github.com/user/repo/discussions)
or contact the maintainers at [maintainers@project.com](mailto:maintainers@project.com).

````

## Onboarding Checklist

### First-Time Contributor Checklist

```markdown
# New Contributor Onboarding

Welcome! Here's your onboarding checklist:

## Before You Start
- [ ] Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [ ] Read [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] Join [Discord](https://discord.gg/project)
- [ ] Introduce yourself in #introductions

## Environment Setup
- [ ] Fork the repository
- [ ] Clone your fork locally
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Start Docker services: `docker-compose up -d`
- [ ] Run migrations: `npm run db:migrate`
- [ ] Start dev server: `npm run dev`
- [ ] Verify server runs: http://localhost:3000
- [ ] Run tests: `npm test`
- [ ] Verify all tests pass

## Your First Contribution
- [ ] Find a "good first issue"
- [ ] Comment to claim the issue
- [ ] Create feature branch: `git checkout -b fix/issue-123`
- [ ] Make your changes
- [ ] Write tests for your changes
- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm test` and ensure all pass
- [ ] Commit with conventional format
- [ ] Push to your fork
- [ ] Create pull request
- [ ] Fill out PR template
- [ ] Respond to review feedback
- [ ] 🎉 PR merged!

## Optional: Become a Regular Contributor
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
