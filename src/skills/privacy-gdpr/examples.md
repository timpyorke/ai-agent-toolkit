# Examples

## Privacy Implementation

### Data Minimization (Schema design)

**Bad (Hoarding):**
```sql
CREATE TABLE users (
  id INT,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  mothers_maiden_name VARCHAR, -- Unnecessary
  birth_city VARCHAR -- Unnecessary
);
```

**Good (Minimized):**
```sql
CREATE TABLE users (
  id INT,
  email VARCHAR, -- Required for login
  display_name VARCHAR -- Optional
);
```

### Consent Management (Database)

```sql
CREATE TABLE user_consents (
  user_id UUID,
  consent_type VARCHAR(50), -- e.g. 'marketing_email', 'analytics_cookies'
  granted BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET, -- Audit trail
  user_agent TEXT,
  PRIMARY KEY (user_id, consent_type)
);
```

### Right to Erasure (Anonymization Script)

```python
def anonymize_user(user_id):
    """
    Hard delete PII, keep business records.
    """
    # 1. Delete authentication record
    db.execute("DELETE FROM auth_users WHERE id = %s", [user_id])
    
    # 2. Scrub orders (retain for tax purposes)
    db.execute("""
        UPDATE orders 
        SET 
            customer_name = 'Anonymized User',
            customer_email = CONCAT('anon-', id, '@deleted.com'),
            shipping_address = 'REDACTED'
        WHERE user_id = %s
    """, [user_id])
    
    # 3. Delete optional data
    db.execute("DELETE FROM user_preferences WHERE user_id = %s", [user_id])
    
    log.info(f"User {user_id} anonymized successfully.")
```

### Data Export (JSON)

```javascript
async function exportUserData(userId) {
    const profile = await db.users.find(userId);
    const orders = await db.orders.find({ userId });
    const comments = await db.comments.find({ userId });
    
    return {
        profile,
        orders,
        comments,
        exportDate: new Date().toISOString(),
        note: "This export contains all personal data we hold associated with your account."
    };
}
```
