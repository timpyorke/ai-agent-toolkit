# Examples

## Prompt Patterns

### Chain-of-Thought (CoT)
```text
Solve this problem step by step:

Problem: A user reports slow load times.
Think through this by:
1. Identifying potential layers (Frontend, Network, Backend, DB)
2. Determining how to isolate each
3. Proposing a fix

Show your reasoning.
```

### Role-Based
```text
You are a Staff Security Engineer.
Review this infrastructure code for vulnerabilities, specifically:
- IAM permission creep
- Unencrypted storage
- Publicly accessible endpoints

Infrastructure Code:
[Insert implementation]
```

### Few-Shot
```text
Convert the following raw errors into user-friendly messages.

Input: "500 Internal Server Error: Connection refused"
Output: "We're having trouble connecting to our servers. Please try again in 5 minutes."

Input: "403 Forbidden: Invalid API Token"
Output: "Your session has expired or is invalid. Please log in again."

Input: "400 Bad Request: Missing field 'email'"
Output: [AI completes this]
```

## Optimization Techniques

### Before vs After

**Before (Vague):**
> "Write a function to process data."

**After (Specific):**
> "Write a Python function named `process_customer_data`.
> Input: pandas DataFrame with columns 'id', 'purchase_amount'.
> Logic: Group by 'id', sum 'purchase_amount', and filter for sums > 1000.
> Output: a dictionary mapping 'id' to 'total_spent'.
> Include type hints and docstrings."

### Providing Context
```text
Context: We are migrating from a monolithic Rails app to Go microservices.
Task: Rewrite this User model logic in Go.
Constraints:
- Use GORM for database interactions
- Keep the same validation rules
- preserve the 'before_save' hook logic
```

## Use Cases

### Code Review
```text
Review this Pull Request.
Focus on:
1. Race conditions
2. Memory leaks
3. Adherence to Clean Code principles

Format:
- Summary of changes
- Critical issues (blockers)
- Suggestions (nits)
```

### Debugging
```text
Debug this error: `Uncaught TypeError: Cannot read property 'map' of undefined`

Context:
- React functional component
- Occurs on initial render
- Data is fetched via `useQuery` hook

Snippet:
[Insert Code]

Provide:
1. Root cause
2. The fix
```
