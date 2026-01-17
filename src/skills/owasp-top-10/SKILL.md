---
name: owasp-top-10
description: Identify and mitigate the most critical web application security risks (OWASP Top 10)
---

# 🏆 OWASP Top 10 Skill

## Overview

The OWASP Top 10 is a standard awareness document for developers and web application security. It represents the most critical security risks to web applications. This skill summarizes them and provides mitigation strategies.

## The Top 10 (2021)

### A01:2021 – Broken Access Control
Failures in enforcing restrictions on what authenticated users can do.
- **Mitigation**: Enforce server-side permissions (RBAC/ABAC). Deny by default.
- **Code**: `if (!user.can('edit:post')) throw new ForbiddenError();`

### A02:2021 – Cryptographic Failures
Exposure of sensitive data due to weak encryption or missing TLS.
- **Mitigation**: Use strong algorithms (AES-256, Argon2). Enforce HTTPS. Don't store cleartext passwords.

### A03:2021 – Injection
Untrusted data is sent to an interpreter (SQL, NoSQL, OS Context).
- **Mitigation**: Parameterized queries. Input validation.
- **Code**: `db.query('SELECT * FROM users WHERE id = $1', [input])` (Postgres)

### A04:2021 – Insecure Design
Flaws in the architectural design (e.g., missing rate limiting, plain text storage).
- **Mitigation**: Threat modeling. Secure design patterns.

### A05:2021 – Security Misconfiguration
Default passwords, open cloud buckets, detailed error messages.
- **Mitigation**: Automate config hardening. Disable default accounts. Remove unnecessary features.

### A06:2021 – Vulnerable and Outdated Components
Using libraries/frameworks with known vulnerabilities (CVEs).
- **Mitigation**: `npm audit` / Snyk / Dependabot. Keep dependencies updated.

### A07:2021 – Identification and Authentication Failures
Weak passwords, leaked session IDs, missing MFA.
- **Mitigation**: MFA. Strong password policies. Session rotation. Rate limiting.

### A08:2021 – Software and Data Integrity Failures
Updates without signing, deserialization of untrusted data.
- **Mitigation**: Digital signatures. Verify CI/CD pipeline integrity.

### A09:2021 – Security Logging and Monitoring Failures
Breaches detecting too late due to lack of logs or alerts.
- **Mitigation**: Log login failures, access control failures. Centralized monitoring.

### A10:2021 – Server-Side Request Forgery (SSRF)
Fetching a remote resource without validating the user-supplied URL.
- **Mitigation**: Validate target URLs. Disable internal network access (allow-list).

## Practical Workflow

1. **Static Analysis (SAST)**:
   - Run tools like SonarQube or ESLint security plugins to catch injection/misconfig issues during development.

2. **Dependency Scanning (SCA)**:
   - Enable Dependabot or Renovate. Blocks PRs introducing known CVEs.

3. **Dynamic Analysis (DAST)**:
   - Use OWASP ZAP to scan running applications for headers, SSRF, and exposure.

## Checklist

- [ ] Are we using parameterized queries (A03)?
- [ ] Is access control separate from the UI (enforced on server) (A01)?
- [ ] Are dependencies scanned for CVEs automatically (A06)?
- [ ] Are we logging security events (auth failures, permission denials) (A09)?
- [ ] Is HTTPS enforced everywhere (A02)?
