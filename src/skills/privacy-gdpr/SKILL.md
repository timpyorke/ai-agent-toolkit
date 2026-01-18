---
name: privacy-gdpr
description: Implement data privacy principles (GDPR/CCPA), consent management, and data minimization
---

# 🕵️ Privacy & GDPR Skill

## Overview

This skill covers "Privacy by Design," focusing on how to handle user data respectfully and compliantly (GDPR, CCPA, etc.). It addresses data minimization, user rights (access, delete), and consent.

## Core Principles

### 1. Data Minimization
- **Collect only what you need**: Don't store "nice to have" data.
- **Keep it only as long as needed**: Implement retention policies (TTL).
- **Pseudonymization**: separate identity from behavior data.

### 2. Purpose Limitation
- Use data ONLY for the purpose the user consented to.
- Don't repurpose billing emails for marketing without opting in.

### 3. User Rights (DSRs)
Users have the right to:
- **Access**: "Download my data" (JSON export).
- **Erasure (RTBF)**: "Delete my account" (Hard delete or anonymize).
- **Rectification**: Update wrong info.
- **Portability**: Move data to another provider.

## Implementation Guide

### Handling Consent

**Database Table: `user_consents`**
| user_id | type | granted | timestamp | ip_address |
|---------|------|---------|-----------|------------|
| 123 | marketing_email | true | 2026-01-01 | 1.2.3.4 |
| 123 | third_party_sharing | false | 2026-01-01 | 1.2.3.4 |

### Implementing "Right to Erasure"

1.  **Cascading Deletes**: `DELETE FROM users WHERE id = X` cascades to orders/posts.
2.  **Anonymization** (for business records): Keep the order value, but scrub PII (name, email).

```sql
UPDATE orders 
SET customer_name = 'Deleted User', customer_email = 'deleted@example.com' 
WHERE user_id = ?
```

### Encryption at Rest
- Encrypt sensitive PII (Social Security Numbers, Health Data) at the application level or DB column level.

## Checklist

- [ ] Is every data field necessary for the feature?
- [ ] Do we have a clear lawful basis (consent/contract) for processing?
- [ ] Is there a functioning "Delete Account" button?
- [ ] Does deletion propagate to backups/logs (eventually)?
- [ ] Is PII encrypted at rest?
- [ ] Is access to user data logged and auditable?
- [ ] Do we have a Cookie Banner (if non-essential cookies used)?
