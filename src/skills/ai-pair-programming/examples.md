# Example Interactions

## Good Example - Feature Implementation

```
Developer: "I need to add user authentication to this API"

AI: "Let me understand the requirements first. Are you looking for:
- Token-based authentication (JWT)?
- Session-based authentication?
- OAuth integration?

Also, should I check what authentication patterns are already used
in the codebase to maintain consistency?"

Developer: "JWT, and yes, check existing patterns."

AI: [searches codebase] "I see you're using JWT in the admin API with
the 'jsonwebtoken' library. I'll follow that same pattern. Let me
outline the approach:

1. Create authentication middleware
2. Add token generation on login
3. Protect routes with the middleware
4. Add token refresh logic

Does this align with what you need?"
```

## Poor Example - Feature Implementation

```
Developer: "I need to add user authentication to this API"

AI: [immediately creates code] "Here's a complete authentication
system with OAuth, JWT, session management, and password reset..."

Developer: "Wait, I just needed basic JWT for now..."

AI: [assumes and makes large changes without understanding needs]
```
