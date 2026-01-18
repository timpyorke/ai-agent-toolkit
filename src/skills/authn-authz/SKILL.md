---
name: authn-authz
description: Implement secure authentication flows and authorization models (RBAC/ABAC)
---

# 🔐 AuthN & AuthZ Skill

## Overview

This skill covers the implementation of Authentication (AuthN - who are you?) and Authorization (AuthZ - what can you do?). It focuses on standard protocols (OAuth2/OIDC), session management, and permission models.

## Authentication (AuthN)

### Protocols

- **OAuth 2.0**: Delegation framework (Access Tokens).
- **OIDC (OpenID Connect)**: Identity layer on top of OAuth 2.0 (ID Tokens).
- **SAML**: Legacy enterprise SSO (prefer OIDC for new apps).

### Password Management

- Enforce complexity requirements (NIST guidelines).
- Implement Multi-Factor Authentication (MFA/2FA) via TOTP or WebAuthn.
- Rate limit login attempts to prevent brute force.

### Session Management

- **JWT (Stateless)**:
  - Short-lived access tokens (e.g., 15-60 min).
  - Signed RS256/ES256 (asymmetric).
  - Need refresh token rotation for long sessions.
- **Session Cookies (Stateful)**:
  - HttpOnly, Secure, SameSite=Strict.
  - Revocable server-side.

## Authorization (AuthZ)

### Models

1. **RBAC (Role-Based Access Control)**
   - Users have Roles (`Admin`, `Editor`).
   - Roles have Permissions (`create:post`, `delete:user`).
   - Simple, widely used.

2. **ABAC (Attribute-Based Access Control)**
   - Policy based on attributes of user, resource, and environment.
   - *"User can edit Document if User.dept == Document.dept AND Time is 9-5"*
   - Fine-grained, complex.

3. **ReBAC (Relationship-Based Access Control)**
   - Graph-based permissions (like Google Zanzibar).
   - *"User can edit Document if User is member of Group that owns Document"*

### Implementation Pattern

**Middleware/Guard:**
```typescript
// Protect route with required permission
app.post('/api/users', requirePermission('users:create'), createUser);

function requirePermission(perm) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(perm)) {
      return res.status(403).json({ error: 'Forsaken' });
    }
    next();
  };
}
```

## Best Practices

### Do:
- ✅ Use established identity providers (Auth0 leading, Cognito, Firebase Auth) where possible.
- ✅ Store tokens securely (HttpOnly cookies preferred over localStorage).
- ✅ Rotate secrets and keys regularly.
- ✅ Implement "Least Privilege" defaults.

### Don't:
- ❌ Roll your own crypto or auth logic.
- ❌ Hardcode secrets/keys.
- ❌ Trust claims in unsigned/unverified tokens.
- ❌ Confuse Authentication with Authorization.

## Checklist

- [ ] Is AuthN handled by a trusted provider or standard library?
- [ ] Are passwords hashed properly (Argon2/bcrypt)?
- [ ] Is MFA available/enforced for sensitive accounts?
- [ ] Are sensitive cookies marked HttpOnly/Secure/SameSite?
- [ ] Is access denied by default (allow-list)?
- [ ] Are permissions checked at the backend (not just hidden in UI)?
