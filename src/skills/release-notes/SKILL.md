---
name: release-notes
description: Communicate changes to end users with clear, user-focused language, migration guides, and upgrade instructions.
---

# 📋 Release Notes

## Overview

Release notes communicate changes to end users in a clear, user-focused way. This skill covers writing user-facing language (avoiding jargon), highlighting features and breaking changes, creating migration guides, documenting known issues with workarounds, and providing upgrade instructions to ensure users can confidently adopt new versions.

## Core Principles

1. Write for users, not developers: focus on benefits, not technical implementation.
2. Highlight breaking changes prominently: users must know what will break before upgrading.
3. Provide step-by-step migration guides: code comparisons, timelines, and rollback plans.
4. Document known issues with workarounds: transparency builds trust.
5. Use active, empathetic tone: celebrate wins, acknowledge pain points, guide users.

## User-Facing Language

### Writing for Users

**Avoid Jargon**

```markdown
# ❌ Technical jargon

- Implemented GraphQL subscription via WebSocket transport layer
- Refactored ORM queries with eager loading optimization

# ✅ User-focused language

- Real-time updates: See changes instantly without refreshing
- Faster page loads: Data loads 3x faster
```

**Focus on Benefits**

```markdown
# ❌ What changed (technical)

- Added Redis caching layer

# ✅ Why it matters (benefit)

- Faster response times: API requests now return in < 100ms
```

**Use Active Voice**

```markdown
# ❌ Passive voice

- Support for dark mode has been added
- Bugs were fixed in the payment flow

# ✅ Active voice

- We added dark mode support
- We fixed bugs in the payment flow
```

### Tone and Style

**Conversational**

```markdown
# ✅ Friendly and conversational

We're excited to announce dark mode! Toggle it in Settings > Appearance.

# ❌ Corporate and dry

Dark mode functionality has been implemented. Configuration available in preferences.
```

**Empathetic**

```markdown
# ✅ Acknowledges pain points

We know you've been waiting for bulk export. It's finally here!

# ❌ Impersonal

Bulk export feature released.
```

## Feature Highlights

### Structuring Features

```markdown
## What's New in 2.0

### 🎨 Dark Mode

Switch between light and dark themes in Settings. Your eyes will thank you!

**How to use:**

1. Go to Settings > Appearance
2. Select "Dark" or "Light"
3. Theme applies immediately

### 📊 Advanced Analytics Dashboard

New charts and metrics to track your growth:

- User engagement trends
- Revenue forecasting
- Custom date ranges

**Pro tip:** Export charts as PNG for your presentations.

### 🔔 Smart Notifications

Get notified about what matters:

- Customizable notification rules
- Quiet hours: No notifications during sleep
- Channel-specific settings (email, push, SMS)

**Try it:** Set up your first notification rule in Settings > Notifications
```

### Before/After Examples

```markdown
## Improved Search

**Before:** Search only matched exact titles
**Now:** Search finds results in titles, descriptions, tags, and comments

**Example:**
Searching for "authentication" now finds:

- Posts about OAuth, SSO, and login flows
- Comments mentioning auth issues
- Tags like #auth, #security
```

### Visual Elements

```markdown
## New Dashboard

![Dashboard Preview](https://assets.app.com/dashboard-v2.png)

**What's changed:**

- Cleaner layout with more white space
- Drag-and-drop widget rearrangement
- Responsive design for mobile
```

## Breaking Changes

### Clear Communication

```markdown
## ⚠️ Breaking Changes in 2.0

### API Authentication

**What changed:** API now requires OAuth 2.0 instead of API keys

**Who's affected:** All API users

**What you need to do:**

1. Create OAuth app in Developer Settings
2. Update your code to use OAuth tokens
3. Migrate by May 1, 2024 (API keys stop working)

**Migration guide:** [docs.app.com/oauth-migration](https://docs.app.com/oauth-migration)

### Database Schema

**What changed:** `user.name` split into `firstName` and `lastName`

**Who's affected:** Applications using the REST API or GraphQL API

**What you need to do:**
Update your queries:
\`\`\`diff

- const name = user.name

* const name = `${user.firstName} ${user.lastName}`
  \`\`\`

**Migration guide:** [See full migration guide →](https://docs.app.com/v2-migration#user-model)
```

