# Reference Material

## Best Practices

### Do:

- ✅ Use established identity providers (Auth0, Cognito, Firebase Auth) where possible.
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
