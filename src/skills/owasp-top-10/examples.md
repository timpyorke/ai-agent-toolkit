# Examples

## Vulnerability Mitigations

### Broken Access Control (A01)

#### Secure Code (Middleware)
```javascript
// Express.js middleware for RBAC
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || result.permissions.includes(requiredPermission)) {
        return next();
    }
    res.status(403).json({ error: 'Access Denied' });
  };
}

// Usage
app.delete('/api/users/:id', checkPermission('delete:user'), deleteUserHandler);
```

### Cryptographic Failures (A02)

#### Secure Password Hashing
```python
import bcrypt

# Hashing
password = b"super_secret_password"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())

# Verification
if bcrypt.checkpw(entered_password, hashed):
    print("Login successful")
else:
    print("Invalid password")
```

### Injection (A03)

#### Secure SQL Query
```javascript
// Using explicit parameters (pg-node)
const userId = req.body.id;
// VULNERABLE: const query = "SELECT * FROM users WHERE id = " + userId;
// SECURE:
const query = {
  text: 'SELECT * FROM users WHERE id = $1',
  values: [userId],
};
await pool.query(query);
```

### Server-Side Request Forgery (A04)

#### URL Validation
```python
from urllib.parse import urlparse
import ipaddress

def is_safe_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https'):
        return False
    
    hostname = parsed.hostname
    try:
        ip = ipaddress.ip_address(hostname)
        # Block private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8)
        if ip.is_private:
            return False
    except ValueError:
        pass # Hostname is not an IP, needs DNS resolution check in prod
        
    return True
```
