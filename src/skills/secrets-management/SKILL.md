---
name: secrets-management
description: Securely manage, rotate, and access application secrets (API keys, DB credentials) without committing them to code
---

# 🔑 Secrets Management Skill

## Overview

This skill guides the secure handling of sensitive configuration data (API keys, database credentials, certificates). It moves beyond environment variables to enterprise secret management practices.

## Core Principles

### 1. No Secrets in Code
- **Never** commit secrets to version control (git).
- Use `.gitignore` for `.env` files.
- Use pre-commit hooks to scan for leaks.

### 2. Least Privilege
- Applications should only access secrets they specifically need.
- Separate secrets by environment (dev, staging, prod).

### 3. Dynamic Secrets & Rotation
- Rotate long-lived credentials regularly (automated preferred).
- Use dynamic short-lived credentials (e.g., AWS IAM Roles).

## Storage Strategies

### Level 1: Environment Variables (The Basics)
- Use `.env` files for local development.
- Inject env vars at runtime in CI/CD (GitHub Secrets, GitLab Variables).
- **Risk**: Env vars can leak in logs or crash dumps.

### Level 2: Cloud Secret Managers (Recommended)
- AWS Secrets Manager / Parameter Store.
- Google Secret Manager.
- Azure Key Vault.
- **Benefit**: Encryption at rest, fine-grained access, audit logs.

### Level 3: Dedicated Vault
- HashiCorp Vault.
- Platform agnostic, highly advanced features (dynamic secrets, transit encryption).

## Implementation Patterns

### Scanning for Leaks
Tools to prevent accidental commits:
- `trufflehog`
- `git-secrets`
- `gitleaks`

### Accessing Secrets (Node.js Example)

**Bad:**
```javascript
const apiKey = "sk_live_12345"; // HARDCODED
```

**Better:**
```javascript
require('dotenv').config();
const apiKey = process.env.STRIPE_API_KEY;
```

**Best (AWS Secrets Manager):**
```javascript
const { GetSecretValueCommand, SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: "prod/app/db" })
);
const secrets = JSON.parse(response.SecretString);
```

## Checklist

- [ ] `.gitignore` contains `.env`, `*.pem`, `*.key`?
- [ ] Pre-commit hooks configured to block high-entropy strings?
- [ ] Secrets separated by environment (dev/stage/prod)?
- [ ] Application logs sanitized to mask secrets?
- [ ] Rotation policy defined for long-lived keys?
- [ ] Access to production secrets restricted to CI/CD and break-glass admins?