### Migration Timeline

```markdown
## Migration Timeline

**March 15, 2024 - v2.0 Released**

- Both old and new APIs available
- Deprecation warnings added

**April 1, 2024 - Migration Deadline Reminder**

- Email sent to all API users
- Dashboard banner for active applications

**May 1, 2024 - Old API Retired**

- API keys stop working
- Applications must use OAuth

**Need more time?** Contact support@app.com
```

## Migration Guides

### Step-by-Step Guide

```markdown
## Migrating from 1.x to 2.0

### Overview

Version 2.0 introduces breaking changes to authentication. This guide walks you through the migration process.

**Estimated time:** 30-45 minutes  
**Difficulty:** Intermediate

---

### Step 1: Create OAuth Application

1. Log in to [Developer Portal](https://developers.app.com)
2. Click "Create New App"
3. Fill in application details:
   - **Name:** Your Application Name
   - **Callback URL:** `https://yourapp.com/auth/callback`
4. Save and note your **Client ID** and **Client Secret**

📸 [Screenshot: OAuth app creation](https://assets.app.com/oauth-create.png)

---

### Step 2: Install New SDK

**npm:**
\`\`\`bash
npm install @app/sdk@2.0.0
\`\`\`

**yarn:**
\`\`\`bash
yarn add @app/sdk@2.0.0
\`\`\`

---

### Step 3: Update Authentication Code

**Before (1.x):**
\`\`\`javascript
const client = new AppClient({
apiKey: 'sk_live_abc123'
});
\`\`\`

**After (2.0):**
\`\`\`javascript
const client = new AppClient({
clientId: 'your_client_id',
clientSecret: 'your_client_secret',
redirectUri: 'https://yourapp.com/auth/callback'
});

// Redirect user to OAuth consent page
app.get('/login', (req, res) => {
const authUrl = client.getAuthorizationUrl();
res.redirect(authUrl);
});

// Handle OAuth callback
app.get('/auth/callback', async (req, res) => {
const { code } = req.query;
const tokens = await client.exchangeCodeForTokens(code);

// Store tokens securely
req.session.accessToken = tokens.accessToken;
req.session.refreshToken = tokens.refreshToken;

res.redirect('/dashboard');
});
\`\`\`

---

### Step 4: Update API Calls

**Before (1.x):**
\`\`\`javascript
const users = await client.getUsers();
\`\`\`

**After (2.0):**
\`\`\`javascript
// Pass access token with each request
const users = await client.getUsers({
accessToken: req.session.accessToken
});
\`\`\`

**Or configure client globally:**
\`\`\`javascript
client.setAccessToken(req.session.accessToken);
const users = await client.getUsers();
\`\`\`

---

### Step 5: Handle Token Refresh

\`\`\`javascript
// Tokens expire after 1 hour
// Refresh automatically when expired
client.on('tokenExpired', async () => {
const newTokens = await client.refreshTokens(req.session.refreshToken);
req.session.accessToken = newTokens.accessToken;
req.session.refreshToken = newTokens.refreshToken;
});
\`\`\`

---

### Step 6: Test Migration

1. **Test authentication flow**
   - Try logging in
   - Verify redirect works
   - Check tokens are stored

2. **Test API calls**
   - Verify all API calls work with OAuth
   - Check error handling

3. **Test token refresh**
   - Wait for token expiry (or force it)
   - Verify refresh works automatically

---

### Step 7: Deploy

1. Update environment variables
2. Deploy to staging
3. Test thoroughly
4. Deploy to production
5. Monitor for errors

---

### Troubleshooting

**Error: Invalid client credentials**

- Double-check Client ID and Client Secret
- Ensure no extra spaces or quotes

**Error: Redirect URI mismatch**

- Verify redirect URI exactly matches OAuth app settings
- Include protocol (https://)

**Error: Token expired**

- Implement token refresh logic (Step 5)

---

### Need Help?

- 📖 [Full API Documentation](https://docs.app.com/v2)
- 💬 [Community Forum](https://community.app.com)
- 📧 [Email Support](mailto:support@app.com)
```

### Code Comparison

```markdown
## Code Changes Summary

### Authentication

| Task                  | v1.x                     | v2.0                                     |
| --------------------- | ------------------------ | ---------------------------------------- |
| **Initialize client** | `new Client({ apiKey })` | `new Client({ clientId, clientSecret })` |
| **Authenticate**      | Automatic with API key   | OAuth flow required                      |
| **API calls**         | `client.getUsers()`      | `client.getUsers({ accessToken })`       |
| **Token management**  | Not needed               | Refresh tokens every hour                |

### User Model

| Field      | v1.x          | v2.0                             |
| ---------- | ------------- | -------------------------------- |
| **Name**   | `user.name`   | `user.firstName + user.lastName` |
| **Email**  | `user.email`  | `user.email` (unchanged)         |
| **Avatar** | `user.avatar` | `user.avatarUrl` (renamed)       |
```

## Known Issues and Workarounds

### Documenting Issues

```markdown
## Known Issues

### Dark mode flickers on page load

**Impact:** Low - Visual glitch only  
**Affected:** Safari 17+ on macOS

**Workaround:**
Add this to your CSS:
\`\`\`css
:root {
color-scheme: light dark;
}
\`\`\`

**Status:** Fix planned for 2.1 (April 2024)  
**Track:** [Issue #1234](https://github.com/org/repo/issues/1234)

---

### Export to PDF fails for large datasets

**Impact:** Medium - Feature unavailable for large reports  
**Affected:** Reports with > 10,000 rows

**Workaround:**

1. Filter data to reduce rows
2. Or use CSV export instead (no row limit)

**Status:** Investigating compression options  
**Track:** [Issue #1235](https://github.com/org/repo/issues/1235)

---

### API rate limit hit during bulk operations

**Impact:** High - Operations fail  
**Affected:** Bulk imports/exports

**Workaround:**
Batch your requests:
\`\`\`javascript
// Instead of sending 1000 requests at once:
for (const item of items) {
await api.create(item);
await sleep(100); // Wait 100ms between requests
}
\`\`\`

**Status:** Increasing rate limits in next release  
**Track:** [Issue #1236](https://github.com/org/repo/issues/1236)
```

### Severity Levels

```markdown
## Known Issues

🔴 **High Severity** - Feature broken or major impact

- Export fails for large datasets

🟡 **Medium Severity** - Workaround available, minor impact

- Dark mode flickers on load
- Search performance slow for old data

🟢 **Low Severity** - Cosmetic or edge case

- Button alignment off by 2px
- Tooltip shows briefly on hover
```

## Upgrade Instructions

### Version-Specific Guides

```markdown
## Upgrading to 2.0

### Prerequisites

- Node.js 18+ (previously 16+)
- npm 9+ (previously 8+)
- Database migration recommended

### Upgrade Steps

#### 1. Backup Your Data

\`\`\`bash

# PostgreSQL

pg*dump mydb > backup*$(date +%Y%m%d).sql

# MongoDB

mongodump --db mydb --out backup\_$(date +%Y%m%d)
\`\`\`

#### 2. Update Dependencies

\`\`\`bash
npm install @app/sdk@2.0.0
\`\`\`

#### 3. Run Database Migrations

\`\`\`bash
npm run db:migrate
\`\`\`

**⚠️ Important:** Migrations are irreversible. Back up first!

#### 4. Update Configuration

\`\`\`diff

# .env

- API_KEY=sk_live_abc123

* CLIENT_ID=your_client_id
* CLIENT_SECRET=your_client_secret
* REDIRECT_URI=https://yourapp.com/auth/callback
  \`\`\`

#### 5. Update Code

Follow the [migration guide](https://docs.app.com/v2-migration) to update your code.

#### 6. Test

\`\`\`bash
npm test
\`\`\`

#### 7. Deploy

\`\`\`bash

# Deploy to staging first

npm run deploy:staging

# Test staging thoroughly

# Deploy to production

npm run deploy:production
\`\`\`

### Rollback Plan

If something goes wrong:

\`\`\`bash

# 1. Rollback application

npm install @app/sdk@1.9.0
git checkout main
npm run deploy

# 2. Restore database

psql mydb < backup_20240315.sql

# 3. Verify

curl https://yourapp.com/health
\`\`\`

### Post-Upgrade Checklist

- [ ] All tests passing
- [ ] Authentication working
- [ ] API calls successful
- [ ] No error logs
- [ ] Performance acceptable
- [ ] Monitoring shows healthy metrics
```

### Multi-Version Upgrade

```markdown
## Upgrading from 1.5 to 2.0

If you're on an older version, upgrade incrementally:

1. **1.5 → 1.9** (latest 1.x)
   \`\`\`bash
   npm install @app/sdk@1.9.0

   # No breaking changes

   \`\`\`

2. **1.9 → 2.0** (major upgrade)
   \`\`\`bash
   npm install @app/sdk@2.0.0
   # Follow migration guide above
   \`\`\`

**Why?**

- Incremental upgrades are safer
- Bug fixes in 1.9 make migration smoother
- Less code changes at once
```

## Release Notes Template

```markdown
# Release Notes Template

## [Version] - [Date]

### 🎉 Highlights

Brief overview of the most exciting changes.

---

### ✨ New Features

#### [Feature Name]

Description of what it does and why users will love it.

**How to use:**

1. Step 1
2. Step 2

**Learn more:** [Link to docs]

---

### 💪 Improvements

- **[Area]:** What improved and the benefit
- **[Area]:** What improved and the benefit

---

### 🐛 Bug Fixes

- Fixed [issue] that caused [problem]
- Resolved [bug] affecting [users/feature]

---

### ⚠️ Breaking Changes

#### [Breaking Change Name]

**What changed:** Description  
**Who's affected:** Who needs to take action  
**What to do:** Action items  
**Migration guide:** [Link]

---

### 🔧 Deprecations

**[Deprecated Feature]:** Will be removed in version X.Y. Use [alternative] instead.

---

### 📚 Documentation

- New guide: [Guide name]
- Updated: [What was updated]

---

### 🐞 Known Issues

- [Issue]: [Workaround or status]

---

### 📦 Upgrade Instructions

**Upgrading from X.Y?**
\`\`\`bash
npm install @app/sdk@[version]
\`\`\`

**Breaking changes?** See [migration guide](link)

---

### 🙏 Contributors

Thank you to everyone who contributed to this release:

- @username1
- @username2

**Full changelog:** [GitHub Release](link)
```

## Real-World Examples

### Stripe Release Notes

```markdown
# Stripe API 2023-10-16

## Payment Links Now Support Subscriptions

Payment Links, our no-code payment pages, now support subscriptions! Create recurring payment links without writing any code.

**Use cases:**

- Monthly membership fees
- SaaS subscriptions
- Donation programs

**How to use:**

1. Create a Payment Link
2. Select "Recurring" as payment type
3. Set billing interval

[Create your first subscription link →](https://dashboard.stripe.com/payment-links)

---

## Improved Checkout Performance

Checkout now loads 40% faster globally.

**What we did:**

- Optimized asset delivery
- Reduced JavaScript bundle size
- Added edge caching

**Your action:** None! All Checkout sessions automatically benefit.

---

## Breaking Change: Legacy Charges API Deprecated

The Charges API (charges.create) will be removed on January 1, 2025.

**What to use instead:** Payment Intents API

**Migration guide:** [Charges to Payment Intents](https://stripe.com/docs/payments/charges-to-payment-intents-migration)

**Why the change:** Payment Intents supports 3D Secure, async payment methods, and improved fraud detection.
```

### React Release Notes

```markdown
# React 18.2.0

## Automatic Batching for Fewer Renders

React now batches state updates automatically, even in async code!

**Before:**
\`\`\`javascript
// Two renders
fetch('/api').then(() => {
setData(data); // Render 1
setLoading(false); // Render 2
});
\`\`\`

**After:**
\`\`\`javascript
// One render
fetch('/api').then(() => {
setData(data); // Batched
setLoading(false); // Batched
}); // Single render here
\`\`\`

**Performance impact:** Up to 50% fewer renders in typical apps.

**Learn more:** [Automatic Batching in React 18](https://react.dev/blog/2022/03/29/react-v18#automatic-batching)

---

## New Hook: useId

Generate unique IDs for accessibility attributes.

\`\`\`javascript
function PasswordField() {
const id = useId();
return (
<>
<label htmlFor={id}>Password:</label>
<input id={id} type="password" />
</>
);
}
\`\`\`

**Why it matters:** Safe for server-side rendering, no ID collisions.

---

## Upgrade to React 18

\`\`\`bash
npm install react@18 react-dom@18
\`\`\`

**Breaking changes?** Very few! See [migration guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide).

**Opt-in features:** Concurrent features like `useTransition` and `useDeferredValue` are opt-in. Your app works without changes.
```

## Best Practices

- Write for your audience: end users get benefits, developers get technical details
- Show impact: quantify improvements (3x faster, 50% smaller bundle)
- Provide code examples: before/after comparisons for developers
- Link to detailed docs: migration guides, API references, video tutorials
- Highlight breaking changes prominently with ⚠️ warnings
- Create step-by-step migration guides with timelines and rollback plans
- Document known issues with severity levels and workarounds
- Use active, conversational, empathetic tone

## Anti-Patterns

- Using technical jargon for end users ("refactored persistence layer with CQRS")
- Burying breaking changes in changelogs ("misc updates")
- Skipping upgrade instructions beyond "npm install"
- No migration guide for breaking changes
- Hiding known issues instead of documenting workarounds
- Passive, corporate tone ("functionality has been implemented")
- No before/after code examples
- Missing severity levels for known issues

## Scenarios

### Release Major Version with Breaking Changes

1. Identify all breaking changes (API changes, schema updates, removed features)
2. Write migration guide: step-by-step, code comparisons, timeline
3. Highlight features with benefits ("2x faster login", "3x smaller bundle")
4. Document known issues with workarounds and severity
5. Provide upgrade instructions: backup, deps, migrations, code, test, deploy, rollback

### Communicate Feature Launch

1. Write user-facing description: what it does, why it matters
2. Add visual elements: screenshots, GIFs, before/after comparisons
3. Provide "How to use" steps with numbered lists
4. Link to detailed documentation and video tutorials
5. Include pro tips and examples

### Document Known Issues Post-Release

1. List issues with severity: 🔴 high, 🟡 medium, 🟢 low
2. Explain impact and who's affected
3. Provide workarounds with code examples
4. Share status and ETA for fix
5. Link to GitHub issue for tracking

### Create Migration Guide for API Change

1. Overview: what changed, estimated time, difficulty level
2. Prerequisites: Node version, backups, environment checks
3. Step-by-step: OAuth app creation, SDK update, code changes, testing
4. Code comparisons: before/after with diff syntax
5. Troubleshooting section with common errors and solutions

## Tools & Techniques

- Automation: generate from CHANGELOG.md, GitHub Release Actions, semantic-release
- Formatting: Markdown with emojis, code blocks with diff syntax, tables for comparisons
- Visuals: screenshots, GIFs, architecture diagrams, before/after UI mockups
- Real-world examples: Stripe API releases, React releases, Django release notes
- Distribution: GitHub Releases, email newsletters, social media, in-app notifications
- Templates: structured format for consistency (features, improvements, bug fixes, breaking changes, known issues)

## Quick Reference

```markdown
# Release Notes Checklist

## Before Release

- [ ] Write user-facing descriptions
- [ ] Identify breaking changes
- [ ] Create migration guides
- [ ] Document known issues
- [ ] Test upgrade process
- [ ] Prepare rollback plan

## In Release Notes

- [ ] Highlight exciting features
- [ ] Explain benefits (not just what changed)
- [ ] Provide code examples
- [ ] Link to detailed docs
- [ ] Call out breaking changes prominently
- [ ] Include upgrade instructions
- [ ] List known issues with workarounds
- [ ] Thank contributors

## After Release

- [ ] Publish to GitHub Releases
- [ ] Email release notes to users
- [ ] Post on social media
- [ ] Update documentation
- [ ] Monitor for issues
```

## Conclusion

Effective release notes balance user-facing communication with technical detail. Focus on benefits, highlight breaking changes prominently, provide migration guides with code examples, document known issues transparently, and use an empathetic tone. Users will appreciate clarity and upgrade confidently.

---

**Related Skills**: [changelogs](../changelogs/SKILL.md) | [contributor-guide](../contributor-guide/SKILL.md) | [commit-message](../commit-message/SKILL.md)
