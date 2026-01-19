# Reference Material

## Core Principles

1.  **Never Commit Secrets**: No keys in git, ever.
2.  **Least Privilege**: Apps only get keys they need.
3.  **Rotation**: Change keys regularly (automated > manual).
4.  **Encryption**: Encrypt at rest and in transit.

## Storage Tiers

| Tier | Method | Pros | Cons |
|------|--------|------|------|
| **1** | Environment Variables | Simple, standard | Leaks in logs, no audit trail |
| **2** | Cloud Manager (AWS/GCP) | Encrypted, audit logs | Vendor lock-in, cost |
| **3** | Dedicated Vault | Dynamic secrets, multi-cloud | High complexity to run |

## Checklist

-   [ ] `.gitignore` excludes `.env` and `*.pem`
-   [ ] CI/CD pipeline uses secret injection (not hardcoded)
-   [ ] Secrets are encrypted at rest
-   [ ] Access logs enabled for secret access
-   [ ] Backup plan in case of secret loss
