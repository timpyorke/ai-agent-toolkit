# Examples

## Standard Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Component Examples

### Subject Line

```
feat(auth): add OAuth2 authentication support
fix(api): resolve race condition in user creation
docs(readme): update installation instructions
refactor(database): simplify query builder interface
```

### Body

```
fix(payments): prevent duplicate charge processing

The payment service was creating multiple charges when users
clicked the submit button rapidly. This adds a client-side
debounce and server-side idempotency check using request IDs.

- Add 500ms debounce to payment button
- Implement idempotency keys in payment API
- Store processed request IDs in Redis with 24h TTL
```

### Footer

```
Fixes #123
Closes #456, #789
Refs #321

BREAKING CHANGE: Authentication now requires API key in header
```

## Real-world Examples

### Good Commit Messages

#### Feature Addition

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

#### Bug Fix

```
fix(api): prevent null pointer exception in user endpoint

The /api/users/:id endpoint was throwing NPE when accessing
deleted user accounts. Now returns 404 with appropriate error
message when user is not found or has been soft-deleted.

Fixes #567
```

#### Refactoring

```
refactor(auth): extract JWT logic into separate service

Moves JWT token generation and validation from inline code in
the auth controller into a dedicated JwtService. This improves
testability and makes the token logic reusable across different
authentication flows.

No functional changes.
```

#### Breaking Change

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

## Tools and Automation

### Commit Message Linters

```bash
# Commitlint - Enforce conventional commits
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Commitizen - Interactive commit message builder
npm install --save-dev commitizen cz-conventional-changelog
```

### Git Commit Templates

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

### Pre-commit Hooks

```bash
# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit $1
```
