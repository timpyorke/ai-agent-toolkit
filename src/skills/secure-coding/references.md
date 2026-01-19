# Reference Material

## Security Pillars

1.  **Confidentiality**: Data is only seen by authorized users.
2.  **Integrity**: Data is not tampered with.
3.  **Availability**: Systems remain up and running.

## Vulnerability Types (OWASP)

| Type | Description | Remediation |
|------|-------------|-------------|
| **Injection** | Untrusted data executed as code (SQLi) | Parameterized queries |
| **XSS** | Malicious scripts run in browser | Context-aware output encoding |
| **Broken Auth** | Weak session management | MFA, strong hashing, secure cookies |
| **Insecure Deserialization** | Remote code execution via objects | Validate types, sign data |

## Security Headers

-   `Content-Security-Policy`: Whitelist sources of content.
-   `Strict-Transport-Security`: Enforce HTTPS.
-   `X-Frame-Options`: Prevent clickjacking.
-   `X-Content-Type-Options`: Stop MIME sniffing.
