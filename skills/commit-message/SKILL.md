---
name: commit-message
description: Write clear, meaningful, and standardized commit messages following best practices
---

# 📝 Commit Message Skill

## Overview

This skill enables AI assistants to create well-structured commit messages that accurately describe changes, provide context, and follow industry-standard conventions. Good commit messages are essential for maintaining project history and facilitating collaboration.

## Core Principles

### 1. Clarity and Conciseness

- Write messages that explain what changed and why
- Use clear, descriptive language
- Avoid vague terms like "fix", "update", or "change" without context
- Be specific about the impact of changes

### 2. Consistency

- Follow established project conventions
- Use consistent formatting and style
- Maintain a unified voice across commits
- Adhere to team or project-specific standards

### 3. Meaningful Context

- Explain the motivation behind changes
- Reference related issues or tickets
- Describe the problem being solved
- Note any important implementation decisions

## Commit Message Structure

### Standard Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

#### Subject Line (Required)

- **Maximum 50-72 characters**
- Start with a type prefix
- Use imperative mood ("add" not "added" or "adds")
- Don't end with a period
- Capitalize the first letter after the colon

**Examples:**

```
feat(auth): add OAuth2 authentication support
fix(api): resolve race condition in user creation
docs(readme): update installation instructions
refactor(database): simplify query builder interface
```

#### Body (Optional but Recommended)

- Wrap at 72 characters
- Explain **what** and **why**, not **how**
- Use bullet points for multiple items
- Add a blank line between subject and body
- Provide additional context and rationale

**Example:**

```
fix(payments): prevent duplicate charge processing

The payment service was creating multiple charges when users
clicked the submit button rapidly. This adds a client-side
debounce and server-side idempotency check using request IDs.

- Add 500ms debounce to payment button
- Implement idempotency keys in payment API
- Store processed request IDs in Redis with 24h TTL
```

#### Footer (Optional)

- Reference issues, tickets, or breaking changes
- Use standard keywords for issue tracking
- Document breaking changes explicitly

**Examples:**

```
Fixes #123
Closes #456, #789
Refs #321

BREAKING CHANGE: Authentication now requires API key in header
```

## Commit Types

### Primary Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc. (no code change)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Maintenance tasks, updating tooling, etc.
- **revert**: Reverting a previous commit

### Type Selection Guide

| Change Description               | Type       | Example                     |
| -------------------------------- | ---------- | --------------------------- |
| Adding new functionality         | `feat`     | Adding user registration    |
| Fixing a bug                     | `fix`      | Correcting validation logic |
| Updating documentation           | `docs`     | Improving API docs          |
| Code cleanup, no behavior change | `refactor` | Extracting helper functions |
| Performance optimization         | `perf`     | Caching database queries    |
| Test additions/modifications     | `test`     | Adding unit tests           |
| Dependency updates               | `build`    | Upgrading React version     |
| CI/CD changes                    | `ci`       | Updating GitHub Actions     |
| Formatting, linting              | `style`    | Running code formatter      |

## Scope Guidelines

### What is a Scope?

A scope specifies the section of the codebase affected by the commit. It provides quick context about where changes were made.

### Common Scopes

- **Component names**: `auth`, `user`, `payment`, `admin`
- **File types**: `api`, `ui`, `database`, `middleware`
- **Features**: `login`, `signup`, `checkout`, `dashboard`
- **Modules**: `core`, `utils`, `services`, `models`

### Scope Best Practices

- Keep scopes consistent within the project
- Use lowercase
- Avoid overly broad scopes like "app" or "code"
- Be specific but not overly granular
- Document common scopes in contributing guidelines

## Best Practices

### Do:

- ✅ Use imperative mood in the subject line
- ✅ Separate subject from body with a blank line
- ✅ Explain **why** the change was necessary
- ✅ Reference related issues or tickets
- ✅ Keep commits atomic (one logical change per commit)
- ✅ Write for your future self and teammates
- ✅ Use consistent language and terminology
- ✅ Proofread before committing

### Don't:

- ❌ Write vague messages like "fix bug" or "update code"
- ❌ Include multiple unrelated changes in one commit
- ❌ Use past tense ("fixed" instead of "fix")
- ❌ Exceed character limits (50 for subject, 72 for body)
- ❌ Assume everyone has context about the change
- ❌ Commit commented-out code without explanation
- ❌ Use abbreviations that aren't universally understood

## Examples

### Good Commit Messages

#### Example 1: Feature Addition

```
feat(checkout): add support for multiple payment methods

Users can now choose between credit card, PayPal, and Apple Pay
at checkout. This implements the payment abstraction layer that
allows easy addition of new payment providers in the future.

- Add PaymentProvider interface
- Implement credit card, PayPal, and Apple Pay providers
- Update checkout UI with payment method selector
- Add integration tests for each provider

Closes #234
```

#### Example 2: Bug Fix

```
fix(api): prevent null pointer exception in user endpoint

The /api/users/:id endpoint was throwing NPE when accessing
deleted user accounts. Now returns 404 with appropriate error
message when user is not found or has been soft-deleted.

Fixes #567
```

