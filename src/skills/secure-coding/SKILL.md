---
name: secure-coding
description: Implement robust security controls including input validation, output encoding, and vulnerability prevention
---

# 🛡️ Secure Coding Skill

## Overview

This skill ensures code is resilient against attacks by applying defense-in-depth principles. It covers input validation, output encoding, parameterized queries, and safe cryptographic practices.

## Core Principles

### 1. Never Trust Input
- Validate all data crossing trust boundaries (API requests, file reads, env vars).
- Whitelist allow-known-good characters; reject everything else.

### 2. Output Encoding
- Context-aware encoding to prevent injection attacks (XSS, logs).
- HTML entity encoding for web views; JSON encoding for APIs.

### 3. Defense in Depth
- Layered security controls (check permissions, validate input, query with parameters).
- Fail securely (safe error messages, fail closed).

## Common Patterns

### Input Validation

**Do:**
```javascript
// Whitelist validation
const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
if (!isValidEmail) throw new Error("Invalid email format");
```

**Don't:**
```javascript
// Blacklist (easily bypassed)
if (input.includes("<script>")) ... 
```

### SQL Injection Prevention

**Do:**
```javascript
// Parameterized query
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Don't:**
```javascript
// String concatenation
db.query('SELECT * FROM users WHERE id = ' + userId);
```

### XSS Prevention (Context-Aware Encoding)

**HTML Context:**
```html
<div><%= escapeHtml(userInput) %></div>
```

**JavaScript Context:**
```script
// Safe JSON serialization
const data = <%- JSON.stringify(userData) %>;
```

### Safe Password Storage

- Use slow hashing algorithms: Argon2id, bcrypt, scrypt.
- Never use simple hashes (MD5, SHA1, SHA256) for passwords.
- Always use a unique per-user salt.

```javascript
// Example using Argon2
const hash = await argon2.hash(password);
const verified = await argon2.verify(hash, password);
```

### Security Headers

Ensure applications set standard security headers:

- `Content-Security-Policy`: Restrict sources of scripts/styles.
- `Strict-Transport-Security`: Enforce HTTPS.
- `X-Frame-Options`: Prevent clickjacking.
- `X-Content-Type-Options`: Prevent MIME sniffing.

## Checklist

- [ ] Validated all inputs against a strict schema/allowlist?
- [ ] Used parameterized queries for ALL database access?
- [ ] Encoded output for the specific context (HTML, JS, URL)?
- [ ] Used strong, salted hashes for passwords?
- [ ] Configured security headers?
- [ ] Avoided dangerous functions (`eval`, `innerHTML`, `exec`)?
