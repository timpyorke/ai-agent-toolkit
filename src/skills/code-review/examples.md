# Examples

## Comment Templates

### Issue Report

```
Severity: High
Area: Input validation in `UserController.create()`

Observation:
The email is accepted without proper validation; e.g., "user@" passes.

Recommendation:
- Use RFC 5322-compliant regex or library validator
- Add a unit test for invalid formats
- Return 400 with clear error message

References:
- OWASP Input Validation Cheat Sheet
```

### Praise

```
Nice work extracting `JwtService`! This improves testability and
centralizes token logic. The interface makes future changes cleaner.
```

### Suggestion (Non-blocking)

```
Consider renaming `process()` to `processOrder()` to make intent clearer.
Not a blocker—up to you if you prefer brevity here.
```

## Review Examples

### Good Review

**Context**: Reviewing a PR that adds a new API endpoint.

**Comment 1 (High Severity)**:
> 🔴 **Security**: This SQL query directly interpolates the `userId` parameter.
> code: `db.query("SELECT * FROM users WHERE id = " + req.params.userId)`
>
> **Action**: Please use parameterized queries to prevent SQL injection.
> `db.query("SELECT * FROM users WHERE id = ?", [req.params.userId])`

**Comment 2 (Medium Severity)**:
> 🟡 **Correctness**: The `404` error handler is missing for the case where the user is not found. Currently, it might return `200` with `null` body.
>
> **Action**: Add a check `if (!user) return res.status(404).send()`.

**Comment 3 (Low Severity/Praise)**:
> 🟢 **Maintainability**: I really like how you split the validation logic into a separate middleware. It makes the controller much cleaner! 👏

### Bad Review (Avoid)

**Comment 1**:
> "This is wrong."
> *(Why is it wrong? What is the correct way?)*

**Comment 2**:
> "Change this variable name."
> *(To what? Why is the current name bad?)*

**Comment 3**:
> "Why didn't you use library X?"
> *(Aggressive tone. Better: "Have you considered using library X? It might simplify this logic.")*

## PR Review Summary Template

```
Overall: Approve / Request Changes

Strengths:
- [List]

Concerns:
- [List]

Action Items:
- [List with severity]

Notes:
- [Non-blocking suggestions]
```
