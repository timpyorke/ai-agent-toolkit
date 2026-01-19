# Reference Material

## OWASP Top 10 (2021)

| ID | Title | Description |
|----|-------|-------------|
| **A01** | **Broken Access Control** | Users acting outside of their intended permissions. |
| **A02** | **Cryptographic Failures** | Failures related to cryptography (formerly Sensitive Data Exposure). |
| **A03** | **Injection** | SQL, NoSQL, OS command injection. |
| **A04** | **Insecure Design** | Risks related to design flaws and architectural structures. |
| **A05** | **Security Misconfiguration** | Incorrectly configured security controls/defaults. |
| **A06** | **Vulnerable Components** | Using libraries/frameworks with known vulnerabilities. |
| **A07** | **Auth Failures** | Weak passwords, session management, or credential stuffing. |
| **A08** | **Integrity Failures** | Making assumptions about software/data integrity (e.g. unsigned updates). |
| **A09** | **Logging Failures** | Insufficient logging and monitoring to detect breaches. |
| **A10** | **SSRF** | Server-Side Request Forgery. |

## Prevention Checklist

- [ ] **Auth**: Enforce MFA; ban weak passwords.
- [ ] **Access**: Deny by default; check permissions on every request.
- [ ] **Data**: Encrypt at rest and in transit (TLS 1.2+).
- [ ] **Input**: Validate ALL input (allow-list, not block-list).
- [ ] **Deps**: Run `npm audit` or equivalent daily.
- [ ] **Config**: Remove default credentials; disable debug mode in prod.
- [ ] **Headers**: Use HSTS, CSP, X-Frame-Options.