#### Example 3: Refactoring

```
refactor(auth): extract JWT logic into separate service

Moves JWT token generation and validation from inline code in
the auth controller into a dedicated JwtService. This improves
testability and makes the token logic reusable across different
authentication flows.

No functional changes.
```

#### Example 4: Breaking Change

```
feat(api): migrate to v2 authentication flow

Replaces session-based auth with JWT tokens for better
scalability and support for mobile clients. All API endpoints
now require Bearer token authentication.

BREAKING CHANGE: Session cookies are no longer supported.
Clients must use JWT tokens in Authorization header.
See migration guide: docs/auth-migration.md

Refs #789
```

### Bad Commit Messages (to Avoid)

```
❌ fix bug
❌ updated files
❌ WIP
❌ Fixed the thing that was broken
❌ Changes
❌ asdfasdf
❌ Final version
❌ Updated code based on review comments
```

## Advanced Techniques

### Atomic Commits

Each commit should represent one logical change:

- ✅ One feature or fix per commit
- ✅ All tests pass after each commit
- ✅ Commit compiles and runs
- ✅ Can be reverted independently

### Co-authored Commits

When pair programming or collaborating:

```
feat(dashboard): add real-time analytics widget

Co-authored-by: Jane Smith <jane@example.com>
Co-authored-by: Bob Johnson <bob@example.com>
```

### Referencing Issues

Use keywords for automatic issue management:

- `Fixes #123` - Closes the issue when merged
- `Closes #123` - Closes the issue when merged
- `Resolves #123` - Closes the issue when merged
- `Refs #123` - References without closing
- `See also #123` - Related issue reference

## Project-Specific Conventions

### Check for Project Standards

Before committing, review:

1. **CONTRIBUTING.md** - Project contribution guidelines
2. **Existing commits** - Follow established patterns
3. **Pull request templates** - Required information
4. **CI checks** - Automated commit message validation

### Adapting to Team Conventions

Some teams may use:

- Custom commit types (e.g., `hotfix`, `release`)
- Emoji prefixes (e.g., ✨ for features)
- Ticket number requirements in subject line
- Specific scope naming conventions
- Different character limits

**Always follow the project's established conventions over generic best practices.**

## Tools and Automation

### Commit Message Linters

```bash
# Commitlint - Enforce conventional commits
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Commitizen - Interactive commit message builder
npm install --save-dev commitizen cz-conventional-changelog
```

### Git Commit Templates

Create a template file:

```bash
# ~/.gitmessage.txt
# <type>(<scope>): <subject>

# <body>

# <footer>

# Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore
# Scope: component, file, or feature affected
# Subject: imperative mood, lowercase, no period
# Body: explain what and why vs. how
# Footer: reference issues, breaking changes
```

Configure git to use it:

```bash
git config --global commit.template ~/.gitmessage.txt
```

### Pre-commit Hooks

Validate commit messages automatically:

```bash
# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit $1
```

## Workflow Integration

### When Writing Commits

1. **Stage related changes**: `git add` only related files
2. **Review the diff**: `git diff --staged`
3. **Write the message**: Follow the format and conventions
4. **Proofread**: Check for clarity and accuracy
5. **Commit**: `git commit` (avoid `-m` for complex messages)

### When AI Generates Commits

The AI should:

1. **Analyze the changes**: Review staged files and diffs
2. **Identify the type**: Determine the appropriate commit type
3. **Determine scope**: Identify affected components
4. **Write clear subject**: Summarize in 50 characters
5. **Provide context**: Add body with explanation when needed
6. **Reference issues**: Include relevant issue numbers
7. **Note breaking changes**: Explicitly document if applicable

## Quick Reference

### Commit Message Checklist

- [ ] Type prefix is accurate and appropriate
- [ ] Scope identifies the affected area
- [ ] Subject is 50 characters or less
- [ ] Subject uses imperative mood
- [ ] Subject is clear and descriptive
- [ ] Body wraps at 72 characters
- [ ] Body explains what and why
- [ ] Footer references related issues
- [ ] Breaking changes are documented
- [ ] Message follows project conventions
- [ ] No spelling or grammar errors

### Common Patterns

```bash
# Simple fix
fix(auth): correct email validation regex

# Feature with body
feat(api): add pagination to user list endpoint

Implements cursor-based pagination for better performance
with large datasets. Supports forward and backward pagination.

# Multiple issues
fix(ui): resolve various layout issues in mobile view

Closes #123, #124, #125

# Revert
revert: feat(api): add pagination to user list endpoint

This reverts commit abc123. The pagination implementation
caused performance issues in production.
```

## Summary

Good commit messages are a gift to your future self and your teammates. They should tell a story about the evolution of the codebase, making it easy to understand why changes were made and how the project arrived at its current state.

**Remember**: A well-crafted commit message takes a few extra minutes to write but saves hours of confusion and context-switching in the future.
