# Reference Material

## Core Privacy Principles

1.  **Lawfulness, Fairness, Transparency**: Don't trick users. Be clear about what you collect.
2.  **Purpose Limitation**: Use data *only* for what you said you would.
3.  **Data Minimization**: Collect the bare minimum needed.
4.  **Accuracy**: Keep data up to date; let users correct it.
5.  **Storage Limitation**: Don't keep data forever (TTL).
6.  **Integrity & Confidentiality**: Secure the data (Encryption/Access Control).
7.  **Accountability**: Document compliance.

## User Rights (GDPR/CCPA)

| Right | Description | Implementation |
|-------|-------------|----------------|
| **Access** | User can ask "What do you know about me?" | JSON Data Export feature. |
| **Erasure (RTBF)** | "Forget me." | Delete or Anonymize script. |
| **Rectification** | "Fix my info." | Profile Edit page. |
| **Portability** | "Move my data." | CSV/JSON export in standard format. |
| **Restrict Processing** | "Stop using my data (but keep it)." | "Frozen" account state. |
| **Object** | "Stop marketing to me." | Unsubscribe/Opt-out toggle. |

## PII Classification (Example)

| Sensitivity | Examples | Handling |
|-------------|----------|----------|
| **Public** | Public username, avatar | Standard caching. |
| **Internal** | User ID, Internal logs | Access controls. |
| **Confidential (PII)** | Email, Full Name, IP | Encrypt in transit, strict access. |
| **Critical (SPII)** | SSN, Health, Biometrics, Credit Card | Component-level encryption, specialized storage (PCI-DSS). |

## Compliance Checklist

- [ ] Privacy Policy is accessible and accurate.
- [ ] Cookie Banner allows opting out of non-essential cookies.
- [ ] Marketing emails have "Unsubscribe" links.
- [ ] Data retention policies are enforced (cron jobs to clean old data).
- [ ] Vendor contracts (DPA) exist for 3rd parties (e.g. Analytics, Cloud).
