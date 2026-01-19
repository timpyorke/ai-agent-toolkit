# Code Examples

## Authorization Implementation Pattern

**Middleware/Guard:**

```typescript
// Protect route with required permission
app.post('/api/users', requirePermission('users:create'), createUser);

function requirePermission(perm) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(perm)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```
